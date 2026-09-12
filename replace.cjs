const fs = require("fs");
let code = fs.readFileSync("server.ts", "utf8");

const start = code.indexOf("const prompt = `Analizza il seguente account Instagram");
const end = code.indexOf("const parsed = JSON.parse(response.text || \"{}\");");

if (start === -1 || end === -1) {
    console.error("Could not find start or end bounds.");
    process.exit(1);
}

const replacement = `      const prompt = \`Analizza il seguente account Instagram (studio di design, architetto, artista, tipografo, agenzia o creator):
- Username Instagram: @\${cleanUsername}
\${displayName ? \`- Nome visualizzato/Titolo: \${displayName}\` : ""}
\${notes ? \`- Note contestuali dell'utente: \${notes}\` : ""}

Cerca sul web (Google Search) le informazioni più aggiornate sul loro lavoro e sito ufficiale. Identifica con precisione:
1. 'displayName': Il nome formale dello studio/artista
2. 'category': Una categoria primaria tra: "Design Grafico & Branding", "Architettura & Spazi", "Tipografia & Type Design", "3D, Motion & Generative Art", "Illustrazione & Arti Visive", "Design di Prodotto & Industriale", "Direzione Creativa & Moda", "Design Digitale & UI/UX", "Curatore, Magazine & Archivio", "Altro / Multidisciplinare"
3. 'studioType': Scegli tra "Studio di Design", "Agenzia Creativa", "Artista Singolo / Freelancer", "Fonderia Tipografica", "Studio di Architettura", "Piattaforma Editoriale"
4. 'locationCity': La città principale in cui ha sede o opera
5. 'locationCountry': Il paese (in italiano)
6. 'countryCode': Codice paese ISO 3166-1 alpha-2 in due lettere maiuscole
7. 'visualStyle': Descrizione concisa dello stile visivo e linguaggio estetico
8. 'keySpecialties': Array di 3-5 tag/parole chiave
9. 'description': Una sintesi curata (2-3 frasi fluide in italiano) che descrive chi sono e il loro approccio
10. 'website': Il dominio o sito web ufficiale o vuoto se incerto.\`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                displayName: { type: Type.STRING },
                category: { type: Type.STRING },
                studioType: { type: Type.STRING },
                locationCity: { type: Type.STRING },
                locationCountry: { type: Type.STRING },
                countryCode: { type: Type.STRING },
                visualStyle: { type: Type.STRING },
                keySpecialties: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                description: { type: Type.STRING },
                website: { type: Type.STRING },
              },
              required: [
                "displayName",
                "category",
                "studioType",
                "locationCity",
                "locationCountry",
                "countryCode",
                "visualStyle",
                "keySpecialties",
                "description",
              ],
            },
          },
        });
      } catch (firstErr: any) {
        console.log(\`Primary model failed for \${cleanUsername}, falling back without search:\`, firstErr.message);
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                displayName: { type: Type.STRING },
                category: { type: Type.STRING },
                studioType: { type: Type.STRING },
                locationCity: { type: Type.STRING },
                locationCountry: { type: Type.STRING },
                countryCode: { type: Type.STRING },
                visualStyle: { type: Type.STRING },
                keySpecialties: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                description: { type: Type.STRING },
                website: { type: Type.STRING },
              },
              required: [
                "displayName",
                "category",
                "studioType",
                "locationCity",
                "locationCountry",
                "countryCode",
                "visualStyle",
                "keySpecialties",
                "description",
              ],
            },
          },
        });
      }

      `;

code = code.substring(0, start) + replacement + code.substring(end);

const afterParsedStart = code.indexOf("return res.json({");
const replacementAfterParsed = `
      // SECONDARY CALL: Maps Grounding
      let locationState = "";
      let locationRegion = "";
      let locationStreet = "";
      let mapsLinks: string[] = [];

      if (parsed.displayName && parsed.locationCity) {
        try {
          const mapsPrompt = \`Trova l'indirizzo esatto e la sede principale per: "\${parsed.displayName}" situato a \${parsed.locationCity}, \${parsed.locationCountry}.
Restituisci SOLO un blocco JSON compatto (senza testo extra o backtick markdown) con questa esatta struttura:
{"locationState": "Stato/Provincia (es. CA, NY, MI, ecc)", "locationRegion": "Regione (es. Lombardia)", "locationStreet": "Via esatta e civico"}\`;
          
          const mapsResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: mapsPrompt,
            config: {
              tools: [{ googleMaps: {} }],
            }
          });

          const mapsText = (mapsResponse.text || "").replace(/\`\`\`(json)?/g, "").trim();
          try {
            const mapsParsed = JSON.parse(mapsText);
            locationState = mapsParsed.locationState || "";
            locationRegion = mapsParsed.locationRegion || "";
            locationStreet = mapsParsed.locationStreet || "";
          } catch (e) {
            console.log("Failed to parse Maps JSON (non-fatal):", mapsText);
          }

          const chunks = mapsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks && Array.isArray(chunks)) {
            chunks.forEach((chunk: any) => {
              if (chunk.maps?.uri) mapsLinks.push(chunk.maps.uri);
              if (chunk.maps?.placeAnswerSources?.reviewSnippets) {
                 chunk.maps.placeAnswerSources.reviewSnippets.forEach((rs: any) => {
                   if (rs.uri) mapsLinks.push(rs.uri);
                 });
              }
            });
          }
        } catch (mapsErr: any) {
          console.log(\`Maps grounding failed for \${parsed.displayName}:\`, mapsErr.message);
        }
      }

      return res.json({
        username: cleanUsername,
        ...parsed,
        locationState,
        locationRegion,
        locationStreet,
        mapsLinks,
`;
code = code.substring(0, afterParsedStart) + replacementAfterParsed + code.substring(afterParsedStart + "return res.json({\n        username: cleanUsername,\n        ...parsed,".length);

fs.writeFileSync("server.ts", code);
console.log("Replaced successfully!");

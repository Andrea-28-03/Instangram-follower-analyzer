import React, { useState } from "react";
import { Download, Copy, X, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { InstagramProfile } from "../types";
import { downloadJSONData } from "../utils/exportUtils";

interface ExportGeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: InstagramProfile[];
}

export const ExportGeminiModal: React.FC<ExportGeminiModalProps> = ({ isOpen, onClose, profiles }) => {
  const [batchSize, setBatchSize] = useState(100);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const pendingProfiles = profiles
    .filter(p => !p.isAnalyzed)
    .map(p => ({
      username: p.username,
      instagramUrl: p.profileUrl || `https://instagram.com/${p.username}`,
      displayName: p.displayName || "",
      notes: p.notes || ""
    }));

  const chunks = [];
  for (let i = 0; i < pendingProfiles.length; i += batchSize) {
    chunks.push(pendingProfiles.slice(i, i + batchSize));
  }

  const generatePromptText = (chunkIndex: number) => {
    return `Sei un analista esperto nella classificazione e ricerca di account Instagram.
Ti sto allegando un file JSON (lotto ${chunkIndex + 1}) contenente un elenco di profili Instagram, inclusi i loro URL ufficiali (instagramUrl).
Per ciascun profilo, usa la funzione Web Search per trovare la sua reale bio pubblica, cercare il link al suo sito web ufficiale e il contesto (es. tramite Linktree, sito web o profili social correlati) per capire ESATTAMENTE chi sono e cosa fanno. Usa le informazioni trovate nel sito web, se presente, per un'analisi più precisa.

REGOLE CONTRO LE ALLUCINAZIONI (MOLTO IMPORTANTE):
Nella lista NON ci sono solo studi di design o artisti. Ci sono anche persone comuni, amici, istituzioni, università, ristoranti, influencer e brand generici.
Se un profilo è di un amico, un conoscente, una persona privata, o non trovi alcuna informazione pubblica rilevante, NON inventare professioni creative. Piuttosto lascia i campi vuoti (stringa vuota "") o usa la categoria "Persona Privata". Preferisco avere campi vuoti piuttosto che dati inventati. Non dedurre la professione solo dal nome.

Restituisci SOLO ED ESCLUSIVAMENTE un array JSON valido (nessun markdown, nessuna formattazione extra) con questa esatta struttura per ogni oggetto:

[
  {
    "username": "...",
    "aiAnalysis": {
      "displayName": "Nome reale completo o nome del brand. Se persona privata senza nome noto, lascia vuoto.",
      "category": "Una tra: 'Design & Arte', 'Persona Privata / Amico', 'Content Creator / Influencer', 'Brand / Negozio / Azienda', 'Istituzione / Università / Scuola', 'Musica & Spettacolo', 'Fotografia', 'Altro'",
      "studioType": "Specifica meglio (es. 'Profilo Personale', 'Agenzia Creativa', 'Università', 'Ristorante', 'Fashion Blogger'). Se incerto, lascia vuoto.",
      "locationCity": "Città principale (se pubblicamente indicata, altrimenti lascia vuoto)",
      "locationCountry": "Paese in italiano (se indicato, altrimenti lascia vuoto)",
      "countryCode": "Codice ISO 2 lettere (es. IT, US, GB) o vuoto",
      "locationState": "Stato/Regione (opzionale)",
      "locationRegion": "Regione (opzionale)",
      "locationStreet": "Via (opzionale)",
      "visualStyle": "Se è un brand/creativo descrivi lo stile in 1 frase. Se è un amico/istituzione, lascia vuoto.",
      "keySpecialties": ["tag1", "tag2"], // Array di max 3 tag descrittivi reali
      "description": "Breve sintesi FATTUALE (1-2 frasi) di chi sono, basata SOLO sulle info trovate. Se non c'è nulla, lascia vuoto.",
      "website": "Sito web ufficiale (se presente)"
    }
  }
]

Assicurati che l'output sia formattato ESATTAMENTE come l'esempio JSON qui sopra. Non omettere assolutamente nessun profilo presente nel file JSON allegato.`;
  };

  const handleCopyAndDownload = (chunk: any[], index: number) => {
    const prompt = generatePromptText(index);
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);

    downloadJSONData(chunk, `gemini_lotto_${index + 1}.json`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#0a0a0b] border border-[#26262b] rounded-lg shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#26262b]">
          <div>
            <h2 className="text-lg font-medium text-[#e2e2e2]">Analisi Offline con Gemini Advanced</h2>
            <p className="text-sm text-[#8e8e9a] mt-1">Dividi i profili in lotti per evitare limiti di memoria</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#8e8e9a] hover:text-white hover:bg-[#1a1a1f] rounded-sm transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {pendingProfiles.length === 0 ? (
            <div className="p-4 bg-[#1a1a1f] border border-[#26262b] rounded-sm flex items-start gap-3 text-[#c5a059]">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Tutto analizzato!</h3>
                <p className="text-sm text-[#8e8e9a] mt-0.5">Non ci sono profili in attesa di analisi nel database.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="flex gap-4">
                <div className="w-1/2 p-4 bg-[#1a1a1f] border border-[#26262b] rounded-sm">
                  <div className="text-sm font-medium text-[#e2e2e2] mb-3">1. Seleziona dimensione lotto</div>
                  <div className="flex gap-2">
                    {[50, 100, 150].map(size => (
                      <button
                        key={size}
                        onClick={() => setBatchSize(size)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-sm border transition ${
                          batchSize === size 
                            ? "bg-[#2a2a32] text-[#c5a059] border-[#c5a059]" 
                            : "bg-[#0a0a0b] text-[#8e8e9a] border-[#26262b] hover:border-[#3f3f46]"
                        }`}
                      >
                        {size} profili
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#6b6b76] mt-3">
                    Lotti fino a 100 profili sono sicuri. Lotti da 150 o più rischiano di superare i limiti di lunghezza dell'output di Gemini, causando file troncati a metà.
                  </p>
                </div>
                
                <div className="w-1/2 p-4 bg-[#1a1a1f] border border-[#26262b] rounded-sm">
                  <div className="text-sm font-medium text-[#e2e2e2] mb-2">2. Procedura per lotto</div>
                  <ol className="text-xs text-[#8e8e9a] space-y-1.5 list-decimal pl-4">
                    <li>Clicca il pulsante del lotto</li>
                    <li>Verrà copiato il prompt e scaricato il JSON</li>
                    <li>Incolla il prompt in Gemini</li>
                    <li>Allega il file JSON scaricato</li>
                  </ol>
                </div>
              </div>

              {/* Batches list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[#e2e2e2]">
                    Lotti pronti ({chunks.length})
                  </h3>
                  <span className="text-xs text-[#8e8e9a] bg-[#1a1a1f] px-2 py-1 rounded-sm">
                    {pendingProfiles.length} profili totali
                  </span>
                </div>
                
                <div className="space-y-2">
                  {chunks.map((chunk, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#0a0a0b] border border-[#26262b] rounded-sm hover:border-[#3f3f46] transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1a1a1f] text-[#8e8e9a] flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#e2e2e2]">Lotto {index + 1}</div>
                          <div className="text-[11px] text-[#6b6b76]">{chunk.length} profili</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleCopyAndDownload(chunk, index)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#c5a059] text-black hover:bg-[#d4b472] rounded-sm transition cursor-pointer"
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Copiato & Scaricato!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Scarica JSON & Copia Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-sm flex gap-3 text-blue-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Una volta ottenuto il file di risposta da Gemini, salvalo come .json e usa la funzione <strong>"Importa analisi (.json)"</strong> nel menu Esporta.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#26262b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-[#1a1a1f] text-[#e2e2e2] hover:bg-[#2a2a32] rounded-sm transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

import * as XLSX from "xlsx";
import { InstagramProfile } from "../types";

export function formatProfileForExport(profile: InstagramProfile) {
  const ai = profile.aiAnalysis;
  return {
    "Username": `@${profile.username}`,
    "Link Instagram": profile.profileUrl,
    "Nome Studio / Artista": ai?.displayName || profile.displayName || profile.username,
    "Categoria": ai?.category || "Non categorizzato",
    "Tipologia": ai?.studioType || "Da definire",
    "Città": ai?.locationCity || "Non specificata",
    "Nazione": ai?.locationCountry || "Non specificata",
    "Codice ISO": ai?.countryCode || "",
    "Stile Visivo & Linguaggio": ai?.visualStyle || "",
    "Specialità & Tag": ai?.keySpecialties ? ai.keySpecialties.join(", ") : "",
    "Descrizione & Valore (Gemini)": ai?.description || "",
    "Sito Web": ai?.website ? (ai.website.startsWith("http") ? ai.website : `https://${ai.website}`) : "",
    "Valutazione (Stelle 1-5)": profile.rating || "",
    "Nei Preferiti": profile.isFavorite ? "Sì" : "No",
    "Note Personali": profile.notes || "",
    "Stato Analisi AI": profile.isAnalyzed ? "Analizzato" : "In attesa",
    "Data Analisi": ai?.analyzedAt ? new Date(ai.analyzedAt).toLocaleDateString("it-IT") : "",
  };
}

export function exportToExcel(profiles: InstagramProfile[], filename = "instagram_seguiti_design_db.xlsx") {
  const data = profiles.map(formatProfileForExport);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 18 }, // Username
    { wch: 32 }, // Link Instagram
    { wch: 28 }, // Nome Studio
    { wch: 26 }, // Categoria
    { wch: 22 }, // Tipologia
    { wch: 18 }, // Città
    { wch: 18 }, // Nazione
    { wch: 12 }, // Codice ISO
    { wch: 40 }, // Stile Visivo
    { wch: 35 }, // Specialità
    { wch: 55 }, // Descrizione
    { wch: 24 }, // Sito Web
    { wch: 15 }, // Valutazione
    { wch: 12 }, // Preferiti
    { wch: 30 }, // Note Personali
    { wch: 16 }, // Stato Analisi
    { wch: 14 }, // Data
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Studi & Profili");
  XLSX.writeFile(workbook, filename);
}

export function exportToCSV(profiles: InstagramProfile[], filename = "instagram_seguiti_design_db.csv") {
  const data = profiles.map(formatProfileForExport);
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const val = (item as any)[header] ?? "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",");
  });

  // Include UTF-8 BOM so Excel opens Italian accents without encoding errors
  const csvContent = "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboardTSV(profiles: InstagramProfile[]): Promise<void> {
  const data = profiles.map(formatProfileForExport);
  if (data.length === 0) return Promise.resolve();

  const headers = Object.keys(data[0]);
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const val = (item as any)[header] ?? "";
        return String(val).replace(/[\t\r\n]+/g, " ");
      })
      .join("\t");
  });

  const tsv = [headers.join("\t"), ...rows].join("\n");
  return navigator.clipboard.writeText(tsv);
}

export function exportToJSON(profiles: InstagramProfile[], filename = "instagram_design_database_backup.json") {
  const jsonStr = JSON.stringify(profiles, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSONData(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

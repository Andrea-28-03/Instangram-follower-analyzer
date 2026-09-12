import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  ChevronDown,
  Settings,
  Trash2,
  Eraser,
  Database,
} from "lucide-react";
import { InstagramProfile } from "../types";
import { exportToExcel, exportToCSV, copyToClipboardTSV, exportToJSON, exportForGeminiPro } from "../utils/exportUtils";

interface HeaderProps {
  profiles: InstagramProfile[];
  onOpenImport: () => void;
  onResetToSample: () => void;
  onClearAnalyses: () => void;
  onClearAllProfiles: () => void;
  onImportGeminiPro: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenExportGemini: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profiles,
  onOpenImport,
  onResetToSample,
  onClearAnalyses,
  onClearAllProfiles,
  onImportGeminiPro,
  onOpenExportGemini,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const totalCount = profiles.length;
  const analyzedCount = profiles.filter((p) => p.isAnalyzed).length;
  const pendingCount = totalCount - analyzedCount;
  const countriesCount = new Set(
    profiles.map((p) => p.aiAnalysis?.locationCountry).filter(Boolean)
  ).size;
  const favoritesCount = profiles.filter((p) => p.isFavorite).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyTSV = async () => {
    await copyToClipboardTSV(profiles);
    setCopiedNotification(true);
    setShowExportMenu(false);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <header className="bg-[#0a0a0b] border-b border-[#26262b] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-2xl italic text-[#c5a059]">
                  Curator AI
                </h1>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b76] mt-1">
                Instagram Intelligence
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {/* Import Button */}
            <button
              id="import-btn"
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-[#8e8e9a] bg-[#16161a] hover:bg-[#1c1c22] border border-[#26262b] transition cursor-pointer"
              title="Importa da file JSON di Instagram o incolla lista"
            >
              <Upload className="w-3.5 h-3.5 text-[#6b6b76]" />
              <span>Importa / Aggiungi</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                id="export-dropdown-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={totalCount === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-medium bg-[#16161a] hover:bg-[#1c1c22] border border-[#26262b] text-[#e2e2e2] transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Esporta</span>
                <ChevronDown className="w-3 h-3 text-[#6b6b76]" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-56 bg-[#121216] rounded shadow-lg border border-[#26262b] py-1.5 z-40 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#6b6b76] mb-1">
                    Formati di Esportazione
                  </div>
                  <button
                    id="export-excel-btn"
                    onClick={() => {
                      exportToExcel(profiles);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Foglio Excel (.xlsx)</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        File XLSX formattato con colonne
                      </div>
                    </div>
                  </button>

                  <button
                    id="export-csv-btn"
                    onClick={() => {
                      exportToCSV(profiles);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">File CSV (UTF-8)</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Compatibile con Excel e Sheets
                      </div>
                    </div>
                  </button>

                  <button
                    id="export-clipboard-btn"
                    onClick={handleCopyTSV}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Copia per Google Sheets</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Incolla direttamente in un foglio
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-[#26262b]" />

                  <button
                    id="export-json-btn"
                    onClick={() => {
                      exportToJSON(profiles);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Backup Database (.json)</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Archivio completo re-importabile
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-[#26262b]" />
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#6b6b76] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#c5a059]" />
                    <span>Analisi Offline (Pro)</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      onOpenExportGemini();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Dividi ed Esporta</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Prepara lotti per Gemini Pro
                      </div>
                    </div>
                  </button>

                  <label className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer">
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={(e) => {
                        onImportGeminiPro(e);
                        setShowExportMenu(false);
                      }} 
                    />
                    <Upload className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Importa analisi (.json)</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Carica risultati offline
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-[#8e8e9a] hover:text-white bg-[#16161a] hover:bg-[#1c1c22] border border-[#26262b] transition cursor-pointer shadow-xs"
                title="Gestione Dati"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Gestisci</span>
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-[#121216] rounded shadow-lg border border-[#26262b] py-1.5 z-40 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#6b6b76] mb-1">
                    Gestione Dati
                  </div>
                  
                  <button
                    onClick={() => {
                      onClearAnalyses();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] hover:text-[#c5a059] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Eraser className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Svuota Analisi</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Rimuove i dati AI dai profili
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClearAllProfiles();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Elimina Tutti i Profili</div>
                      <div className="text-[11px] text-red-400/70">
                        Svuota completamente il database
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-[#26262b]" />

                  <button
                    onClick={() => {
                      onResetToSample();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#e2e2e2] hover:bg-[#1c1c22] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#8e8e9a]" />
                    <div>
                      <div className="font-medium">Ripristina Esempi</div>
                      <div className="text-[11px] text-[#6b6b76]">
                        Carica il dataset di studi iniziali
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Copied Notification Banner */}
        {copiedNotification && (
          <div className="mt-2 py-1.5 px-3 bg-[#1c1c22] border border-[#c5a059] rounded-sm text-xs text-[#c5a059] flex items-center gap-2 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>
              Tabella copiata negli appunti! Ora puoi incollarla direttamente con Ctrl+V in Google Sheets o Excel.
            </span>
          </div>
        )}

        {/* Quick Metrics Strip */}
        <div className="mt-3 pt-2.5 border-t border-[#26262b] flex items-center gap-4 sm:gap-6 text-xs text-[#6b6b76] overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl font-light text-white">{totalCount}</span>
            <span className="uppercase tracking-widest text-[10px]">Followed</span>
          </div>
          <div className="h-6 w-[1px] bg-[#26262b]"></div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl font-light text-white">{analyzedCount}</span>
            <span className="uppercase tracking-widest text-[10px]">Analyzed</span>
          </div>
          {pendingCount > 0 && (
            <>
              <div className="h-6 w-[1px] bg-[#26262b]"></div>
              <div className="flex items-center gap-1.5 shrink-0 text-[#c5a059]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
                <span className="uppercase tracking-widest text-[10px]">{pendingCount} Pending</span>
              </div>
            </>
          )}
          <div className="h-6 w-[1px] bg-[#26262b]"></div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl font-light text-white">{countriesCount}</span>
            <span className="uppercase tracking-widest text-[10px]">Regions</span>
          </div>
          <div className="h-6 w-[1px] bg-[#26262b]"></div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl font-light text-white">{favoritesCount}</span>
            <span className="uppercase tracking-widest text-[10px]">Curated</span>
          </div>
        </div>
      </div>
    </header>
  );
};

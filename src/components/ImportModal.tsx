import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  FileCode,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { parseInstagramData } from "../utils/instagramParser";
import { InstagramProfile } from "../types";
import { INITIAL_STUDIOS } from "../data/initialStudios";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newProfiles: InstagramProfile[], replace: boolean) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<"file" | "paste" | "guide">("file");
  const [pastedText, setPastedText] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessText = (content: string, fileName?: string) => {
    try {
      setErrorMsg(null);
      const parsed = parseInstagramData(content, fileName);
      if (parsed.length === 0) {
        setErrorMsg("Nessun profilo Instagram valido trovato nel contenuto inserito.");
        return;
      }
      setSuccessCount(parsed.length);
      setTimeout(() => {
        onImport(parsed, replaceExisting);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(`Errore durante l'elaborazione del file: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Impossibile leggere il file selezionato.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handlePastedSubmit = () => {
    if (!pastedText.trim()) {
      setErrorMsg("Inserisci almeno un username o link Instagram.");
      return;
    }
    handleProcessText(pastedText);
  };

  const handleLoadSample = () => {
    onImport(INITIAL_STUDIOS, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-stone-900">
              Importa profili seguiti da Instagram
            </h2>
            <p className="text-xs text-stone-500">
              Importa il file ufficiale di Instagram o incolla una lista di handle
            </p>
          </div>
          <button
            id="close-import-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-white px-6 gap-6 text-xs font-medium">
          <button
            id="tab-file-btn"
            onClick={() => {
              setActiveTab("file");
              setErrorMsg(null);
            }}
            className={`py-3 border-b-2 cursor-pointer transition ${
              activeTab === "file"
                ? "border-indigo-600 text-indigo-700 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            File Ufficiale (JSON / HTML)
          </button>
          <button
            id="tab-paste-btn"
            onClick={() => {
              setActiveTab("paste");
              setErrorMsg(null);
            }}
            className={`py-3 border-b-2 cursor-pointer transition ${
              activeTab === "paste"
                ? "border-indigo-600 text-indigo-700 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Incolla Nomi / Handle
          </button>
          <button
            id="tab-guide-btn"
            onClick={() => {
              setActiveTab("guide");
              setErrorMsg(null);
            }}
            className={`py-3 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
              activeTab === "guide"
                ? "border-indigo-600 text-indigo-700 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guida Meta (1 minuto)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Estratti con successo {successCount} profili! Caricamento in corso...
              </span>
            </div>
          )}

          {/* TAB 1: FILE DRAG & DROP */}
          {activeTab === "file" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-stone-300 hover:border-stone-400 bg-stone-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,.html,.txt"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    Trascina qui il file <code className="text-xs bg-stone-200 px-1 py-0.5 rounded text-indigo-700 font-mono">following.json</code>
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    oppure clicca per selezionarlo dal computer (.json, .html, .txt)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Supporta export ufficiale Meta Accounts Center</span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-stone-800">
                    Non hai ancora scaricato il file da Instagram?
                  </p>
                  <p className="text-stone-500">
                    Instagram permette a ogni utente di scaricare l'elenco esatto delle persone seguite.
                    Controlla la tab <strong>"Guida Meta"</strong> per vedere i 3 semplici passaggi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INCOLLA TESTO */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-stone-700">
                Incolla handle o link Instagram (uno per riga o separati da virgola):
              </label>
              <textarea
                id="paste-textarea"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`@pentagramdesign\n@studiodumbar\nhttps://www.instagram.com/bureauborsche/\nnormarchitects\nstudiofeixen\nformafantasma`}
                rows={7}
                className="w-full text-xs font-mono p-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[11px] text-stone-500">
                Puoi incollare sia username singoli (con o senza @) che URL completi di Instagram.
              </p>
              <button
                id="process-pasted-btn"
                onClick={handlePastedSubmit}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                Estrai e Aggiungi Profili
              </button>
            </div>
          )}

          {/* TAB 3: GUIDA META / HOW TO DOWNLOAD */}
          {activeTab === "guide" && (
            <div className="space-y-3 text-xs text-stone-700">
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 space-y-1.5">
                <div className="font-semibold text-indigo-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Come ottenere l'export ufficiale dei seguiti da Instagram</span>
                </div>
                <p className="text-indigo-800/80 leading-relaxed">
                  Per tutelare la privacy e le policy di Meta, Instagram non fornisce API pubbliche aperte per leggere i seguiti privati, ma mette a disposizione lo strumento nativo e istantaneo per esportarli in formato JSON:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">
                      Apri il Centro gestione account Meta
                    </div>
                    <div className="text-stone-500 mt-0.5">
                      Su Instagram (da app o da instagram.com), vai su <strong>Impostazioni</strong> &rarr; <strong>Centro gestione account</strong> (Meta Accounts Center).
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">
                      Scarica le tue informazioni
                    </div>
                    <div className="text-stone-500 mt-0.5">
                      Clicca su <strong>"Le tue informazioni e autorizzazioni"</strong> &rarr; <strong>"Scarica le tue informazioni"</strong> &rarr; <strong>"Scarica o trasferisci informazioni"</strong>.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">
                      Scegli "Follower e profili seguiti" in formato JSON
                    </div>
                    <div className="text-stone-500 mt-0.5">
                      Scegli il tuo account, seleziona <strong>"Alcune informazioni"</strong> &rarr; spunta <strong>"Follower e profili seguiti"</strong>. Come formato scegli <strong>JSON</strong> (oppure HTML).
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">
                      Scarica il file e trascinalo qui!
                    </div>
                    <div className="text-stone-500 mt-0.5">
                      Meta invierà il link per il download entro pochissimi minuti. All'interno dello zip troverai la cartella <code>connections/followers_and_following/following.json</code>. Trascinalo nella prima tab!
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href="https://accountscenter.instagram.com/info_and_permissions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <span>Apri Centro Gestione Account Meta</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Import mode options */}
          <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Sostituisci la lista attuale (invece di unire i profili)</span>
            </label>

            <button
              id="load-sample-btn"
              onClick={handleLoadSample}
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Carica 15 studi di design curati d'esempio</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

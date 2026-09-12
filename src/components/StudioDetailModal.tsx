import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Star,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import { InstagramProfile } from "../types";

interface StudioDetailModalProps {
  profile: InstagramProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNotes: (id: string, notes: string, rating: number) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onResetProfileAnalysis: (id: string) => void;
  onMarkAsPrivate: (id: string) => void;
}

export const StudioDetailModal: React.FC<StudioDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateNotes,
  onToggleFavorite,
  onDelete,
  onResetProfileAnalysis,
  onMarkAsPrivate,
}) => {
  if (!isOpen || !profile) return null;

  const ai = profile.aiAnalysis;
  const studioName = ai?.displayName || profile.displayName || profile.username;

  const [notes, setNotes] = useState(profile.notes || "");
  const [rating, setRating] = useState(profile.rating || 0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(profile.id, notes, rating);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0b]/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#121216] rounded-sm shadow-2xl border border-[#26262b] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#26262b] flex items-start justify-between bg-[#0f0f11]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#8e8e9a]">@{profile.username}</span>
              {ai?.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b]">
                  {ai.category}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              {studioName}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(profile.id)}
              className="p-2 text-[#44444a] hover:text-[#c5a059] transition cursor-pointer"
              title={profile.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            >
              <Star
                className={`w-5 h-5 ${
                  profile.isFavorite
                    ? "text-[#c5a059] fill-[#c5a059]"
                    : "text-[#44444a] hover:text-[#d4b57a]"
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-sm text-[#6b6b76] hover:text-white hover:bg-[#1c1c22] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Links & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-sm bg-[#16161a] border border-[#26262b]">
            <div className="flex items-center gap-3">
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#c5a059] hover:text-[#d4b57a]"
              >
                <span>Vedi su Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {ai?.website && (
                <a
                  href={ai.website.startsWith("http") ? ai.website : `https://${ai.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#e2e2e2] hover:text-[#c5a059]"
                >
                  <Globe className="w-3.5 h-3.5 text-[#6b6b76]" />
                  <span>{ai.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>

            {(ai?.locationCity || ai?.locationCountry) && (
              <a 
                href={ai.mapsLinks && ai.mapsLinks.length > 0 ? ai.mapsLinks[0] : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ai.displayName} ${ai.locationCity} ${ai.locationCountry}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title={ai.locationStreet ? `${ai.locationStreet}, ${ai.locationCity}, ${ai.locationState || ai.locationRegion} ${ai.locationCountry}` : "Apri in Google Maps"}
                className="flex items-center gap-1 text-[#e2e2e2] hover:text-[#c5a059] font-medium bg-[#1a1a1f] px-2.5 py-1 rounded-sm border border-[#26262b] hover:border-[#c5a059] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8e8e9a]" />
                <span>
                  {ai.locationCity ? `${ai.locationCity}, ` : ""}
                  {ai.locationCountry}
                  {ai.countryCode ? ` (${ai.countryCode})` : ""}
                </span>
              </a>
            )}
          </div>

          {/* Gemini AI Dossier */}
          {ai ? (
            <div className="space-y-4">
              {/* Visual Style & Language */}
              <div className="p-4 rounded-sm bg-[#16161a] border border-[#c5a059]/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#c5a059] font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Stile Visivo, Linguaggio & Ricerca Estetica</span>
                </div>
                <p className="text-[#e2e2e2] leading-relaxed text-xs">
                  {ai.visualStyle}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-semibold text-[10px] uppercase tracking-widest text-[#6b6b76]">
                  Descrizione Curata & Valore Progettuale
                </h4>
                <p className="text-[#8e8e9a] leading-relaxed text-xs">
                  {ai.description}
                </p>
              </div>

              {/* Specialties / Tags */}
              {ai.keySpecialties && ai.keySpecialties.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-[10px] uppercase tracking-widest text-[#6b6b76]">
                    Aree di Specialità & Keyword
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ai.keySpecialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-sm text-xs bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b] font-medium"
                      >
                        #{spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-sm bg-[#16161a] border border-[#26262b] text-center space-y-2">
              <p className="font-medium text-white">
                Questo profilo non è ancora stato analizzato da Gemini AI.
              </p>
              <p className="text-[#6b6b76] text-xs">
                Clicca sul pulsante sottostante per ricavare automaticamente la categoria, la sede geografica e lo stile visivo.
              </p>
            </div>
          )}

          {/* Personal Rating & Notes */}
          <div className="pt-3 border-t border-[#26262b] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">
                La tua valutazione d'ispirazione:
              </span>
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(rating === starVal ? 0 : starVal)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        starVal <= rating
                          ? "text-[#c5a059] fill-[#c5a059]"
                          : "text-[#44444a] hover:text-[#d4b57a]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white text-xs mb-1">
                Note personali & idee di progetto (salvate nel database):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Aggiungi riferimenti su specifici progetti visti nel loro feed, spunti per moodboard, contatti o note di viaggio..."
                rows={3}
                className="w-full p-2.5 text-xs bg-[#16161a] text-[#e2e2e2] border border-[#26262b] rounded-sm focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c5a059] hover:bg-[#d4b57a] text-[#0a0a0b] rounded-sm font-medium text-xs transition cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salva Note & Valutazione</span>
              </button>

              {savedSuccess && (
                <span className="text-xs text-[#c5a059] font-medium">
                  Salvate con successo!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0f0f11] border-t border-[#26262b] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Rimuovere @${profile.username} dal database?`)) {
                onDelete(profile.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Elimina</span>
          </button>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-[#8e8e9a] hover:text-white hover:bg-[#1c1c22] rounded-sm transition cursor-pointer"
              >
                Chiudi
              </button>
              {profile.aiAnalysis?.category !== "Persona Privata / Amico" && (
                <button
                  onClick={() => onMarkAsPrivate(profile.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1a1f] hover:bg-[#2a2a32] text-red-400 border border-red-400/30 rounded-sm font-medium text-xs transition cursor-pointer shadow-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-x"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
                  <span>Imposta Privato</span>
                </button>
              )}
              {profile.isAnalyzed && (
                <button
                  onClick={() => onResetProfileAnalysis(profile.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1a1f] hover:bg-[#2a2a32] text-orange-400 border border-orange-400/30 rounded-sm font-medium text-xs transition cursor-pointer shadow-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  <span>Smarca per Rianalisi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

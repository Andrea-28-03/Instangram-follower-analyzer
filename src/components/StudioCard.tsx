import React from "react";
import {
  ExternalLink,
  Sparkles,
  Star,
  MapPin,
  Globe,
  Loader2,
  Bookmark,
} from "lucide-react";
import { InstagramProfile } from "../types";
import { ProfilePreview } from "./ProfilePreview";

interface StudioCardProps {
  profile: InstagramProfile;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onResetProfileAnalysis: () => void;
  onMarkAsPrivate: () => void;
}

export const StudioCard: React.FC<StudioCardProps> = ({
  profile,
  onSelect,
  onToggleFavorite,
  onResetProfileAnalysis,
  onMarkAsPrivate,
}) => {
  const ai = profile.aiAnalysis;
  const studioName = ai?.displayName || profile.displayName || profile.username;

  return (
    <div
      onClick={onSelect}
      className="bg-[#121216] rounded-sm border border-[#26262b] hover:border-[#c5a059] p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer relative"
    >
      {/* Top row: Category, Location & Favorite */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {ai?.category ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b]">
                {ai.category}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter text-[#6b6b76] bg-[#1a1a1f] border border-[#26262b]">
                Non categorizzato
              </span>
            )}

            {(ai?.locationCity || ai?.locationCountry) && (
              <a
                href={ai.mapsLinks && ai.mapsLinks.length > 0 ? ai.mapsLinks[0] : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ai.displayName} ${ai.locationCity} ${ai.locationCountry}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b] hover:border-[#c5a059] hover:text-[#c5a059] transition-colors group/map"
                title={ai.locationStreet ? `${ai.locationStreet}, ${ai.locationCity}, ${ai.locationState || ai.locationRegion} ${ai.locationCountry}` : "Apri in Google Maps"}
              >
                <MapPin className="w-2.5 h-2.5 text-[#6b6b76] group-hover/map:text-[#c5a059] shrink-0" />
                <span className="truncate max-w-[120px]">
                  {ai.locationCity ? `${ai.locationCity}, ` : ""}
                  {ai.locationCountry}
                </span>
              </a>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1 text-[#44444a] hover:text-[#c5a059] transition cursor-pointer"
            title={profile.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          >
            <Star
              className={`w-4 h-4 ${
                profile.isFavorite
                  ? "text-[#c5a059] fill-[#c5a059]"
                  : "text-[#44444a] hover:text-[#d4b57a]"
              }`}
            />
          </button>
        </div>

        {/* Studio Name & Handle */}
        <div className="mb-2.5">
          <ProfilePreview profile={profile}>
            <h3 className="font-semibold text-base text-white leading-snug group-hover:text-[#c5a059] transition-colors inline-block cursor-help">
              {studioName}
            </h3>
          </ProfilePreview>
          <div className="flex items-center gap-2 mt-0.5">
            <ProfilePreview profile={profile}>
              <span className="text-xs font-mono text-[#8e8e9a] cursor-help hover:text-[#c5a059] transition-colors">
                @{profile.username}
              </span>
            </ProfilePreview>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#6b6b76] hover:text-[#c5a059] transition inline-flex items-center gap-0.5 text-[11px]"
              title="Apri su Instagram"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
            {ai?.website && (
              <a
                href={ai.website.startsWith("http") ? ai.website : `https://${ai.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#6b6b76] hover:text-[#c5a059] transition inline-flex items-center gap-0.5 text-[11px]"
                title="Sito web ufficiale"
              >
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{ai.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        </div>

        {/* Visual Style & Description */}
        {ai ? (
          <div className="space-y-2 mb-3">
            {ai.visualStyle && (
              <div className="p-2.5 rounded-sm bg-[#1a1a1f] border border-[#26262b] text-xs text-[#8e8e9a] leading-relaxed">
                <span className="block text-[10px] mb-0.5 text-[#6b6b76] uppercase tracking-widest">
                  Linguaggio visivo & stile
                </span>
                <p className="line-clamp-2 text-[#e2e2e2]">{ai.visualStyle}</p>
              </div>
            )}

            {ai.description && (
              <p className="text-xs text-[#8e8e9a] line-clamp-2 leading-relaxed">
                {ai.description}
              </p>
            )}

            {/* Specialties */}
            {ai.keySpecialties && ai.keySpecialties.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {ai.keySpecialties.slice(0, 4).map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-sm text-[10px] bg-[#16161a] border border-[#26262b] text-[#8e8e9a] font-medium"
                  >
                    #{spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-sm bg-[#1a1a1f] border border-[#26262b] text-center text-xs text-[#8e8e9a] my-3">
            <p className="font-medium text-white">Profilo non ancora analizzato</p>
            <p className="text-[11px] mt-0.5 text-[#6b6b76]">
              Clicca su "Analizza con Gemini" per identificare stile, posizione e categoria.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar: Action & Status */}
      <div className="pt-3 border-t border-[#26262b] flex items-center justify-between text-xs mt-auto">
        <div>
          {profile.isAnalyzing ? (
            <span className="inline-flex items-center gap-1.5 text-[#c5a059] font-medium text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="truncate max-w-[150px]">{profile.error || "Analisi Gemini in corso..."}</span>
            </span>
          ) : profile.error ? (
            <span className="inline-flex items-center gap-1.5 text-red-400 font-medium text-[11px]" title={`${profile.errorCode ? `[${profile.errorCode}] ` : ''}${profile.error}`}>
              <span className="truncate max-w-[150px]">
                {profile.errorCode ? (
                   <span className="font-mono text-red-300 mr-1">[{profile.errorCode}]</span>
                ) : null}
                Errore: {profile.error}
              </span>
            </span>
          ) : profile.isAnalyzed ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#c5a059] font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Analizzato da Gemini</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#6b6b76]">In attesa di analisi</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {profile.aiAnalysis?.category !== "Persona Privata / Amico" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPrivate();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium text-[#8e8e9a] hover:text-red-400 hover:bg-[#1c1c22] border border-[#26262b] transition cursor-pointer"
              title="Imposta come Privato/Amico"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-x"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
            </button>
          )}
          {profile.isAnalyzed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResetProfileAnalysis();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium text-[#8e8e9a] hover:text-orange-400 hover:bg-[#1c1c22] border border-[#26262b] transition cursor-pointer"
              title="Smarca e rianalizza"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium text-[#8e8e9a] hover:text-[#c5a059] hover:bg-[#1c1c22] border border-[#26262b] transition cursor-pointer"
          >
            <span>Dettagli</span>
          </button>
        </div>
      </div>
    </div>
  );
};

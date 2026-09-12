import React, { useState } from "react";
import {
  ExternalLink,
  Sparkles,
  Star,
  Loader2,
  Trash2,
  Globe,
  Info,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import { InstagramProfile } from "../types";
import { ProfilePreview } from "./ProfilePreview";

interface StudioTableProps {
  profiles: InstagramProfile[];
  onSelectProfile: (profile: InstagramProfile) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onResetProfileAnalysis: (id: string) => void;
  onMarkAsPrivate: (id: string) => void;
}

type SortField = "username" | "name" | "category" | "location" | "rating" | "status";

export const StudioTable: React.FC<StudioTableProps> = ({
  profiles,
  onSelectProfile,
  onToggleFavorite,
  onDeleteProfile,
  onResetProfileAnalysis,
  onMarkAsPrivate,
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    let valA = "";
    let valB = "";

    switch (sortField) {
      case "username":
        valA = a.username;
        valB = b.username;
        break;
      case "name":
        valA = a.aiAnalysis?.displayName || a.displayName || a.username;
        valB = b.aiAnalysis?.displayName || b.displayName || b.username;
        break;
      case "category":
        valA = a.aiAnalysis?.category || "ZZZ";
        valB = b.aiAnalysis?.category || "ZZZ";
        break;
      case "location":
        valA = `${a.aiAnalysis?.locationCountry || "ZZZ"} ${a.aiAnalysis?.locationCity || ""}`;
        valB = `${b.aiAnalysis?.locationCountry || "ZZZ"} ${b.aiAnalysis?.locationCity || ""}`;
        break;
      case "rating":
        return sortAsc ? (a.rating || 0) - (b.rating || 0) : (b.rating || 0) - (a.rating || 0);
      case "status":
        return sortAsc
          ? Number(a.isAnalyzed) - Number(b.isAnalyzed)
          : Number(b.isAnalyzed) - Number(a.isAnalyzed);
    }

    const cmp = valA.localeCompare(valB, "it", { sensitivity: "base" });
    return sortAsc ? cmp : -cmp;
  });

  if (profiles.length === 0) {
    return (
      <div className="bg-[#121216] rounded-sm border border-[#26262b] p-12 text-center text-[#8e8e9a]">
        <p className="text-sm font-medium text-white">Nessun profilo trovato con i filtri attuali.</p>
        <p className="text-xs text-[#6b6b76] mt-1">Prova a modificare la ricerca o i filtri di categoria.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121216] rounded-sm border border-[#26262b] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0f0f11] border-b border-[#26262b] text-[#6b6b76] font-semibold uppercase tracking-widest text-[10px]">
              <th className="py-3 px-3 w-10 text-center">★</th>
              <th
                onClick={() => handleSort("username")}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Profilo Instagram</span>
                  <ArrowUpDown className="w-3 h-3 text-[#44444a]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sito Web</span>
                  <ArrowUpDown className="w-3 h-3 text-[#44444a]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("category")}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Disciplina</span>
                  <ArrowUpDown className="w-3 h-3 text-[#44444a]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("location")}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Posizione & Sede</span>
                  <ArrowUpDown className="w-3 h-3 text-[#44444a]" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[200px]">Stile Visivo & Focus</th>
              <th className="py-3 px-4">Specialità & Tag</th>
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 cursor-pointer hover:text-white transition text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Stato AI</span>
                  <ArrowUpDown className="w-3 h-3 text-[#44444a]" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262b] text-[#e2e2e2]">
            {sortedProfiles.map((profile) => {
              const ai = profile.aiAnalysis;
              const studioName = ai?.displayName || profile.displayName || profile.username;

              return (
                <tr
                  key={profile.id}
                  className="hover:bg-[#1c1c22] transition-colors group cursor-pointer"
                  onClick={() => onSelectProfile(profile)}
                >
                  {/* Favorite Star */}
                  <td
                    className="py-3 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(profile.id);
                    }}
                  >
                    <button
                      className="text-[#44444a] hover:text-[#c5a059] transition cursor-pointer"
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
                  </td>

                  {/* Username & Instagram Link */}
                  <td className="py-3 px-4 text-white">
                    <div className="flex items-center gap-2">
                      <ProfilePreview profile={profile}>
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1f] border border-[#26262b] flex items-center justify-center text-[11px] font-bold text-[#c5a059] shrink-0 uppercase cursor-help">
                          {profile.username.slice(0, 2)}
                        </div>
                      </ProfilePreview>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                          <ProfilePreview profile={profile}>
                            <span className="truncate max-w-[140px] font-mono text-xs font-medium cursor-help hover:text-[#c5a059] transition-colors">@{profile.username}</span>
                          </ProfilePreview>
                          <a
                            href={profile.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#6b6b76] hover:text-[#c5a059] transition"
                            title="Apri profilo su Instagram"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="truncate max-w-[140px] text-[11px] text-[#8e8e9a]" title={studioName}>
                          {studioName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sito Web */}
                  <td className="py-3 px-4">
                    {ai?.website ? (
                      <a
                        href={ai.website.startsWith("http") ? ai.website : `https://${ai.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-[#8e8e9a] hover:text-[#c5a059] transition-colors"
                        title={ai.website}
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[150px] text-xs">
                          {ai.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#6b6b76] italic">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    {ai?.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b]">
                        {ai.category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#6b6b76] italic">Non categorizzato</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4">
                    {ai?.locationCity || ai?.locationCountry ? (
                      <a
                        href={ai.mapsLinks && ai.mapsLinks.length > 0 ? ai.mapsLinks[0] : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ai.displayName} ${ai.locationCity} ${ai.locationCountry}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={ai.locationStreet ? `${ai.locationStreet}, ${ai.locationCity}, ${ai.locationState || ai.locationRegion} ${ai.locationCountry}` : "Apri in Google Maps"}
                        className="flex items-center gap-1.5 hover:text-[#c5a059] transition-colors group/map"
                      >
                        {ai.countryCode && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-[#1a1a1f] border border-[#26262b] text-[10px] font-mono font-bold text-[#e2e2e2] group-hover/map:border-[#c5a059] transition-colors">
                            {ai.countryCode}
                          </span>
                        )}
                        <span className="truncate max-w-[150px] text-[#8e8e9a] group-hover/map:text-[#c5a059] transition-colors">
                          {ai.locationCity ? `${ai.locationCity}, ` : ""}
                          <strong className="font-medium text-[#e2e2e2] group-hover/map:text-[#c5a059] transition-colors">
                            {ai.locationCountry}
                          </strong>
                        </span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#6b6b76] italic">—</span>
                    )}
                  </td>

                  {/* Visual Style */}
                  <td className="py-3 px-4 text-[#8e8e9a]">
                    {ai?.visualStyle ? (
                      <p className="line-clamp-2 text-[11px] leading-relaxed" title={ai.visualStyle}>
                        {ai.visualStyle}
                      </p>
                    ) : (
                      <span className="text-[11px] text-[#6b6b76] italic">In attesa di analisi AI</span>
                    )}
                  </td>

                  {/* Specialties & Tags */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {ai?.keySpecialties && ai.keySpecialties.length > 0 ? (
                        ai.keySpecialties.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 text-[10px] bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b] rounded-sm"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[#6b6b76] italic">—</span>
                      )}
                    </div>
                  </td>

                  {/* AI Status */}
                  <td className="py-3 px-4 text-center">
                    {profile.isAnalyzing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#1c1c22] text-[#c5a059] border border-[#c5a059]" title={profile.error || "Analisi in corso"}>
                        <Loader2 className="w-3 h-3 animate-spin text-[#c5a059]" />
                        <span className="truncate max-w-[80px]">{profile.error ? profile.error : "Analisi..."}</span>
                      </span>
                    ) : profile.error ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#2a1215] text-red-400 border border-red-900/50" title={`${profile.errorCode ? `[${profile.errorCode}] ` : ''}${profile.error}`}>
                        <span className="truncate max-w-[80px]">
                          {profile.errorCode ? `${profile.errorCode}` : "Errore"}
                        </span>
                      </span>
                    ) : profile.isAnalyzed ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#1c1c22] text-[#c5a059] border border-[#44444a]"
                        title="Analizzato con successo da Gemini 3.8 Flash"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#c5a059]" />
                        <span>Gemini</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium bg-[#16161a] text-[#8e8e9a] border border-[#26262b]">
                        Da Analizzare
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectProfile(profile)}
                        className="p-1 rounded-sm text-[#6b6b76] hover:text-white hover:bg-[#2a2a32] transition cursor-pointer"
                        title="Vedi scheda completa"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {profile.isAnalyzed && (
                        <button
                          onClick={() => onResetProfileAnalysis(profile.id)}
                          className="p-1 rounded-sm text-[#6b6b76] hover:text-orange-400 hover:bg-[#2a2a32] transition cursor-pointer"
                          title="Smarca e rianalizza"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                      )}

                      {profile.aiAnalysis?.category !== "Persona Privata / Amico" && (
                        <button
                          onClick={() => onMarkAsPrivate(profile.id)}
                          className="p-1 rounded-sm text-[#6b6b76] hover:text-red-400 hover:bg-[#2a2a32] transition cursor-pointer"
                          title="Imposta come Privato/Amico"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-x"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteProfile(profile.id)}
                        className="p-1 rounded-sm text-[#6b6b76] hover:text-red-400 hover:bg-[#2a2a32] transition cursor-pointer"
                        title="Rimuovi dal database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

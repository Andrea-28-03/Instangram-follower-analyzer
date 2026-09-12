import React from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Sparkles, MapPin, ExternalLink } from "lucide-react";
import { InstagramProfile } from "../types";

interface ProfilePreviewProps {
  profile: InstagramProfile;
  children: React.ReactNode;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profile, children }) => {
  const ai = profile.aiAnalysis;
  const isAnalyzed = profile.isAnalyzed && ai;
  const displayName = ai?.displayName || profile.displayName || profile.username;

  return (
    <HoverCard.Root openDelay={300} closeDelay={150}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>
      
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 w-72 bg-[#121216] border border-[#26262b] rounded-sm shadow-2xl p-4 text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#1a1a1f] border border-[#26262b] flex items-center justify-center text-sm font-bold text-[#c5a059] uppercase">
                {profile.username.slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm truncate max-w-[150px]">{displayName}</span>
                <span className="text-[#8e8e9a] text-xs font-mono truncate">@{profile.username}</span>
              </div>
            </div>
            {isAnalyzed && (
              <div className="flex items-center gap-1 bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </div>
            )}
          </div>

          {isAnalyzed ? (
            <div className="space-y-3">
              <div className="text-xs text-[#d4d4d8] line-clamp-3 leading-relaxed">
                {ai.description}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8e8e9a]">
                  <span className="font-medium uppercase tracking-widest text-[#6b6b76] shrink-0 w-16">Ruolo</span>
                  <span className="text-[#c5a059] truncate">{ai.category} • {ai.studioType}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] text-[#8e8e9a]">
                  <span className="font-medium uppercase tracking-widest text-[#6b6b76] shrink-0 w-16">Sede</span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" />
                    {ai.locationCity}{ai.locationCountry !== ai.locationCity ? `, ${ai.locationCountry}` : ''}
                  </span>
                </div>
                
                <div className="flex items-start gap-1.5 text-[11px] text-[#8e8e9a]">
                  <span className="font-medium uppercase tracking-widest text-[#6b6b76] shrink-0 w-16 mt-0.5">Style</span>
                  <span className="line-clamp-2">{ai.visualStyle}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#8e8e9a] italic py-2 text-center">
              Analisi AI non ancora effettuata o in corso.
            </div>
          )}

          <HoverCard.Arrow className="fill-[#26262b]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "./components/Header";
import { CategoryFilter } from "./components/CategoryFilter";
import { StudioTable } from "./components/StudioTable";
import { StudioCard } from "./components/StudioCard";
import { StudioMap } from "./components/StudioMap";
import { StudioInsights } from "./components/StudioInsights";
import { ImportModal } from "./components/ImportModal";
import { StudioDetailModal } from "./components/StudioDetailModal";
import { ExportGeminiModal } from "./components/ExportGeminiModal";
import { InstagramProfile, ViewMode, FilterStatus } from "./types";
import { INITIAL_STUDIOS } from "./data/initialStudios";
import {
  Sparkles,
  Upload,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "instadesign_profiles_v1";

export default function App() {
  const [profiles, setProfiles] = useState<InstagramProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
    }
    return INITIAL_STUDIOS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [hidePrivateProfiles, setHidePrivateProfiles] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportGeminiModalOpen, setIsExportGeminiModalOpen] = useState(false);
  const [selectedProfileForDetail, setSelectedProfileForDetail] =
    useState<InstagramProfile | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [profiles]);

  // Derived categories with counts
  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach((p) => {
      if (p.aiAnalysis?.category) {
        map[p.aiAnalysis.category] = (map[p.aiAnalysis.category] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [profiles]);

  // Derived countries with counts
  const countries = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach((p) => {
      if (p.aiAnalysis?.locationCountry) {
        map[p.aiAnalysis.locationCountry] =
          (map[p.aiAnalysis.locationCountry] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [profiles]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const ai = p.aiAnalysis;
      const studioName = ai?.displayName || p.displayName || p.username;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesUsername = p.username.toLowerCase().includes(q);
        const matchesName = studioName.toLowerCase().includes(q);
        const matchesCity = ai?.locationCity?.toLowerCase().includes(q) || false;
        const matchesCountry = ai?.locationCountry?.toLowerCase().includes(q) || false;
        const matchesStyle = ai?.visualStyle?.toLowerCase().includes(q) || false;
        const matchesSpecialties =
          ai?.keySpecialties?.some((s) => s.toLowerCase().includes(q)) || false;
        const matchesNotes = p.notes?.toLowerCase().includes(q) || false;

        if (
          !matchesUsername &&
          !matchesName &&
          !matchesCity &&
          !matchesCountry &&
          !matchesStyle &&
          !matchesSpecialties &&
          !matchesNotes
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (ai?.category !== selectedCategory) {
          return false;
        }
      }

      // Country filter
      if (selectedCountry !== "all") {
        if (ai?.locationCountry !== selectedCountry) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "analyzed" && !p.isAnalyzed) return false;
      if (statusFilter === "pending" && p.isAnalyzed) return false;
      if (statusFilter === "favorites" && !p.isFavorite) return false;

      // Hide private profiles
      if (hidePrivateProfiles && ai?.category === "Persona Privata / Amico") return false;

      return true;
    });
  }, [profiles, searchQuery, selectedCategory, selectedCountry, statusFilter, hidePrivateProfiles]);

  // Toggle favorite status
  const handleToggleFavorite = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (selectedProfileForDetail?.id === id) {
      setSelectedProfileForDetail((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  // Update personal notes and rating
  const handleUpdateNotes = (id: string, notes: string, rating: number) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes, rating } : p))
    );
    if (selectedProfileForDetail?.id === id) {
      setSelectedProfileForDetail((prev) => (prev ? { ...prev, notes, rating } : null));
    }
  };

  // Delete profile
  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  // Mark profile as Private/Friend
  const handleMarkAsPrivate = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isAnalyzed: true,
              aiAnalysis: {
                ...p.aiAnalysis,
                category: "Persona Privata / Amico",
              },
            }
          : p
      )
    );
    if (selectedProfileForDetail?.id === id) {
      setSelectedProfileForDetail((prev) =>
        prev
          ? {
              ...prev,
              isAnalyzed: true,
              aiAnalysis: {
                ...prev.aiAnalysis,
                category: "Persona Privata / Amico",
              },
            }
          : null
      );
    }
  };

  // Reset analysis for a single profile
  const handleResetProfileAnalysis = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isAnalyzed: false,
              aiAnalysis: undefined,
              errorCode: undefined,
              error: undefined,
            }
          : p
      )
    );
    if (selectedProfileForDetail?.id === id) {
      setSelectedProfileForDetail((prev) =>
        prev
          ? {
              ...prev,
              isAnalyzed: false,
              aiAnalysis: undefined,
              errorCode: undefined,
              error: undefined,
            }
          : null
      );
    }
  };

  // Import profiles handler
  const handleImport = (newProfiles: InstagramProfile[], replace: boolean) => {
    if (replace) {
      setProfiles(newProfiles);
    } else {
      // Merge and deduplicate by username
      const existingUsernames = new Set(profiles.map((p) => p.username.toLowerCase()));
      const filtered = newProfiles.filter(
        (p) => !existingUsernames.has(p.username.toLowerCase())
      );
      setProfiles((prev) => [...prev, ...filtered]);
    }
  };

  // Import Gemini Pro Offline JSON
  const handleImportGeminiPro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          alert("Errore: il file deve contenere un array JSON.");
          return;
        }

        setProfiles((prev) => {
          let updatedCount = 0;
          const updatedProfiles = prev.map(p => {
            const importedMatch = parsed.find((imp: any) => 
              imp.username?.toLowerCase() === p.username.toLowerCase() && imp.aiAnalysis
            );
            if (importedMatch) {
              updatedCount++;
              return {
                ...p,
                isAnalyzed: true,
                isAnalyzing: false,
                error: undefined,
                errorCode: undefined,
                displayName: importedMatch.aiAnalysis.displayName || p.displayName,
                aiAnalysis: {
                  displayName: importedMatch.aiAnalysis.displayName || "",
                  category: importedMatch.aiAnalysis.category || "",
                  studioType: importedMatch.aiAnalysis.studioType || "",
                  locationCity: importedMatch.aiAnalysis.locationCity || "",
                  locationCountry: importedMatch.aiAnalysis.locationCountry || "",
                  countryCode: importedMatch.aiAnalysis.countryCode || "",
                  locationState: importedMatch.aiAnalysis.locationState || "",
                  locationRegion: importedMatch.aiAnalysis.locationRegion || "",
                  locationStreet: importedMatch.aiAnalysis.locationStreet || "",
                  mapsLinks: Array.isArray(importedMatch.aiAnalysis.mapsLinks) ? importedMatch.aiAnalysis.mapsLinks : [],
                  visualStyle: importedMatch.aiAnalysis.visualStyle || "",
                  keySpecialties: Array.isArray(importedMatch.aiAnalysis.keySpecialties) ? importedMatch.aiAnalysis.keySpecialties : [],
                  description: importedMatch.aiAnalysis.description || "",
                  website: importedMatch.aiAnalysis.website || "",
                  analyzedAt: new Date().toISOString()
                }
              };
            }
            return p;
          });
          alert(`Importazione completata con successo. Aggiornati ${updatedCount} profili.`);
          return updatedProfiles;
        });

      } catch (err: any) {
        alert("Errore di parsing del JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Reset to initial curated sample
  const handleResetToSample = () => {
    if (
      confirm(
        "Vuoi ricaricare il database curato con i 15 studi di design e architetti internazionali?"
      )
    ) {
      setProfiles(INITIAL_STUDIOS);
    }
  };

  const handleClearAnalyses = () => {
    if (confirm("Vuoi cancellare i risultati di tutte le analisi fatte finora? (I profili verranno mantenuti, ma segnati come non analizzati)")) {
      setProfiles(prev => prev.map(p => ({
        ...p,
        isAnalyzed: false,
        aiAnalysis: undefined,
        errorCode: undefined,
        error: undefined
      })));
    }
  };

  const handleClearAllProfiles = () => {
    if (confirm("Sei sicuro di voler eliminare TUTTI i profili dal database? Questa azione non può essere annullata.")) {
      setProfiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e2e2e2] font-sans flex flex-col selection:bg-[#c5a059]/30 selection:text-white">
      {/* App Header */}
      <Header
        profiles={profiles}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetToSample={handleResetToSample}
        onClearAnalyses={handleClearAnalyses}
        onClearAllProfiles={handleClearAllProfiles}
        onImportGeminiPro={handleImportGeminiPro}
        onOpenExportGemini={() => setIsExportGeminiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls & Category Filter */}
        <CategoryFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          countries={countries}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          hidePrivateProfiles={hidePrivateProfiles}
          onHidePrivateProfilesChange={setHidePrivateProfiles}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredProfiles.length}
          totalCount={profiles.length}
        />

        {/* View Renderings */}
        {viewMode === "table" && (
          <StudioTable
            profiles={filteredProfiles}
            onSelectProfile={(profile) => setSelectedProfileForDetail(profile)}
            onToggleFavorite={handleToggleFavorite}
            onDeleteProfile={handleDeleteProfile}
            onResetProfileAnalysis={handleResetProfileAnalysis}
            onMarkAsPrivate={handleMarkAsPrivate}
          />
        )}

        {viewMode === "cards" && (
          <div>
            {filteredProfiles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                <p className="text-sm font-medium text-stone-700">
                  Nessun profilo trovato con i filtri selezionati.
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Prova ad azzerare i filtri o la ricerca.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfiles.map((profile) => (
                  <StudioCard
                    key={profile.id}
                    profile={profile}
                    onSelect={() => setSelectedProfileForDetail(profile)}
                    onToggleFavorite={() => handleToggleFavorite(profile.id)}
                    onResetProfileAnalysis={() => handleResetProfileAnalysis(profile.id)}
                    onMarkAsPrivate={() => handleMarkAsPrivate(profile.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === "map" && (
          <StudioMap
            profiles={filteredProfiles}
            onSelectProfile={(profile) => setSelectedProfileForDetail(profile)}
          />
        )}

        {viewMode === "insights" && (
          <StudioInsights
            profiles={profiles}
            onFilterByCategory={(cat) => {
              setSelectedCategory(cat);
              setViewMode("cards");
            }}
            onFilterByCountry={(country) => {
              setSelectedCountry(country);
              setViewMode("cards");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f0f11] border-t border-[#26262b] py-6 mt-12 text-xs text-[#6b6b76]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              Curator AI
            </span>
            <span>•</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>

          <div className="flex items-center gap-4 text-[#8e8e9a]">
            <span>Esportazione diretta in Excel (.xlsx) e CSV</span>
            <span>•</span>
            <span>Archiviazione locale sicura</span>
          </div>
        </div>
      </footer>

      {/* Import / Meta Guide Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* Export Gemini Pro Modal */}
      <ExportGeminiModal
        isOpen={isExportGeminiModalOpen}
        onClose={() => setIsExportGeminiModalOpen(false)}
        profiles={profiles}
      />

      {/* Studio Detail Modal */}
      <StudioDetailModal
        profile={selectedProfileForDetail}
        isOpen={selectedProfileForDetail !== null}
        onClose={() => setSelectedProfileForDetail(null)}
        onUpdateNotes={handleUpdateNotes}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteProfile}
        onResetProfileAnalysis={handleResetProfileAnalysis}
        onMarkAsPrivate={handleMarkAsPrivate}
      />
    </div>
  );
}

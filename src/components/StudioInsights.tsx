import React from "react";
import {
  PieChart,
  BarChart3,
  Sparkles,
  Globe2,
  Building,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { InstagramProfile } from "../types";

interface StudioInsightsProps {
  profiles: InstagramProfile[];
  onFilterByCategory: (cat: string) => void;
  onFilterByCountry: (country: string) => void;
}

export const StudioInsights: React.FC<StudioInsightsProps> = ({
  profiles,
  onFilterByCategory,
  onFilterByCountry,
}) => {
  const total = profiles.length;
  const analyzed = profiles.filter((p) => p.isAnalyzed).length;
  const pending = total - analyzed;
  const analyzedPercent = total > 0 ? Math.round((analyzed / total) * 100) : 0;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  // Country breakdown
  const countryCounts: Record<string, number> = {};
  // Studio type breakdown
  const typeCounts: Record<string, number> = {};

  profiles.forEach((p) => {
    const ai = p.aiAnalysis;
    const cat = ai?.category || "Non analizzato";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const country = ai?.locationCountry || "Sconosciuto";
    countryCounts[country] = (countryCounts[country] || 0) + 1;

    const type = ai?.studioType || "Da definire";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const sortedCountries = Object.entries(countryCounts)
    .filter(([c]) => c !== "Sconosciuto")
    .sort((a, b) => b[1] - a[1]);
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121216] rounded-sm border border-[#26262b] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#6b6b76] mb-2">
            <span className="font-medium">AI Analysis Coverage</span>
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-2xl font-light text-white">{analyzedPercent}%</div>
          <div className="w-full bg-[#1a1a1f] rounded-full h-1 mt-3 overflow-hidden">
            <div
              className="bg-[#c5a059] h-1 rounded-full transition-all duration-500"
              style={{ width: `${analyzedPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8e8e9a] mt-2">
            {analyzed} of {total} profiles completed with location and style data
          </p>
        </div>

        <div className="bg-[#121216] rounded-sm border border-[#26262b] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#6b6b76] mb-2">
            <span className="font-medium">Global Ecosystem</span>
            <Globe2 className="w-4 h-4 text-[#8e8e9a]" />
          </div>
          <div className="text-2xl font-light text-white">{sortedCountries.length}</div>
          <p className="text-[11px] text-[#8e8e9a] mt-5">
            Distinct geographic regions identified across followed profiles
          </p>
        </div>

        <div className="bg-[#121216] rounded-sm border border-[#26262b] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#6b6b76] mb-2">
            <span className="font-medium">Disciplines & Sectors</span>
            <Layers className="w-4 h-4 text-[#8e8e9a]" />
          </div>
          <div className="text-2xl font-light text-white">{sortedCategories.length}</div>
          <p className="text-[11px] text-[#8e8e9a] mt-5">
            Design sectors mapped (Branding, Typography, Architecture...)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Bar Chart */}
        <div className="bg-[#121216] rounded-sm border border-[#26262b] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Distribution by Discipline
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-[#6b6b76]">Click to filter</span>
          </div>

          <div className="space-y-3">
            {sortedCategories.map(([catName, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div
                  key={catName}
                  onClick={() => onFilterByCategory(catName)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#e2e2e2] group-hover:text-[#c5a059] transition truncate max-w-[240px]">
                      {catName}
                    </span>
                    <span className="text-[#8e8e9a]">
                      {count} <span className="text-[#6b6b76] text-[10px]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1f] rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-[#44444a] group-hover:bg-[#c5a059] h-1 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Countries Bar Chart */}
        <div className="bg-[#121216] rounded-sm border border-[#26262b] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Top Regions by Studio Presence
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-[#6b6b76]">Click to filter</span>
          </div>

          <div className="space-y-3">
            {sortedCountries.slice(0, 8).map(([countryName, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div
                  key={countryName}
                  onClick={() => onFilterByCountry(countryName)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#e2e2e2] group-hover:text-[#c5a059] transition truncate max-w-[240px]">
                      {countryName}
                    </span>
                    <span className="text-[#8e8e9a]">
                      {count} <span className="text-[#6b6b76] text-[10px]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1f] rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-[#44444a] group-hover:bg-[#c5a059] h-1 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

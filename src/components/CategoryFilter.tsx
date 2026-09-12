import React from "react";
import {
  Search,
  Filter,
  Table as TableIcon,
  LayoutGrid,
  MapPin,
  PieChart,
  Star,
  Sparkles,
  X,
} from "lucide-react";
import { ViewMode, FilterStatus } from "../types";

interface CategoryFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: { name: string; count: number }[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  countries: { name: string; count: number }[];
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  hidePrivateProfiles: boolean;
  onHidePrivateProfilesChange: (hide: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedCountry,
  onCountryChange,
  countries,
  statusFilter,
  onStatusFilterChange,
  hidePrivateProfiles,
  onHidePrivateProfilesChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Top row: Search input, Country filter, Status Filter, View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6b6b76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by studio, @username, city, style..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#121216] text-[#e2e2e2] border border-[#26262b] rounded-sm focus:outline-none focus:border-[#c5a059] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#6b6b76] hover:text-[#e2e2e2] rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Country Selector */}
          <div className="relative">
            <select
              id="country-filter-select"
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              className="text-xs bg-[#121216] border border-[#26262b] text-[#e2e2e2] py-2 pl-3 pr-7 rounded-sm focus:outline-none focus:border-[#c5a059] cursor-pointer shadow-xs appearance-none"
            >
              <option value="all">Region: All ({countries.reduce((acc, c) => acc + c.count, 0)})</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6b76] text-[10px]">
              ▼
            </div>
          </div>

          {/* Status Buttons */}
          <div className="inline-flex rounded-sm bg-[#121216] p-0.5 border border-[#26262b]">
            <button
              id="filter-all-btn"
              onClick={() => onStatusFilterChange("all")}
              className={`px-2.5 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#1c1c22] text-[#c5a059]"
                  : "text-[#8e8e9a] hover:text-[#e2e2e2]"
              }`}
            >
              All
            </button>
            <button
              id="filter-analyzed-btn"
              onClick={() => onStatusFilterChange("analyzed")}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer ${
                statusFilter === "analyzed"
                  ? "bg-[#1c1c22] text-[#c5a059]"
                  : "text-[#8e8e9a] hover:text-[#e2e2e2]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#c5a059]" />
              <span>AI</span>
            </button>
            <button
              id="filter-pending-btn"
              onClick={() => onStatusFilterChange("pending")}
              className={`px-2.5 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-[#1c1c22] text-white"
                  : "text-[#8e8e9a] hover:text-[#e2e2e2]"
              }`}
            >
              Pending
            </button>
            <button
              id="filter-favorites-btn"
              onClick={() => onStatusFilterChange("favorites")}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer ${
                statusFilter === "favorites"
                  ? "bg-[#1c1c22] text-[#c5a059]"
                  : "text-[#8e8e9a] hover:text-[#e2e2e2]"
              }`}
            >
              <Star className="w-3 h-3 text-[#c5a059] fill-[#c5a059]" />
              <span>Curated</span>
            </button>
            <button
              id="filter-hide-private-btn"
              onClick={() => onHidePrivateProfilesChange(!hidePrivateProfiles)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer ${
                hidePrivateProfiles
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-[#8e8e9a] hover:text-[#e2e2e2] border border-transparent"
              }`}
              title="Nascondi i profili categorizzati come Persona Privata / Amico"
            >
              <X className="w-3 h-3" />
              <span>No Privati</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-sm bg-[#121216] p-0.5 border border-[#26262b] ml-auto sm:ml-0">
            <button
              id="view-table-btn"
              onClick={() => onViewModeChange("table")}
              title="Table View"
              className={`p-1.5 rounded-sm transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#2a2a32] text-white"
                  : "text-[#6b6b76] hover:text-[#e2e2e2]"
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              id="view-cards-btn"
              onClick={() => onViewModeChange("cards")}
              title="Cards View"
              className={`p-1.5 rounded-sm transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#2a2a32] text-white"
                  : "text-[#6b6b76] hover:text-[#e2e2e2]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-map-btn"
              onClick={() => onViewModeChange("map")}
              title="Geographic Map"
              className={`p-1.5 rounded-sm transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#2a2a32] text-white"
                  : "text-[#6b6b76] hover:text-[#e2e2e2]"
              }`}
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button
              id="view-insights-btn"
              onClick={() => onViewModeChange("insights")}
              title="Data Insights"
              className={`p-1.5 rounded-sm transition cursor-pointer ${
                viewMode === "insights"
                  ? "bg-[#2a2a32] text-white"
                  : "text-[#6b6b76] hover:text-[#e2e2e2]"
              }`}
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          id="cat-pill-all"
          onClick={() => onCategoryChange("all")}
          className={`shrink-0 px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium transition cursor-pointer border ${
            selectedCategory === "all"
              ? "bg-[#c5a059] text-[#0a0a0b] border-[#c5a059]"
              : "bg-[#121216] text-[#8e8e9a] border-[#26262b] hover:text-white"
          }`}
        >
          All Categories ({totalCount})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.name}
            id={`cat-pill-${cat.name.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => onCategoryChange(cat.name)}
            className={`shrink-0 px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium transition cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === cat.name
                ? "bg-[#c5a059] text-[#0a0a0b] border-[#c5a059]"
                : "bg-[#121216] text-[#8e8e9a] border-[#26262b] hover:text-white"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-sm ${
                selectedCategory === cat.name
                  ? "bg-[#0a0a0b]/20 text-[#0a0a0b]"
                  : "bg-[#26262b] text-[#8e8e9a]"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter summary if filtered */}
      {(selectedCategory !== "all" || selectedCountry !== "all" || searchQuery || statusFilter !== "all" || hidePrivateProfiles) && (
        <div className="flex items-center justify-between text-[11px] text-[#6b6b76] px-1 uppercase tracking-widest">
          <div>
            Showing <strong className="text-white">{totalFilteredCount}</strong> of {totalCount} profiles
          </div>
          <button
            onClick={() => {
              onCategoryChange("all");
              onCountryChange("all");
              onSearchChange("");
              onStatusFilterChange("all");
              onHidePrivateProfilesChange(false);
            }}
            className="text-[#c5a059] hover:text-[#d4b57a] font-medium cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

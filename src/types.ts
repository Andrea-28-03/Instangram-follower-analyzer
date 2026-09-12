export interface AIStudioAnalysis {
  displayName: string;
  category: string;
  studioType: string;
  locationCity: string;
  locationCountry: string;
  countryCode: string;
  locationState?: string;
  locationRegion?: string;
  locationStreet?: string;
  mapsLinks?: string[];
  visualStyle: string;
  keySpecialties: string[];
  description: string;
  website?: string;
  analyzedAt: string;
}

export interface InstagramProfile {
  id: string;
  username: string;
  displayName?: string;
  profileUrl: string;
  followedAt?: string;
  notes?: string;
  rating?: number; // 1 to 5 stars
  isFavorite?: boolean;
  isAnalyzed: boolean;
  isAnalyzing?: boolean;
  error?: string;
  errorCode?: string;
  aiAnalysis?: AIStudioAnalysis;
}

export type ViewMode = "table" | "cards" | "map" | "insights";

export type FilterCategory = "all" | string;
export type FilterStatus = "all" | "analyzed" | "pending" | "favorites";

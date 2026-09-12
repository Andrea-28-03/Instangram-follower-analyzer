import React, { useState, useEffect, useMemo, useRef } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import {
  MapPin,
  Globe2,
  Building2,
  ExternalLink,
  Sparkles,
  Compass,
  Loader2
} from "lucide-react";
import { InstagramProfile } from "../types";

// --- Geocoding Utils ---
const GEOCODE_CACHE_KEY = "curator_geocode_cache_v1";

interface GeocodeCache {
  [cityCountry: string]: [number, number] | null; // null means not found
}

const getGeocodeCache = (): GeocodeCache => {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveGeocodeCache = (cache: GeocodeCache) => {
  localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
};

// Queue system to respect Nominatim limits (1 req/sec)
let geocodeQueue: string[] = [];
let isGeocoding = false;

// Provider for a dark styled map (ArcGIS Canvas Dark)
const darkMapProvider = (x: number, y: number, z: number) => {
  return `https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`;
};

interface StudioMapProps {
  profiles: InstagramProfile[];
  onSelectProfile: (profile: InstagramProfile) => void;
}

export const StudioMap: React.FC<StudioMapProps> = ({ profiles, onSelectProfile }) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string | null>(null);
  
  // Geocoding State
  const [coordsCache, setCoordsCache] = useState<GeocodeCache>(getGeocodeCache());
  const [geocodingProgress, setGeocodingProgress] = useState({ total: 0, current: 0 });
  const [selectedCityOnMap, setSelectedCityOnMap] = useState<string | null>(null);

  // Group profiles by Country -> Cities -> Studios
  const countryMap: Record<
    string,
    {
      countryCode: string;
      cities: Record<string, InstagramProfile[]>;
      totalCount: number;
    }
  > = {};

  let unlocatedCount = 0;
  const uniqueCitiesToGeocode = new Set<string>();

  profiles.forEach((p) => {
    const ai = p.aiAnalysis;
    const country = ai?.locationCountry || "Posizione da definire";
    const city = ai?.locationCity || "Città non specificata";

    if (!ai?.locationCountry || !ai?.locationCity) {
      unlocatedCount++;
    } else {
      uniqueCitiesToGeocode.add(`${city}, ${country}`);
    }

    if (!countryMap[country]) {
      countryMap[country] = {
        countryCode: ai?.countryCode || "",
        cities: {},
        totalCount: 0,
      };
    }

    countryMap[country].totalCount++;

    if (!countryMap[country].cities[city]) {
      countryMap[country].cities[city] = [];
    }
    countryMap[country].cities[city].push(p);
  });

  const sortedCountries = Object.entries(countryMap).sort(
    (a, b) => b[1].totalCount - a[1].totalCount
  );

  const displayCountries = selectedCountryFilter
    ? sortedCountries.filter(([name]) => name === selectedCountryFilter)
    : sortedCountries;

  // Process Geocoding Queue
  useEffect(() => {
    const neededCities = Array.from(uniqueCitiesToGeocode).filter(
      (loc) => coordsCache[loc] === undefined
    );
    
    if (neededCities.length === 0) return;

    geocodeQueue = [...new Set([...geocodeQueue, ...neededCities])];
    setGeocodingProgress({ total: geocodeQueue.length, current: 0 });

    const processQueue = async () => {
      if (isGeocoding || geocodeQueue.length === 0) return;
      isGeocoding = true;

      while (geocodeQueue.length > 0) {
        const locationStr = geocodeQueue.shift()!;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`,
            { headers: { "User-Agent": "CuratorAIStudio/1.0" } }
          );
          const data = await response.json();
          
          let coords: [number, number] | null = null;
          if (data && data.length > 0) {
            coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          }

          setCoordsCache((prev) => {
            const next = { ...prev, [locationStr]: coords };
            saveGeocodeCache(next);
            return next;
          });
          
          setGeocodingProgress(p => ({ ...p, current: p.current + 1 }));
          
          // Wait 1.1s to respect Nominatim usage policy (absolute max 1 req/s)
          await new Promise(r => setTimeout(r, 1100));
        } catch (e) {
          console.error("Geocoding failed for", locationStr, e);
          // Just mark as null to avoid infinite retry loops on failure
          setCoordsCache((prev) => {
            const next = { ...prev, [locationStr]: null };
            saveGeocodeCache(next);
            return next;
          });
        }
      }
      
      isGeocoding = false;
      setGeocodingProgress({ total: 0, current: 0 });
    };

    processQueue();
  }, [uniqueCitiesToGeocode.size]); // Re-run if we discover new cities

  // Get Map Markers
  const mapMarkers = useMemo(() => {
    const markers: Array<{
      coords: [number, number];
      locationStr: string;
      count: number;
      city: string;
      country: string;
      profiles: InstagramProfile[];
    }> = [];

    displayCountries.forEach(([country, cData]) => {
      Object.entries(cData.cities).forEach(([city, profiles]) => {
        if (city === "Città non specificata") return;
        const locationStr = `${city}, ${country}`;
        const coords = coordsCache[locationStr];
        if (coords) {
          markers.push({
            coords,
            locationStr,
            count: profiles.length,
            city,
            country,
            profiles
          });
        }
      });
    });

    return markers;
  }, [displayCountries, coordsCache]);

  return (
    <div className="space-y-6">
      {/* Geographic Hub Header Banner */}
      <div className="bg-[#121216] border border-[#26262b] rounded-sm p-6 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c5a059] text-[10px] font-semibold uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" />
              <span>Global Geographic Mapping</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Studio & Artist Locations
            </h2>
            <p className="text-[#8e8e9a] text-xs mt-1 max-w-2xl leading-relaxed">
              Gemini identifies the legal headquarters and main operational hubs of the profiles, allowing you to organize trips, fairs, collaborations, and explore the creative ecosystem by region and city.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#16161a] rounded-sm p-3 text-center border border-[#26262b] min-w-[90px]">
              <div className="text-xl font-light text-white">
                {Object.keys(countryMap).filter((k) => k !== "Posizione da definire").length}
              </div>
              <div className="text-[10px] text-[#6b6b76] uppercase tracking-widest">Regions</div>
            </div>
            <div className="bg-[#16161a] rounded-sm p-3 text-center border border-[#26262b] min-w-[90px]">
              <div className="text-xl font-light text-[#c5a059]">
                {profiles.filter((p) => p.aiAnalysis?.locationCity).length}
              </div>
              <div className="text-[10px] text-[#6b6b76] uppercase tracking-widest">Cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-[#121216] border border-[#26262b] rounded-sm overflow-hidden h-[500px] relative">
        <Map
          provider={darkMapProvider}
          defaultCenter={[20, 0]}
          defaultZoom={2}
          minZoom={2}
        >
          {mapMarkers.map((marker) => (
            <Marker
              key={marker.locationStr}
              width={40}
              anchor={marker.coords}
              onClick={() => {
                if (marker.count === 1) {
                  onSelectProfile(marker.profiles[0]);
                } else {
                  setSelectedCityOnMap(marker.locationStr);
                }
              }}
            >
              <div
                className={`relative flex items-center justify-center cursor-pointer group transition-transform ${
                  selectedCityOnMap === marker.locationStr ? "scale-125 z-10" : "hover:scale-110"
                }`}
              >
                <div className="absolute inset-0 bg-[#c5a059] rounded-full animate-ping opacity-20"></div>
                <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center font-bold text-[10px] ${
                  selectedCityOnMap === marker.locationStr
                    ? "bg-[#c5a059] border-white text-black"
                    : "bg-[#16161a] border-[#c5a059] text-white"
                }`}>
                  {marker.count}
                </div>
              </div>
            </Marker>
          ))}

          {selectedCityOnMap && coordsCache[selectedCityOnMap] && (
            <Overlay anchor={coordsCache[selectedCityOnMap]!} offset={[0, 40]}>
              <div className="bg-[#0a0a0b] border border-[#26262b] rounded-sm shadow-xl p-3 min-w-[220px] max-w-[280px] z-50">
                <div className="flex items-center justify-between border-b border-[#26262b] pb-2 mb-2">
                  <div className="font-semibold text-white text-sm truncate">{selectedCityOnMap.split(',')[0]}</div>
                  <button onClick={() => setSelectedCityOnMap(null)} className="text-[#6b6b76] hover:text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <div className="max-h-[250px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-[#26262b]">
                  {mapMarkers.find(m => m.locationStr === selectedCityOnMap)?.profiles.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProfile(p)}
                      className="group flex flex-col gap-1 p-2 rounded-sm bg-[#16161a] border border-[#26262b] hover:border-[#c5a059] cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-medium text-[#e2e2e2] group-hover:text-[#c5a059] truncate">
                        {p.aiAnalysis?.displayName || p.username}
                      </div>
                      <div className="text-[10px] text-[#8e8e9a] line-clamp-2 leading-tight">
                        {p.aiAnalysis?.visualStyle || p.notes || "Nessuna descrizione disponibile."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Overlay>
          )}
        </Map>

        {geocodingProgress.total > 0 && (
          <div className="absolute bottom-4 left-4 bg-[#0a0a0b]/90 border border-[#26262b] px-3 py-2 rounded-sm flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8e8e9a]">
            <Loader2 className="w-3 h-3 animate-spin text-[#c5a059]" />
            <span>Mappatura: {geocodingProgress.current} / {geocodingProgress.total}</span>
          </div>
        )}
      </div>

      {/* Country Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => setSelectedCountryFilter(null)}
          className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium transition cursor-pointer border ${
            selectedCountryFilter === null
              ? "bg-[#c5a059] text-[#0a0a0b] border-[#c5a059]"
              : "bg-[#121216] text-[#8e8e9a] border-[#26262b] hover:text-white"
          }`}
        >
          All Regions ({sortedCountries.length})
        </button>
        {sortedCountries.map(([countryName, data]) => (
          <button
            key={countryName}
            onClick={() =>
              setSelectedCountryFilter(
                selectedCountryFilter === countryName ? null : countryName
              )
            }
            className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-tighter font-medium transition cursor-pointer border flex items-center gap-1.5 ${
              selectedCountryFilter === countryName
                ? "bg-[#c5a059] text-[#0a0a0b] border-[#c5a059]"
                : "bg-[#121216] text-[#8e8e9a] border-[#26262b] hover:text-white"
            }`}
          >
            {data.countryCode && (
              <span className="font-mono text-[9px] font-bold opacity-75">
                {data.countryCode}
              </span>
            )}
            <span>{countryName}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-sm ${
                selectedCountryFilter === countryName
                  ? "bg-[#0a0a0b]/20 text-[#0a0a0b]"
                  : "bg-[#26262b] text-[#8e8e9a]"
              }`}
            >
              {data.totalCount}
            </span>
          </button>
        ))}
      </div>

      {/* Countries and Cities Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayCountries.map(([countryName, countryData]) => (
          <div
            key={countryName}
            className="bg-[#121216] rounded-sm border border-[#26262b] p-5 shadow-xs hover:border-[#44444a] transition flex flex-col"
          >
            {/* Country Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#26262b] mb-3">
              <div className="flex items-center gap-2">
                {countryData.countryCode ? (
                  <span className="w-8 h-8 rounded-sm bg-[#1a1a1f] border border-[#26262b] flex items-center justify-center font-mono font-bold text-xs text-[#c5a059]">
                    {countryData.countryCode}
                  </span>
                ) : (
                  <Globe2 className="w-6 h-6 text-[#6b6b76]" />
                )}
                <div>
                  <h3 className="font-semibold text-white text-sm">{countryName}</h3>
                  <p className="text-[11px] text-[#6b6b76]">
                    {Object.keys(countryData.cities).length} recorded cities
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-sm bg-[#1a1a1f] text-[#8e8e9a] border border-[#26262b]">
                {countryData.totalCount} {countryData.totalCount === 1 ? "studio" : "studios"}
              </span>
            </div>

            {/* Cities in Country */}
            <div className="space-y-4 flex-1">
              {Object.entries(countryData.cities).map(([cityName, cityProfiles]) => (
                <div key={cityName} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#e2e2e2]">
                    <MapPin className="w-3.5 h-3.5 text-[#6b6b76]" />
                    <span>{cityName}</span>
                    <span className="text-[10px] text-[#8e8e9a] font-normal">
                      ({cityProfiles.length})
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-4 border-l border-[#26262b]">
                    {cityProfiles.map((p) => {
                      const ai = p.aiAnalysis;
                      const title = ai?.displayName || p.displayName || p.username;

                      return (
                        <div
                          key={p.id}
                          onClick={() => onSelectProfile(p)}
                          className="p-2 rounded-sm bg-[#16161a] hover:bg-[#1c1c22] border border-[#26262b] hover:border-[#c5a059] transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">
                              {title}
                            </div>
                            <div className="text-[10px] text-[#8e8e9a] truncate">
                              @{p.username} {ai?.category ? `• ${ai.category}` : ""}
                            </div>
                          </div>
                          <a
                            href={p.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#6b6b76] hover:text-[#c5a059] p-1"
                            title="Apri Instagram"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

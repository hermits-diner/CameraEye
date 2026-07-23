import { useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export interface LocationMarker {
  id: string;
  name: string;
  coordinates: string; // e.g. "40.7128° N, 74.0060° W"
  city: string;
  country: string;
  notes?: string;
  xPercent: number; // 0..100 map position
  yPercent: number;
}

interface PhotoLocationMapProps {
  locations: LocationMarker[];
  title?: string;
}

export function PhotoLocationMap({ locations, title = 'Shooting Locations' }: PhotoLocationMapProps) {
  const [activeMarker, setActiveMarker] = useState<LocationMarker | null>(locations[0] || null);

  return (
    <div className="border border-white/10 dark:border-white/10 border-black/10 rounded-none p-6 md:p-8 bg-black/40 dark:bg-black/40 bg-white/40 backdrop-blur-md my-12" data-testid="container-photo-map">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <h3 className="text-xs uppercase tracking-[0.25em] opacity-70 font-sans">{title}</h3>
        </div>
        <span className="text-[11px] font-mono opacity-50">
          {locations.length} Locations Verified
        </span>
      </div>

      {/* Styled Interactive World Grid Map */}
      <div className="relative w-full aspect-[21/9] min-h-[240px] bg-slate-950/80 rounded border border-white/10 overflow-hidden flex items-center justify-center">
        {/* World Grid Lines */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Equator & Prime Meridian Line */}
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-emerald-500/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-emerald-500/20" />

        {/* Location Markers */}
        {locations.map((loc) => {
          const isActive = activeMarker?.id === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setActiveMarker(loc)}
              style={{ left: `${loc.xPercent}%`, top: `${loc.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
              title={`${loc.name} (${loc.coordinates})`}
              aria-label={loc.name}
            >
              <div className="relative flex items-center justify-center">
                <span className={`absolute w-6 h-6 rounded-full animate-ping ${isActive ? 'bg-emerald-400/50' : 'bg-white/20'}`} />
                <div className={`w-3 h-3 rounded-full transition-transform ${isActive ? 'bg-emerald-400 scale-125 ring-4 ring-emerald-400/30' : 'bg-white/80 group-hover:bg-emerald-300'}`} />
              </div>
            </button>
          );
        })}

        {/* Floating Info Box */}
        {activeMarker && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs p-4 bg-slate-900/90 border border-white/20 backdrop-blur-md rounded shadow-2xl text-white text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeMarker.city}, {activeMarker.country}</span>
            </div>
            <div className="font-serif text-sm font-semibold mb-1">{activeMarker.name}</div>
            <div className="font-mono text-[10px] text-white/50 mb-2">{activeMarker.coordinates}</div>
            {activeMarker.notes && (
              <p className="text-white/70 text-[11px] leading-relaxed italic">{activeMarker.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Location List Pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setActiveMarker(loc)}
            className={`text-[11px] px-3 py-1.5 border transition-all ${
              activeMarker?.id === loc.id
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 hover:border-white/30 text-white/60'
            }`}
          >
            <Navigation className="w-2.5 h-2.5 inline mr-1.5" />
            {loc.city} — {loc.name}
          </button>
        ))}
      </div>
    </div>
  );
}

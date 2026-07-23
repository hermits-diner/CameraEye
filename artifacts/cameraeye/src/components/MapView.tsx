import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useTheme } from 'next-themes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { cn } from '@/lib/utils';

// Vite bundles Leaflet's marker assets under hashed names, so wire them up
// explicitly (the CSS-relative defaults 404 otherwise).
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapPin {
  lat: number;
  lng: number;
  label: string;
  /** Optional thumbnail + link rendered inside the popup. */
  imageUrl?: string;
  href?: string;
  title?: string;
}

interface MapViewProps {
  pins: MapPin[];
  className?: string;
}

const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function boundsFor(pins: MapPin[]): L.LatLngBoundsExpression {
  return L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])).pad(0.4);
}

/** Leaflet map of shooting locations, themed to match dark/light mode. */
export function MapView({ pins, className }: MapViewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || pins.length === 0) {
    return <div className={cn('bg-muted', className)} aria-hidden />;
  }

  const isDark = resolvedTheme !== 'light';

  return (
    <div className={cn('relative z-0 overflow-hidden', className)} data-testid="map-view">
      <MapContainer
        bounds={boundsFor(pins)}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: 'transparent' }}
      >
        <TileLayer
          key={isDark ? 'dark' : 'light'}
          url={isDark ? DARK_TILES : LIGHT_TILES}
          attribution={ATTRIBUTION}
        />
        {pins.map((pin, i) => (
          <Marker key={`${pin.label}-${i}`} position={[pin.lat, pin.lng]}>
            <Popup>
              <div className="flex w-40 flex-col gap-2">
                {pin.imageUrl && (
                  <img
                    src={pin.imageUrl}
                    alt={pin.title ?? pin.label}
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="text-xs font-medium">{pin.title ?? pin.label}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-60">{pin.label}</div>
                {pin.href && (
                  <a href={pin.href} className="text-[11px] underline">
                    View project
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

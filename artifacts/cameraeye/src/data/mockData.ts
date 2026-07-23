import type { LocationMarker } from '@/components/PhotoLocationMap';
import type { PrintEdition } from '@/types/commerce';

export type ProjectCategory = 'editorial' | 'portrait' | 'campaign' | 'personal';
export type FilmFormatTag = '35mm' | 'Medium Format' | 'Large Format' | 'Digital';

export interface GearSpecs {
  camera: string;
  lens: string;
  filmStock: string;
  lighting?: string;
}

export interface MockProject {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  filmFormat: FilmFormatTag;
  year: number;
  client?: string;
  description: string;
  behindTheScenes: string;
  gear: GearSpecs;
  locations: LocationMarker[];
  edition: PrintEdition;
  featured: boolean;
  coverImageUrl: string;
  imageUrls: string[];
}

export const mockProjects: MockProject[] = [
  {
    id: "1",
    title: "Shadows & Light",
    slug: "shadows-and-light",
    category: "editorial",
    filmFormat: "35mm",
    year: 2023,
    client: "Vogue",
    description: "An exploration of harsh chiaroscuro lighting in modern fashion photography, highlighting the interplay between garment textures and absolute darkness.",
    behindTheScenes: "Shot over three cold rainstorms in Shinjuku alleys. We used single continuous tungsten sources pushed through diffusers to capture raw street contrast without disrupting passersby.",
    gear: {
      camera: "Leica M6 TTL",
      lens: "Summilux-M 35mm f/1.4 ASPH",
      filmStock: "Kodak Tri-X 400 (Pushed +2 to ISO 1600)",
      lighting: "Single Aputure 600d with Fresnel lens"
    },
    locations: [
      {
        id: "loc-1",
        name: "Shinjuku Omoide Yokocho",
        city: "Tokyo",
        country: "Japan",
        coordinates: "35.6938° N, 139.7003° E",
        notes: "Narrow alleyway reflections after midnight rain.",
        xPercent: 78,
        yPercent: 38
      },
      {
        id: "loc-2",
        name: "Ginza Underground Tunnel",
        city: "Tokyo",
        country: "Japan",
        coordinates: "35.6712° N, 139.7651° E",
        notes: "Subway architectural framing with harsh spotlighting.",
        xPercent: 82,
        yPercent: 40
      }
    ],
    edition: {
      id: "ed-1",
      totalLimit: 50,
      remainingStock: 14,
      digitalPriceUsd: 120,
      digitalPriceKrw: 162000,
      sizeOptions: [
        {
          id: "sz-a3",
          name: "A3 (297 x 420 mm) — Hahnemühle Photo Rag",
          dimensionsCm: { width: 29.7, height: 42 },
          weightKg: 0.6,
          priceUsd: 280,
          priceKrw: 378000
        },
        {
          id: "sz-a2",
          name: "A2 (420 x 594 mm) — Archival Pigment Edition",
          dimensionsCm: { width: 42, height: 59.4 },
          weightKg: 1.2,
          priceUsd: 450,
          priceKrw: 607500
        }
      ]
    },
    featured: true,
    coverImageUrl: "/images/editorial-1.jpg",
    imageUrls: ["/images/editorial-1.jpg", "/images/campaign-1.jpg"]
  },
  {
    id: "2",
    title: "Urban Desolation",
    slug: "urban-desolation",
    category: "personal",
    filmFormat: "Medium Format",
    year: 2022,
    description: "Cinematic wide shots capturing the quiet, moody atmosphere of the city just after dusk. Desaturated tones evoke a sense of isolation.",
    behindTheScenes: "Mounted on a heavy tripod atop a skyscraper parking bridge. The long exposures allowed fog and streetlights to create ethereal light pools.",
    gear: {
      camera: "Hasselblad 500C/M",
      lens: "Carl Zeiss Planar T* 80mm f/2.8",
      filmStock: "Fujifilm Pro 400H (120 Roll Film)",
      lighting: "Available twilight ambient light"
    },
    locations: [
      {
        id: "loc-3",
        name: "Hudson Yards Overlook",
        city: "New York",
        country: "USA",
        coordinates: "40.7538° N, 74.0022° W",
        notes: "Dusk sky blend against industrial brutalism.",
        xPercent: 28,
        yPercent: 34
      }
    ],
    edition: {
      id: "ed-2",
      totalLimit: 50,
      remainingStock: 4,
      digitalPriceUsd: 95,
      digitalPriceKrw: 128250,
      sizeOptions: [
        {
          id: "sz-u-a3",
          name: "A3 (297 x 420 mm) — Fine Art Glossy",
          dimensionsCm: { width: 29.7, height: 42 },
          weightKg: 0.7,
          priceUsd: 240,
          priceKrw: 324000
        },
        {
          id: "sz-u-a2",
          name: "A2 (420 x 594 mm) — Museum Cotton Rag",
          dimensionsCm: { width: 42, height: 59.4 },
          weightKg: 1.3,
          priceUsd: 410,
          priceKrw: 553500
        }
      ]
    },
    featured: true,
    coverImageUrl: "/images/urban-1.jpg",
    imageUrls: ["/images/urban-1.jpg", "/images/still-1.jpg"]
  },
  {
    id: "3",
    title: "Brutalism",
    slug: "brutalism-campaign",
    category: "campaign",
    filmFormat: "Digital",
    year: 2024,
    client: "Y-3",
    description: "A fashion campaign set against stark architectural concrete, emphasizing strong shadows and sharp silhouettes in a desolate environment.",
    behindTheScenes: "Shot in Berlin's iconic brutalist residential blocks. Low angle positioning accentuated geometric lines and model silhouettes.",
    gear: {
      camera: "Fujifilm GFX 100 II",
      lens: "GF 45mm f/2.8 R WR",
      filmStock: "Digital Medium Format RAW (Monochrome ACROS Profile)",
      lighting: "Hard sun + silver reflector"
    },
    locations: [
      {
        id: "loc-4",
        name: "Mäusebunker Architecture",
        city: "Berlin",
        country: "Germany",
        coordinates: "52.4331° N, 13.3195° E",
        notes: "Concrete geometry under harsh noon sun.",
        xPercent: 52,
        yPercent: 26
      }
    ],
    edition: {
      id: "ed-3",
      totalLimit: 50,
      remainingStock: 0, // Sold Out example
      digitalPriceUsd: 150,
      digitalPriceKrw: 202500,
      sizeOptions: [
        {
          id: "sz-b-a2",
          name: "A2 (420 x 594 mm) — Collector's Matte",
          dimensionsCm: { width: 42, height: 59.4 },
          weightKg: 1.1,
          priceUsd: 480,
          priceKrw: 648000
        }
      ]
    },
    featured: true,
    coverImageUrl: "/images/campaign-1.jpg",
    imageUrls: ["/images/campaign-1.jpg", "/images/urban-1.jpg", "/images/editorial-1.jpg"]
  },
  {
    id: "4",
    title: "Quiet Hours",
    slug: "quiet-hours",
    category: "portrait",
    filmFormat: "35mm",
    year: 2023,
    description: "Intimate portraits captured with soft window light. Shot on 35mm film to preserve the natural grain and emotional texture of the subjects.",
    behindTheScenes: "Captured in a daylight studio with linen curtains. Minimal direction allowed natural pauses and subtle facial gestures to surface.",
    gear: {
      camera: "Canon AE-1 Program",
      lens: "FD 50mm f/1.4 SSC",
      filmStock: "Kodak Portra 400",
      lighting: "North-facing window natural light"
    },
    locations: [
      {
        id: "loc-5",
        name: "Seongsu Daylight Studio",
        city: "Seoul",
        country: "South Korea",
        coordinates: "37.5446° N, 127.0559° E",
        notes: "Soft morning diffused sunlight.",
        xPercent: 81,
        yPercent: 36
      }
    ],
    edition: {
      id: "ed-4",
      totalLimit: 50,
      remainingStock: 22,
      digitalPriceUsd: 85,
      digitalPriceKrw: 114750,
      sizeOptions: [
        {
          id: "sz-q-a3",
          name: "A3 (297 x 420 mm) — Velvet Fine Art",
          dimensionsCm: { width: 29.7, height: 42 },
          weightKg: 0.6,
          priceUsd: 220,
          priceKrw: 297000
        }
      ]
    },
    featured: false,
    coverImageUrl: "/images/portrait-1.jpg",
    imageUrls: ["/images/portrait-1.jpg", "/images/editorial-1.jpg"]
  },
  {
    id: "5",
    title: "Form & Void",
    slug: "form-and-void",
    category: "editorial",
    filmFormat: "Large Format",
    year: 2024,
    client: "Kinfolk",
    description: "Abstract editorial still life focusing on high contrast shadows and minimal forms, reducing objects to their pure geometric essence.",
    behindTheScenes: "Created using 4x5 sheet film on a view camera. Movements and tilts were applied to achieve razor-sharp focus planes on sculptured ceramics.",
    gear: {
      camera: "Linhof Master Technika 4x5",
      lens: "Schneider Apo-Symmar 150mm f/5.6",
      filmStock: "Ilford HP5 Plus (4x5 Sheet Film)",
      lighting: "Single strobe with snoot"
    },
    locations: [
      {
        id: "loc-6",
        name: "SoHo Atelier Studio",
        city: "New York",
        country: "USA",
        coordinates: "40.7233° N, 74.0030° W",
        notes: "Controlled darkroom still life setup.",
        xPercent: 27,
        yPercent: 35
      }
    ],
    edition: {
      id: "ed-5",
      totalLimit: 50,
      remainingStock: 8,
      digitalPriceUsd: 110,
      digitalPriceKrw: 148500,
      sizeOptions: [
        {
          id: "sz-f-a3",
          name: "A3 (297 x 420 mm) — Baryta Satin Paper",
          dimensionsCm: { width: 29.7, height: 42 },
          weightKg: 0.7,
          priceUsd: 260,
          priceKrw: 351000
        }
      ]
    },
    featured: true,
    coverImageUrl: "/images/still-1.jpg",
    imageUrls: ["/images/still-1.jpg", "/images/portrait-1.jpg"]
  }
];

export const aboutData = {
  bio: "I am a photographer obsessed with the space between light and dark. My work explores narrative through absence, finding cinematic moments in quiet observations. Based in New York and Seoul, working globally.",
  portraitUrl: "/images/about-portrait.jpg",
  contactEmail: "contact@cameraeye.art",
  skills: ["35mm Street Photography", "Medium Format Portraiture", "Large Format Archival Printing", "Cinematic Lighting"]
};

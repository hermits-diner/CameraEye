/**
 * Photography genre slug. Open string: the canonical genre list lives in
 * the Sanity schema (studio/schemaTypes/project.ts) and may grow without
 * frontend changes. Known slugs get pretty labels via CATEGORY_LABELS.
 */
export type ProjectCategory = string;
export type CaptureFormat = '35mm' | '120' | 'digital';

export interface MockPhotoLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface MockProjectImage {
  url: string;
  alt: string;
  location?: MockPhotoLocation;
}

export interface MockProject {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  year: number;
  client?: string;
  description: string;
  /** Long-form series notes / behind-the-scenes story. */
  story?: string;
  /** Capture format tag shown across the site. */
  format: CaptureFormat;
  filmStock?: string;
  camera?: string;
  lenses?: string[];
  featured: boolean;
  coverImageUrl: string;
  images: MockProjectImage[];
}

export const mockProjects: MockProject[] = [
  {
    id: '1',
    title: 'Shadows & Light',
    slug: 'shadows-and-light',
    category: 'editorial',
    year: 2023,
    client: 'Vogue',
    description:
      'An exploration of harsh chiaroscuro lighting in modern fashion photography, highlighting the interplay between garment textures and absolute darkness.',
    story:
      'We built the entire set around a single 5K fresnel and a wall of black velvet. Every frame was metered for the highlights and let the shadows fall to true black — nothing was recovered in post. The garments were chosen for how their textures broke the single hard light source.\n\nShot over two days in a Brooklyn studio, the series became a study in restraint: one light, one lens, and the discipline to leave darkness alone.',
    format: 'digital',
    camera: 'Hasselblad X2D 100C',
    lenses: ['XCD 55V', 'XCD 90V'],
    featured: true,
    coverImageUrl: '/images/editorial-1.jpg',
    images: [
      { url: '/images/editorial-1.jpg', alt: 'Model in chiaroscuro light, black velvet backdrop' },
      { url: '/images/campaign-1.jpg', alt: 'Textured garment breaking a single hard light source' },
    ],
  },
  {
    id: '2',
    title: 'Urban Desolation',
    slug: 'urban-desolation',
    category: 'personal',
    year: 2022,
    description:
      'Cinematic wide shots capturing the quiet, moody atmosphere of the city just after dusk. Desaturated tones evoke a sense of isolation.',
    story:
      'Walked the same twelve blocks every night for a winter. The city empties out in the hour after dusk — commuters gone, nightlife not yet awake — and what remains is sodium vapor, wet asphalt and the occasional stranger.\n\nEverything was shot handheld at walking pace on CineStill 800T, pushed one stop. The halation around the streetlights is the film, not a filter.',
    format: '35mm',
    filmStock: 'CineStill 800T (+1)',
    camera: 'Leica M6',
    lenses: ['Summicron 35mm f/2'],
    featured: true,
    coverImageUrl: '/images/urban-1.jpg',
    images: [
      {
        url: '/images/urban-1.jpg',
        alt: 'Empty city street after dusk under sodium vapor light',
        location: { lat: 40.7181, lng: -73.9973, label: 'Bowery, New York' },
      },
      {
        url: '/images/still-1.jpg',
        alt: 'Quiet storefront still life at night',
        location: { lat: 40.7146, lng: -73.9935, label: 'Lower East Side, New York' },
      },
    ],
  },
  {
    id: '3',
    title: 'Brutalism',
    slug: 'brutalism-campaign',
    category: 'campaign',
    year: 2024,
    client: 'Y-3',
    description:
      'A fashion campaign set against stark architectural concrete, emphasizing strong shadows and sharp silhouettes in a desolate environment.',
    story:
      'The location — a decommissioned grain silo complex — did most of the work. We scheduled every look around the sun: raking side light in the morning for texture, hard top light at noon for the silhouettes.\n\nThe palette was reduced to concrete, black technical fabric and skin. Medium format kept the tonal transitions in the concrete smooth enough to print mural-size.',
    format: '120',
    filmStock: 'Ilford HP5+ 400',
    camera: 'Pentax 67II',
    lenses: ['105mm f/2.4'],
    featured: true,
    coverImageUrl: '/images/campaign-1.jpg',
    images: [
      {
        url: '/images/campaign-1.jpg',
        alt: 'Model silhouetted against raw concrete wall',
        location: { lat: 37.5665, lng: 126.9780, label: 'Seoul' },
      },
      { url: '/images/urban-1.jpg', alt: 'Concrete stairwell with hard top light' },
      { url: '/images/editorial-1.jpg', alt: 'Black technical fabric detail against concrete' },
    ],
  },
  {
    id: '4',
    title: 'Quiet Hours',
    slug: 'quiet-hours',
    category: 'portrait',
    year: 2023,
    description:
      'Intimate portraits captured with soft window light. Shot on 35mm film to preserve the natural grain and emotional texture of the subjects.',
    story:
      'Every sitting happened between 7 and 9 in the morning, in the subject’s own home, before the day started. No lights, no assistants — just north-facing window light and however much coffee it took for people to forget the camera.\n\nPortra keeps skin honest at box speed; the grain does the rest.',
    format: '35mm',
    filmStock: 'Kodak Portra 400',
    camera: 'Nikon F3',
    lenses: ['50mm f/1.4 AI-S'],
    featured: false,
    coverImageUrl: '/images/portrait-1.jpg',
    images: [
      { url: '/images/portrait-1.jpg', alt: 'Window-lit portrait in soft morning light' },
      { url: '/images/editorial-1.jpg', alt: 'Portrait study with natural grain' },
    ],
  },
  {
    id: '5',
    title: 'Form & Void',
    slug: 'form-and-void',
    category: 'editorial',
    year: 2024,
    client: 'Kinfolk',
    description:
      'Abstract editorial still life focusing on high contrast shadows and minimal forms, reducing objects to their pure geometric essence.',
    story:
      'A tabletop, a north window, and a set of found objects sprayed matte grey. The series reduces photography to its first principles: a form, the void around it, and the line where they meet.\n\nEach arrangement was left standing for a full day so we could shoot it at three different light angles and keep only one.',
    format: 'digital',
    camera: 'Fujifilm GFX 100 II',
    lenses: ['GF 110mm f/2'],
    featured: true,
    coverImageUrl: '/images/still-1.jpg',
    images: [
      { url: '/images/still-1.jpg', alt: 'Minimal still life with high contrast shadow' },
      { url: '/images/portrait-1.jpg', alt: 'Geometric form study in grey' },
    ],
  },
];

export const aboutData = {
  // 임시 소개문 — 실제 작가 소개가 정해지면 Studio의 About 문서에서 교체하세요.
  bio: '거리에서 마주치는 일상의 장면을 기록합니다. 스쳐 지나가는 순간 속에서 조용한 이야기를 찾습니다.\n\nI photograph everyday scenes met on the street — looking for quiet stories inside passing moments. Based in South Korea.',
  portraitUrl: '/images/about-portrait.jpg',
  skills: ['Street', 'Documentary', 'Fine art printing'],
  contactEmail: 'hermitsdiner@gmail.com',
  instagramHandle: 'hermitsdiner',
};

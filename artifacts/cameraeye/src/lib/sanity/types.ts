/** Genre slug — canonical list lives in the Sanity schema. */
export type ProjectCategory = string;

export type CaptureFormat = '35mm' | '120' | 'digital';

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface SanityGeopoint {
  _type: 'geopoint';
  lat: number;
  lng: number;
  alt?: number;
}

export interface SanityProjectImage extends SanityImage {
  /** Where the photo was taken (for the location map). */
  location?: SanityGeopoint;
  locationLabel?: string;
}

export interface Project {
  _id: string;
  _type: 'project';
  title: string;
  slug: { current: string };
  category: ProjectCategory;
  coverImage: SanityImage;
  images?: SanityProjectImage[];
  description?: string;
  /** Long-form series notes / behind-the-scenes story. */
  story?: string;
  format?: CaptureFormat;
  filmStock?: string;
  camera?: string;
  lenses?: string[];
  year?: number;
  client?: string;
  featured?: boolean;
  order?: number;
}

export interface About {
  _id: string;
  _type: 'about';
  bio: string;
  portrait: SanityImage;
  skills?: string[];
  contactEmail?: string;
  instagramHandle?: string;
}

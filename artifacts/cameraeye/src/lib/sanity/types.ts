export type ProjectCategory =
  | 'editorial'
  | 'portrait'
  | 'campaign'
  | 'personal';

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface Project {
  _id: string;
  _type: 'project';
  title: string;
  slug: { current: string };
  category: ProjectCategory;
  coverImage: SanityImage;
  images: SanityImage[];
  description?: string;
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
}

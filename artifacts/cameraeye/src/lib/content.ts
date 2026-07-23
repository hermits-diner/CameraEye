import { useQuery } from '@tanstack/react-query';
import { isSanityConfigured } from './sanity/client';
import {
  getAllProjects,
  getProjectBySlug,
  getAbout,
} from './sanity/queries';
import { urlForImage } from './sanity/image';
import type { Project as SanityProject, ProjectCategory } from './sanity/types';
import { mockProjects, aboutData, type MockProject, type FilmFormatTag, type GearSpecs } from '@/data/mockData';
import type { LocationMarker } from '@/components/PhotoLocationMap';
import type { PrintEdition } from '@/types/commerce';

export interface ProjectView {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  filmFormat: FilmFormatTag;
  year?: number;
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

export interface AboutView {
  bio: string;
  portraitUrl: string;
  contactEmail?: string;
  skills?: string[];
}

function fromMockProject(p: MockProject): ProjectView {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    filmFormat: p.filmFormat,
    year: p.year,
    client: p.client,
    description: p.description,
    behindTheScenes: p.behindTheScenes,
    gear: p.gear,
    locations: p.locations,
    edition: p.edition,
    featured: p.featured,
    coverImageUrl: p.coverImageUrl,
    imageUrls: p.imageUrls,
  };
}

function fromSanityProject(p: SanityProject): ProjectView {
  const fallback = mockProjects.find((m) => m.slug === p.slug?.current) || mockProjects[0];
  const imageUrls = p.images
    .map(urlForImage)
    .filter((url): url is string => url.length > 0);

  return {
    id: p._id,
    title: p.title,
    slug: p.slug?.current ?? '',
    category: p.category ?? fallback.category,
    filmFormat: p.filmFormat ?? fallback.filmFormat,
    year: p.year ?? fallback.year,
    client: p.client ?? fallback.client,
    description: p.description ?? fallback.description,
    behindTheScenes: p.behindTheScenes ?? fallback.behindTheScenes,
    gear: p.gearDetails ?? fallback.gear,
    locations: p.locations ?? fallback.locations,
    edition: p.edition ?? fallback.edition,
    featured: Boolean(p.featured),
    coverImageUrl: urlForImage(p.coverImage) || fallback.coverImageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : fallback.imageUrls,
  };
}

const mockProjectViews = (): ProjectView[] => mockProjects.map(fromMockProject);

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<ProjectView[]> => {
      if (isSanityConfigured) {
        try {
          const projects = await getAllProjects();
          if (projects.length > 0) return projects.map(fromSanityProject);
        } catch (err) {
          console.error('Sanity getAllProjects failed; using mock data.', err);
        }
      }
      return mockProjectViews();
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    enabled: slug.length > 0,
    queryFn: async (): Promise<ProjectView | null> => {
      if (isSanityConfigured) {
        try {
          const project = await getProjectBySlug(slug);
          if (project) return fromSanityProject(project);
        } catch (err) {
          console.error('Sanity getProjectBySlug failed; using mock data.', err);
        }
      }
      const mock = mockProjects.find((p) => p.slug === slug);
      return mock ? fromMockProject(mock) : null;
    },
  });
}

export function useAbout() {
  return useQuery({
    queryKey: ['about'],
    queryFn: async (): Promise<AboutView> => {
      if (isSanityConfigured) {
        try {
          const about = await getAbout();
          if (about) {
            return {
              bio: about.bio,
              portraitUrl: urlForImage(about.portrait),
              contactEmail: about.contactEmail,
              skills: about.skills,
            };
          }
        } catch (err) {
          console.error('Sanity getAbout failed; using mock data.', err);
        }
      }
      return { bio: aboutData.bio, portraitUrl: aboutData.portraitUrl, contactEmail: aboutData.contactEmail, skills: aboutData.skills };
    },
  });
}

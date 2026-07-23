import { useQuery } from '@tanstack/react-query';
import { aboutData, mockProjects, type MockProject } from '@/data/mockData';
import { getAbout, getAllProjects } from '@/lib/sanity/queries';
import type { Project as SanityProject } from '@/lib/sanity/types';
import type {
  AboutContent,
  PortfolioProject,
  ProjectImage,
} from './types';

/**
 * Content adapter: pages always consume {@link PortfolioProject} /
 * {@link AboutContent}. When VITE_SANITY_PROJECT_ID is set the data comes
 * from Sanity; otherwise the bundled mock content is served synchronously.
 */

export const sanityConfigured = Boolean(import.meta.env.VITE_SANITY_PROJECT_ID);

function fromMock(project: MockProject): PortfolioProject {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    year: project.year,
    ...(project.client ? { client: project.client } : {}),
    description: project.description,
    ...(project.story ? { story: project.story } : {}),
    format: project.format,
    ...(project.filmStock ? { filmStock: project.filmStock } : {}),
    ...(project.camera ? { camera: project.camera } : {}),
    ...(project.lenses ? { lenses: project.lenses } : {}),
    featured: project.featured,
    cover: { kind: 'url', src: project.coverImageUrl },
    images: project.images.map(
      (image): ProjectImage => ({
        source: { kind: 'url', src: image.url },
        alt: image.alt,
        ...(image.location ? { location: image.location } : {}),
      }),
    ),
  };
}

function fromSanity(project: SanityProject): PortfolioProject {
  return {
    id: project._id,
    title: project.title,
    slug: project.slug.current,
    category: project.category,
    year: project.year ?? new Date().getFullYear(),
    ...(project.client ? { client: project.client } : {}),
    description: project.description ?? '',
    ...(project.story ? { story: project.story } : {}),
    format: project.format ?? 'digital',
    ...(project.filmStock ? { filmStock: project.filmStock } : {}),
    ...(project.camera ? { camera: project.camera } : {}),
    ...(project.lenses ? { lenses: project.lenses } : {}),
    featured: project.featured ?? false,
    cover: { kind: 'sanity', image: project.coverImage },
    images: (project.images ?? []).map(
      (image): ProjectImage => ({
        source: { kind: 'sanity', image },
        alt: image.alt ?? project.title,
        ...(image.location
          ? {
              location: {
                lat: image.location.lat,
                lng: image.location.lng,
                label: image.locationLabel ?? project.title,
              },
            }
          : {}),
      }),
    ),
  };
}

const MOCK_PROJECTS: PortfolioProject[] = mockProjects.map(fromMock);

const MOCK_ABOUT: AboutContent = {
  bio: aboutData.bio,
  portrait: { kind: 'url', src: aboutData.portraitUrl },
  skills: aboutData.skills,
  contactEmail: aboutData.contactEmail,
  instagramHandle: aboutData.instagramHandle,
};

export function useProjects(): {
  projects: PortfolioProject[];
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: ['content', 'projects'],
    queryFn: async () => (await getAllProjects()).map(fromSanity),
    enabled: sanityConfigured,
    staleTime: 5 * 60 * 1000,
  });
  if (!sanityConfigured) return { projects: MOCK_PROJECTS, isLoading: false };
  return { projects: query.data ?? [], isLoading: query.isLoading };
}

export function useProject(slug: string | undefined): {
  project: PortfolioProject | undefined;
  projects: PortfolioProject[];
  isLoading: boolean;
} {
  const { projects, isLoading } = useProjects();
  return {
    project: slug ? projects.find((p) => p.slug === slug) : undefined,
    projects,
    isLoading,
  };
}

export function useAboutContent(): {
  about: AboutContent;
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: ['content', 'about'],
    queryFn: async () => {
      const about = await getAbout();
      if (!about) return MOCK_ABOUT;
      return {
        bio: about.bio,
        portrait: { kind: 'sanity', image: about.portrait },
        ...(about.skills ? { skills: about.skills } : {}),
        ...(about.contactEmail ? { contactEmail: about.contactEmail } : {}),
        ...(about.instagramHandle
          ? { instagramHandle: about.instagramHandle }
          : {}),
      } satisfies AboutContent;
    },
    enabled: sanityConfigured,
    staleTime: 5 * 60 * 1000,
  });
  if (!sanityConfigured) return { about: MOCK_ABOUT, isLoading: false };
  return { about: query.data ?? MOCK_ABOUT, isLoading: query.isLoading };
}

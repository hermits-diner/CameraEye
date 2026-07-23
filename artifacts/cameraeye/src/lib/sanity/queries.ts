import { client } from './client';
import type { Project, About } from './types';

const PROJECT_FIELDS = `
  _id,
  title,
  slug,
  category,
  filmFormat,
  coverImage,
  images,
  description,
  behindTheScenes,
  gearDetails,
  locations,
  edition,
  year,
  client,
  featured,
  order
`;

export async function getAllProjects(): Promise<Project[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "project"] | order(order asc, _createdAt desc) { ${PROJECT_FIELDS} }`
  );
}

export async function getFeaturedProjects(): Promise<Project[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "project" && featured == true] | order(order asc) { ${PROJECT_FIELDS} }`
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!client) return null;
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0] { ${PROJECT_FIELDS} }`,
    { slug }
  );
}

export async function getAbout(): Promise<About | null> {
  if (!client) return null;
  return client.fetch(`*[_type == "about"][0]`);
}

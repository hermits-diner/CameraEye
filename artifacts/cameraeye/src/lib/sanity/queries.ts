import { client } from './client';
import type { Project, About } from './types';

export async function getAllProjects(): Promise<Project[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "project"] | order(order asc, _createdAt desc) {
      _id,
      title,
      slug,
      category,
      coverImage,
      year,
      client,
      featured,
      order
    }`
  );
}

export async function getFeaturedProjects(): Promise<Project[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "project" && featured == true] | order(order asc) {
      _id,
      title,
      slug,
      category,
      coverImage,
      year,
      client,
      featured
    }`
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!client) return null;
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      category,
      coverImage,
      images,
      description,
      year,
      client
    }`,
    { slug }
  );
}

export async function getAbout(): Promise<About | null> {
  if (!client) return null;
  return client.fetch(`*[_type == "about"][0]`);
}

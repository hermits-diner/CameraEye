import { z } from "zod";

export type ProjectCategory = 'editorial' | 'portrait' | 'campaign' | 'personal';

export interface MockProject {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  year: number;
  client?: string;
  description: string;
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
    year: 2023,
    client: "Vogue",
    description: "An exploration of harsh chiaroscuro lighting in modern fashion photography, highlighting the interplay between garment textures and absolute darkness.",
    featured: true,
    coverImageUrl: "/images/editorial-1.jpg",
    imageUrls: ["/images/editorial-1.jpg", "/images/campaign-1.jpg"]
  },
  {
    id: "2",
    title: "Urban Desolation",
    slug: "urban-desolation",
    category: "personal",
    year: 2022,
    description: "Cinematic wide shots capturing the quiet, moody atmosphere of the city just after dusk. Desaturated tones evoke a sense of isolation.",
    featured: true,
    coverImageUrl: "/images/urban-1.jpg",
    imageUrls: ["/images/urban-1.jpg", "/images/still-1.jpg"]
  },
  {
    id: "3",
    title: "Brutalism",
    slug: "brutalism-campaign",
    category: "campaign",
    year: 2024,
    client: "Y-3",
    description: "A fashion campaign set against stark architectural concrete, emphasizing strong shadows and sharp silhouettes in a desolate environment.",
    featured: true,
    coverImageUrl: "/images/campaign-1.jpg",
    imageUrls: ["/images/campaign-1.jpg", "/images/urban-1.jpg", "/images/editorial-1.jpg"]
  },
  {
    id: "4",
    title: "Quiet Hours",
    slug: "quiet-hours",
    category: "portrait",
    year: 2023,
    description: "Intimate portraits captured with soft window light. Shot on 35mm film to preserve the natural grain and emotional texture of the subjects.",
    featured: false,
    coverImageUrl: "/images/portrait-1.jpg",
    imageUrls: ["/images/portrait-1.jpg", "/images/editorial-1.jpg"]
  },
  {
    id: "5",
    title: "Form & Void",
    slug: "form-and-void",
    category: "editorial",
    year: 2024,
    client: "Kinfolk",
    description: "Abstract editorial still life focusing on high contrast shadows and minimal forms, reducing objects to their pure geometric essence.",
    featured: true,
    coverImageUrl: "/images/still-1.jpg",
    imageUrls: ["/images/still-1.jpg", "/images/portrait-1.jpg"]
  }
];

export const aboutData = {
  bio: "I am a photographer obsessed with the space between light and dark. My work explores narrative through absence, finding cinematic moments in quiet observations. Based in New York, working globally.",
  portraitUrl: "/images/about-portrait.jpg"
};

/**
 * Sanity schema for portfolio projects.
 *
 * Setup: create a Sanity project (sanity.io), copy the files in
 * `sanity/schemas/` into its schema folder, then set VITE_SANITY_PROJECT_ID
 * (and optionally VITE_SANITY_DATASET, default "production") for the web
 * app. When the env var is present the site reads live Sanity content;
 * otherwise it falls back to the bundled mock data.
 */
import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Editorial', value: 'editorial' },
          { title: 'Portrait', value: 'portrait' },
          { title: 'Campaign', value: 'campaign' },
          { title: 'Personal', value: 'personal' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({
              name: 'location',
              title: 'Shooting location',
              type: 'geopoint',
              description: 'Shown on the location map (approximate is fine).',
            }),
            defineField({
              name: 'locationLabel',
              title: 'Location label',
              type: 'string',
              description: 'e.g. "Bowery, New York"',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'story',
      title: 'Series notes / behind the scenes',
      type: 'text',
      rows: 10,
      description: 'Long-form shooting story. Blank line separates paragraphs.',
    }),
    defineField({
      name: 'format',
      title: 'Capture format',
      type: 'string',
      options: {
        list: [
          { title: '35mm film', value: '35mm' },
          { title: 'Medium format (120)', value: '120' },
          { title: 'Digital', value: 'digital' },
        ],
        layout: 'radio',
      },
      initialValue: 'digital',
    }),
    defineField({ name: 'filmStock', title: 'Film stock', type: 'string' }),
    defineField({ name: 'camera', title: 'Camera', type: 'string' }),
    defineField({
      name: 'lenses',
      title: 'Lenses',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'year', title: 'Year', type: 'number' }),
    defineField({ name: 'client', title: 'Client', type: 'string' }),
    defineField({
      name: 'featured',
      title: 'Featured on home page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'coverImage' },
  },
});

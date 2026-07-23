import { defineField, defineType } from 'sanity';

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'skills',
      title: 'Skills / disciplines',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram handle (without @)',
      type: 'string',
    }),
  ],
  preview: {
    select: { media: 'portrait' },
    prepare: (selection) => ({ title: 'About', media: selection.media }),
  },
});

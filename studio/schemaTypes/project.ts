import { defineField, defineType } from 'sanity';
import { BulkImagesInput } from '../components/BulkImagesInput';

/** Photography genres available as project categories. */
export const PROJECT_CATEGORIES = [
  { title: 'Editorial', value: 'editorial' },
  { title: 'Portrait', value: 'portrait' },
  { title: 'Campaign / Commercial', value: 'campaign' },
  { title: 'Fashion', value: 'fashion' },
  { title: 'Street', value: 'street' },
  { title: 'Documentary', value: 'documentary' },
  { title: 'Landscape', value: 'landscape' },
  { title: 'Architecture', value: 'architecture' },
  { title: 'Still Life', value: 'still-life' },
  { title: 'Travel', value: 'travel' },
  { title: 'Event', value: 'event' },
  { title: 'Personal', value: 'personal' },
];

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
      description: '프로젝트의 사진 장르입니다.',
      options: {
        list: PROJECT_CATEGORIES,
        layout: 'dropdown',
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
      description:
        '여러 장을 한 번에 올리려면 파일들을 선택해 이 영역으로 드래그하세요. 한 장당 한 항목이 자동 생성됩니다.',
      options: { layout: 'grid' },
      components: { input: BulkImagesInput },
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

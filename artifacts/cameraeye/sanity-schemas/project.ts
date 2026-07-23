export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
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
      },
    },
    {
      name: 'filmFormat',
      title: 'Film / Camera Format Tag',
      type: 'string',
      options: {
        list: [
          { title: '35mm Film', value: '35mm' },
          { title: 'Medium Format 6x7', value: 'Medium Format' },
          { title: 'Large Format 4x5', value: 'Large Format' },
          { title: 'Digital Medium Format', value: 'Digital' },
        ],
      },
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'images',
      title: 'Project Images Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'description',
      title: 'Description / Series Note',
      type: 'text',
    },
    {
      name: 'behindTheScenes',
      title: 'Behind The Scenes Story',
      type: 'text',
    },
    {
      name: 'gearDetails',
      title: 'Gear & Film Stock Specifications',
      type: 'object',
      fields: [
        { name: 'camera', title: 'Camera Model', type: 'string' },
        { name: 'lens', title: 'Lens Specifications', type: 'string' },
        { name: 'filmStock', title: 'Film Stock / Sensor', type: 'string' },
        { name: 'lighting', title: 'Lighting Setup', type: 'string' },
      ],
    },
    {
      name: 'locations',
      title: 'Shooting Locations Coordinates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Location Name', type: 'string' },
            { name: 'city', title: 'City', type: 'string' },
            { name: 'country', title: 'Country', type: 'string' },
            { name: 'coordinates', title: 'GPS Coordinates (e.g. 35.6762° N, 139.6503° E)', type: 'string' },
            { name: 'notes', title: 'Notes', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'edition',
      title: 'Limited Edition Print Stock Settings',
      type: 'object',
      fields: [
        { name: 'totalLimit', title: 'Total Edition Count (e.g. 50)', type: 'number' },
        { name: 'remainingStock', title: 'Remaining Stock', type: 'number' },
        { name: 'digitalPriceUsd', title: 'Digital License Price ($)', type: 'number' },
        { name: 'digitalPriceKrw', title: 'Digital License Price (₩)', type: 'number' },
      ],
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
    },
    {
      name: 'client',
      title: 'Client',
      type: 'string',
    },
    {
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
    },
  ],
};

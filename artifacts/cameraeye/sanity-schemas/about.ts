export default {
  name: 'about',
  title: 'About Page',
  type: 'document',
  fields: [
    {
      name: 'bio',
      title: 'Biography / Artist Statement',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'portrait',
      title: 'Artist Portrait Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'skills',
      title: 'Specializations / Formats',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'instagramUrl',
      title: 'Instagram Profile URL',
      type: 'url',
    },
  ],
};

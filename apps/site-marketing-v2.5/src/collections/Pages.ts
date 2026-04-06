import { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Site Page',
    plural: 'Site Pages',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'hero_section',
      type: 'json',
      required: false,
    },
    {
      name: 'content_blocks',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        }
      ]
    },
    {
      name: 'seo_metadata',
      type: 'json',
    },
  ],
}

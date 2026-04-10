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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    },
    {
      name: 'summary',
      type: 'textarea',
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

import { CollectionConfig } from 'payload'

export const Chronicles: CollectionConfig = {
  slug: 'chronicles',
  labels: {
    singular: 'Chronicle',
    plural: 'Chronicles',
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'cover_image',
      type: 'text',
    },
    {
      name: 'external_url',
      type: 'text',
    },
    {
      name: 'published_at',
      type: 'date',
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
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}

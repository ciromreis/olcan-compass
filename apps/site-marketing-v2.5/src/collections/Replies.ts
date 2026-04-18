import { CollectionConfig } from 'payload'

export const Replies: CollectionConfig = {
  slug: 'replies',
  labels: {
    singular: 'Reply',
    plural: 'Replies',
  },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'community_item', 'createdAt'],
  },
  fields: [
    {
      name: 'community_item',
      type: 'relationship',
      relationTo: 'community-items',
      required: true,
      hasMany: false,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
}

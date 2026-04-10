import { CollectionConfig } from 'payload'

export const Archetypes: CollectionConfig = {
  slug: 'archetypes',
  labels: {
    singular: 'App Archetype',
    plural: 'App Archetypes',
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'fear_cluster_mapping',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'published',
    },
    {
      name: 'context_override',
      type: 'textarea',
    },
    {
      name: 'creature_override',
      type: 'text',
    },
    {
      name: 'abilities_override',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
    {
      name: 'visual_card',
      type: 'json',
    },
  ],
}

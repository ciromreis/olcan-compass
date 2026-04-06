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
      name: 'visual_card',
      type: 'json',
    },
  ],
}

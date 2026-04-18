import { CollectionConfig } from 'payload'

export const CommunityItems: CollectionConfig = {
  slug: 'community-items',
  labels: {
    singular: 'Community Item',
    plural: 'Community Items',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'topic', 'author_name', 'status'],
  },
  access: {
    read: () => true,
    create: () => true, // Open creation for App bridge
    update: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Question', value: 'question' },
        { label: 'Reference', value: 'reference' },
        { label: 'Artifact', value: 'artifact' },
      ],
    },
    {
      name: 'topic',
      type: 'select',
      required: true,
      options: [
        { label: 'Narrativa', value: 'narrative' },
        { label: 'Vistos', value: 'visa' },
        { label: 'Bolsas', value: 'scholarship' },
        { label: 'Entrevistas', value: 'interview' },
        { label: 'Carreira', value: 'career' },
        { label: 'Prontidão', value: 'readiness' },
        { label: 'Comunidade', value: 'community' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author_name',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do usuário vindo do App Compass',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'reference',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'reference',
      },
    },
    {
      name: 'is_official',
      type: 'checkbox',
      label: 'Resposta Oficial Olcan',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'published',
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
  ],
}

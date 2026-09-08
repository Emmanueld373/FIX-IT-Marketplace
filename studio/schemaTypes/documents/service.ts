import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const service = defineType({
  name: 'service',
  title: 'Service Listing',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Service Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'reference',
      to: [{ type: 'providerProfile' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'Short marketing summary for cards and search results.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'startingPrice',
      title: 'Starting Price (GHS)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [{ title: 'Ghana Cedi (GHS)', value: 'GHS' }],
      },
      initialValue: 'GHS',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'serviceAreas',
      title: 'Service Areas',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Locations where this specific service is offered (e.g. Accra, Tema, Kumasi).',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Detailed Description',
      type: 'blockContent',
      description: 'Full rich text description of the service.',
    }),
    defineField({
      name: 'includedTasks',
      title: 'Included Tasks',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Specific tasks included in this service (indexed for search matching).',
    }),
    defineField({
      name: 'exclusions',
      title: 'Exclusions',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Tasks or items explicitly not covered.',
    }),
    defineField({
      name: 'faqs',
      title: 'Frequently Asked Questions',
      type: 'array',
      of: [defineArrayMember({ type: 'faq' })],
    }),
    defineField({
      name: 'packages',
      title: 'Service Packages',
      type: 'array',
      of: [defineArrayMember({ type: 'servicePackage' })],
      description: 'Ordered list of service packages (e.g., Basic, Standard, Premium).',
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      provider: 'provider.displayName',
      price: 'startingPrice',
      currency: 'currency',
      media: 'coverImage',
    },
    prepare({ title, provider, price, currency, media }) {
      return {
        title,
        subtitle: `${provider ? `By ${provider} • ` : ''}${currency || 'GHS'} ${price || 0}`,
        media,
      }
    },
  },
})

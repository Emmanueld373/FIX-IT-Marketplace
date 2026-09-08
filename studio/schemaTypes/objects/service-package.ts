import { defineType, defineField, defineArrayMember } from 'sanity'
import { PackageIcon } from '@sanity/icons'

export const servicePackage = defineType({
  name: 'servicePackage',
  title: 'Service Package',
  type: 'object',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Package Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'price',
      title: 'Price (GHS)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'scope',
      title: 'Scope of Work',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'includedTasks',
      title: 'Included Tasks',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'exclusions',
      title: 'Exclusions',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'estimatedDuration',
      title: 'Estimated Duration',
      type: 'string',
      description: 'e.g. "2-3 hours", "1 day"',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
      duration: 'estimatedDuration',
    },
    prepare({ title, price, duration }) {
      return {
        title,
        subtitle: `GHS ${price || 0}${duration ? ` • ${duration}` : ''}`,
      }
    },
  },
})

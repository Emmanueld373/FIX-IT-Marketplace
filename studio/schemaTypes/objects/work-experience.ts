import { defineType, defineField } from 'sanity'
import { CaseIcon } from '@sanity/icons'

export const workExperience = defineType({
  name: 'workExperience',
  title: 'Work Experience',
  type: 'object',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'role',
      title: 'Role / Job Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company / Organization',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. Accra, Ghana',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'string',
      description: 'e.g. "2020" or "Jan 2020"',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'string',
      description: 'e.g. "Present" or "Dec 2023"',
    }),
    defineField({
      name: 'description',
      title: 'Description of Work',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'role',
      subtitle: 'company',
    },
  },
})

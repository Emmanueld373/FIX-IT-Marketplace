import { defineType, defineField } from 'sanity'
import { BookIcon } from '@sanity/icons'

export const education = defineType({
  name: 'education',
  title: 'Education',
  type: 'object',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'degreeOrCertificate',
      title: 'Degree / Diploma / Certificate',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'institution',
      title: 'Institution / School / Vocational Center',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year of Completion',
      type: 'string',
      description: 'e.g. "2019"',
    }),
  ],
  preview: {
    select: {
      title: 'degreeOrCertificate',
      subtitle: 'institution',
    },
  },
})

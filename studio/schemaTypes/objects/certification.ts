import { defineType, defineField } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'

export const certification = defineType({
  name: 'certification',
  title: 'Certification',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Certification Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'issuingOrganization',
      title: 'Issuing Organization',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'issueDate',
      title: 'Issue Date / Year',
      type: 'string',
    }),
    defineField({
      name: 'credentialUrl',
      title: 'Credential URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'issuingOrganization',
    },
  },
})

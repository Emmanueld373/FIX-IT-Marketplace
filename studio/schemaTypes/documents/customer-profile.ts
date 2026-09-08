import { defineType, defineField } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export const customerProfile = defineType({
  name: 'customerProfile',
  title: 'Customer Profile',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number (Private)',
      type: 'string',
      description: 'Private customer contact number. Never exposed in search.',
    }),
    defineField({
      name: 'address',
      title: 'Default Service Address (Private)',
      type: 'text',
      rows: 2,
      description: 'Private customer physical address. Never exposed in search.',
    }),
    defineField({
      name: 'city',
      title: 'City / Region',
      type: 'string',
      description: 'e.g. Accra, Kumasi, Tema',
    }),
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'email',
    },
  },
})

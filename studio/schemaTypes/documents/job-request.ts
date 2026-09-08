import { defineType, defineField } from 'sanity'
import { ClipboardIcon } from '@sanity/icons'

export const jobRequest = defineType({
  name: 'jobRequest',
  title: 'Job Request',
  type: 'document',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'reference',
      to: [{ type: 'customerProfile' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerClerkUserId',
      title: 'Customer Clerk User ID',
      type: 'string',
      description: 'Used for query filtering and access authorization.',
    }),
    defineField({
      name: 'category',
      title: 'Requested Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Request Title / Summary',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description of Need',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Service Location / City',
      type: 'string',
      description: 'e.g. East Legon, Accra',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'preferredDate',
      title: 'Preferred Date',
      type: 'date',
    }),
    defineField({
      name: 'scope',
      title: 'Scope Details',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'status',
      title: 'Request Status',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'Matched', value: 'matched' },
          { title: 'Closed', value: 'closed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'open',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      customer: 'customer.fullName',
      status: 'status',
    },
    prepare({ title, customer, status }) {
      return {
        title,
        subtitle: `${customer ? `From ${customer} • ` : ''}Status: ${status || 'open'}`,
      }
    },
  },
})

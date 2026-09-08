import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const booking = defineType({
  name: 'booking',
  title: 'Booking',
  type: 'document',
  icon: CalendarIcon,
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
      name: 'providerClerkUserId',
      title: 'Provider Clerk User ID',
      type: 'string',
      description: 'Used for query filtering and access authorization.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service Listing',
      type: 'reference',
      to: [{ type: 'service' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'agreedPackageName',
      title: 'Agreed Package Name',
      type: 'string',
      description: 'Snapshot of chosen package at booking time (e.g. Standard Cleaning).',
    }),
    defineField({
      name: 'agreedScope',
      title: 'Agreed Scope of Work',
      type: 'text',
      rows: 3,
      description: 'Immutable snapshot of agreed scope for this booking.',
    }),
    defineField({
      name: 'agreedPrice',
      title: 'Agreed Price',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'GHS',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'scheduledTime',
      title: 'Scheduled Appointment Time',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'serviceAddress',
      title: 'Service Address (Private)',
      type: 'text',
      rows: 2,
      description: 'Private customer address for service delivery. Never exposed in search.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'jobStatus',
      title: 'Job Status',
      type: 'string',
      options: {
        list: [
          { title: 'Requested', value: 'requested' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'requested',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Unpaid', value: 'unpaid' },
          { title: 'Pending', value: 'pending' },
          { title: 'Paid', value: 'paid' },
          { title: 'Refunded', value: 'refunded' },
        ],
        layout: 'radio',
      },
      initialValue: 'unpaid',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paymentReference',
      title: 'Payment Reference',
      type: 'string',
      description: 'Transaction ID or payment gateway reference token.',
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
      service: 'service.title',
      customer: 'customer.fullName',
      status: 'jobStatus',
      price: 'agreedPrice',
      currency: 'currency',
      date: 'scheduledTime',
    },
    prepare({ service, customer, status, price, currency, date }) {
      return {
        title: `${service || 'Service Booking'}${customer ? ` (${customer})` : ''}`,
        subtitle: `Status: ${status || 'requested'} • ${currency || 'GHS'} ${price || 0}${date ? ` • ${new Date(date).toLocaleDateString()}` : ''}`,
      }
    },
  },
})

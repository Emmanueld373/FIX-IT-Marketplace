import { defineType, defineField } from 'sanity'
import { StarIcon } from '@sanity/icons'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'booking',
      title: 'Completed Booking',
      type: 'reference',
      to: [{ type: 'booking' }],
      validation: (rule) => rule.required(),
      description: 'The completed booking this review is for (one review per completed booking).',
    }),
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
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{ type: 'service' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1 to 5 Stars)',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'reviewText',
      title: 'Review Text',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(10),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      service: 'service.title',
      provider: 'provider.displayName',
      customer: 'customer.fullName',
      rating: 'rating',
    },
    prepare({ service, provider, customer, rating }) {
      return {
        title: `${'★'.repeat(rating || 0)} for ${service || 'Service'}`,
        subtitle: `By ${customer || 'Customer'} • Pro: ${provider || 'Provider'}`,
      }
    },
  },
})

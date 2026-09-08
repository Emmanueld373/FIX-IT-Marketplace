import { defineType, defineField, defineArrayMember } from 'sanity'
import { CommentIcon } from '@sanity/icons'

export const conversation = defineType({
  name: 'conversation',
  title: 'Conversation',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'participants',
      title: 'Participant Clerk User IDs',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Clerk User IDs of participants allowed in this chat (customer and provider).',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'reference',
      to: [{ type: 'customerProfile' }],
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'reference',
      to: [{ type: 'providerProfile' }],
    }),
    defineField({
      name: 'booking',
      title: 'Related Booking (Optional)',
      type: 'reference',
      to: [{ type: 'booking' }],
    }),
    defineField({
      name: 'jobRequest',
      title: 'Related Job Request (Optional)',
      type: 'reference',
      to: [{ type: 'jobRequest' }],
    }),
    defineField({
      name: 'lastMessageText',
      title: 'Last Message Snippet',
      type: 'string',
    }),
    defineField({
      name: 'lastMessageAt',
      title: 'Last Message Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      customer: 'customer.fullName',
      provider: 'provider.displayName',
      lastMessage: 'lastMessageText',
    },
    prepare({ customer, provider, lastMessage }) {
      return {
        title: `${customer || 'Customer'} & ${provider || 'Provider'}`,
        subtitle: lastMessage || 'No messages yet',
      }
    },
  },
})

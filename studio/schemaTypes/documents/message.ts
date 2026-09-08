import { defineType, defineField } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons'

export const message = defineType({
  name: 'message',
  title: 'Message',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'conversation',
      title: 'Conversation',
      type: 'reference',
      to: [{ type: 'conversation' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'senderClerkUserId',
      title: 'Sender Clerk User ID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Message Text',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Sent At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'text',
      sender: 'senderClerkUserId',
      date: 'createdAt',
    },
    prepare({ title, sender, date }) {
      return {
        title: title ? (title.length > 50 ? `${title.slice(0, 50)}...` : title) : 'Message',
        subtitle: `From: ${sender || 'Unknown'}${date ? ` • ${new Date(date).toLocaleTimeString()}` : ''}`,
      }
    },
  },
})

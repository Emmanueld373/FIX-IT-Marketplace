import { defineType, defineField, defineArrayMember } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const providerProfile = defineType({
  name: 'providerProfile',
  title: 'Provider Profile',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'displayName',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      description: 'The owning Clerk User ID for authentication and private dashboard access.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),
    defineField({
      name: 'headline',
      title: 'Professional Headline',
      type: 'string',
      description: 'Short professional tagline (e.g. "Licensed Master Electrician with 8+ years experience")',
    }),
    defineField({
      name: 'expertise',
      title: 'Expertise / Trades',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Key skills and trades (e.g. Plumbing, Pipe Fitting, Water Heater Installation)',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'blockContent',
      description: 'Detailed provider biography in Portable Text.',
    }),
    defineField({
      name: 'languages',
      title: 'Languages Spoken',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'serviceAreas',
      title: 'Service Areas',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Cities or regions served in Ghana (e.g. Accra, Tema, Kumasi, Takoradi, East Legon).',
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      description: 'e.g. "Mon - Sat: 8:00 AM - 6:00 PM"',
    }),
    defineField({
      name: 'portfolio',
      title: 'Portfolio Items',
      type: 'array',
      of: [defineArrayMember({ type: 'portfolioItem' })],
    }),
    defineField({
      name: 'workExperience',
      title: 'Work Experience',
      type: 'array',
      of: [defineArrayMember({ type: 'workExperience' })],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [defineArrayMember({ type: 'education' })],
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications & Licenses',
      type: 'array',
      of: [defineArrayMember({ type: 'certification' })],
    }),
    defineField({
      name: 'onboardingStatus',
      title: 'Onboarding Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'verificationStatus',
      title: 'Identity Verification Status',
      type: 'string',
      options: {
        list: [
          { title: 'Unverified', value: 'unverified' },
          { title: 'Pending Review', value: 'pending' },
          { title: 'Verified', value: 'verified' },
        ],
        layout: 'radio',
      },
      initialValue: 'unverified',
    }),
    defineField({
      name: 'backgroundCheckStatus',
      title: 'Background Check Status',
      type: 'string',
      options: {
        list: [
          { title: 'Not Started', value: 'not_started' },
          { title: 'In Review', value: 'in_review' },
          { title: 'Passed', value: 'passed' },
          { title: 'Failed', value: 'failed' },
        ],
        layout: 'radio',
      },
      initialValue: 'not_started',
    }),
  ],
  preview: {
    select: {
      title: 'displayName',
      subtitle: 'headline',
      media: 'photo',
    },
  },
})

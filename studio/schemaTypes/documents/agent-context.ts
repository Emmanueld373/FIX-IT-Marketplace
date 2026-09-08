import { defineType, defineField } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const agentContext = defineType({
  name: 'agentContext',
  title: 'Search Agent Context',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Configuration Name',
      type: 'string',
      initialValue: 'Fix it Search Agent Context',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contentScopeFilter',
      title: 'Content Scope Filter (GROQ)',
      type: 'text',
      rows: 6,
      description:
        'Defines the types and fields visible to the search agent. Excludes private customer, booking, message, payment, and verification data.',
      initialValue: `*[_type in ["service", "category", "providerProfile"] && (!defined(status) || status == "published")] {
  _id,
  _type,
  title,
  displayName,
  slug,
  summary,
  startingPrice,
  currency,
  serviceAreas,
  includedTasks,
  exclusions,
  expertise,
  headline,
  languages,
  "category": category->{ _id, title, slug },
  "provider": provider->{ _id, displayName, slug, verificationStatus }
}`,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'searchInstructions',
      title: 'Search Query & Ranking Instructions',
      type: 'text',
      rows: 12,
      description:
        'Instructions for the search agent LLM on query interpretation, ranking, Ghana locations, and grounding rules.',
      initialValue: `You are the Fix it search engine for local Ghanaian services (Accra, Kumasi, Tema, Takoradi, etc.).
- Match service titles, categories, and included tasks first. Descriptions and provider expertise are secondary.
- Always rank exact service matches above general category matches.
- Filter strictly by the customer's selected location, budget, and availability if specified.
- Ground every result card strictly in stored Sanity data. Never invent services, prices, providers, ratings, or availability.
- Prices must be displayed in GHS.
- Exclude private customer details, messages, and unconfirmed bookings.`,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'Search Agent Context',
        subtitle: 'Search configuration & content scope filter',
      }
    },
  },
})

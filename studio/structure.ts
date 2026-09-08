import type { StructureResolver } from 'sanity/structure'
import {
  TagIcon,
  DocumentTextIcon,
  UserIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardIcon,
  StarIcon,
  CommentIcon,
  EnvelopeIcon,
  CogIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Fix it Marketplace')
    .items([
      S.listItem()
        .title('Public Marketplace')
        .child(
          S.list()
            .title('Marketplace Content')
            .items([
              S.documentTypeListItem('service')
                .title('Services')
                .icon(DocumentTextIcon),
              S.documentTypeListItem('category')
                .title('Categories')
                .icon(TagIcon),
              S.documentTypeListItem('providerProfile')
                .title('Provider Profiles')
                .icon(UserIcon),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Bookings & Operations')
        .child(
          S.list()
            .title('Operations')
            .items([
              S.documentTypeListItem('booking')
                .title('Bookings')
                .icon(CalendarIcon),
              S.documentTypeListItem('jobRequest')
                .title('Job Requests')
                .icon(ClipboardIcon),
              S.documentTypeListItem('customerProfile')
                .title('Customer Profiles')
                .icon(UsersIcon),
              S.documentTypeListItem('review')
                .title('Reviews & Ratings')
                .icon(StarIcon),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Customer-Provider Messaging')
        .child(
          S.list()
            .title('Messaging')
            .items([
              S.documentTypeListItem('conversation')
                .title('Conversations')
                .icon(CommentIcon),
              S.documentTypeListItem('message')
                .title('Messages')
                .icon(EnvelopeIcon),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Search Configuration')
        .child(
          S.list()
            .title('Search Engine & AI Context')
            .items([
              S.documentTypeListItem('agentContext')
                .title('Search Agent Context')
                .icon(CogIcon),
            ])
        ),
    ])

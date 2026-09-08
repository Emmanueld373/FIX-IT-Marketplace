import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'csp17c7x';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-06';

// Read-only client (uses CDN)
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

function cleanToken(t) {
  if (!t || t.includes('your_private') || t.includes('placeholder')) return undefined;
  return t;
}

// Write client (bypasses CDN, uses tokens)
export function getWriteClient() {
  const rawToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;
  const token = cleanToken(rawToken);
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}

// Server client (read with token, no CDN)
export function getServerClient(options = {}) {
  const rawToken = options.useWriteToken
    ? process.env.SANITY_API_WRITE_TOKEN
    : process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
  const token = cleanToken(rawToken);

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}

// Image URL builder
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source) {
  return builder.image(source);
}

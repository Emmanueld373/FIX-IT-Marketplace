import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'csp17c7x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  typegen: {
    path: '../**/*.{ts,tsx}',
    schema: './schemaTypes/index.ts',
    generates: '../sanity.types.ts',
  },
})

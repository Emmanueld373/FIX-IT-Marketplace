import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');

const pId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.*)/)[1].trim().replace(/['"]/g, '');
const ds = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.*)/)[1].trim().replace(/['"]/g, '');
const tok = env.match(/SANITY_API_READ_TOKEN=(.*)/)[1].trim().replace(/['"]/g, '');

async function testCategory(slug, mappedSlug) {
  const query = `*[_type == "service" && (
    category->slug.current == $slug || 
    category->slug.current == $mappedSlug ||
    lower(category->title) match $catLower
  ) && status == "published"]{
    _id,
    title,
    "slug": slug.current,
    "catSlug": category->slug.current,
    "catTitle": category->title,
    "providerName": provider->displayName
  }`;

  const params = {
    slug,
    mappedSlug,
    catLower: '*' + slug.replace(/-/g, ' ') + '*',
  };

  const url = `https://${pId}.api.sanity.io/v2024-01-01/data/query/${ds}?query=` + encodeURIComponent(query) +
    `&$slug=${encodeURIComponent(JSON.stringify(slug))}&$mappedSlug=${encodeURIComponent(JSON.stringify(mappedSlug))}&$catLower=${encodeURIComponent(JSON.stringify(params.catLower))}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
  const data = await res.json();
  console.log(`Results for ${slug} / ${mappedSlug}:`, data.result?.length, data.result);
}

async function run() {
  await testCategory('electrical-repairs', 'electrical-repairs');
  await testCategory('cleaning', 'house-cleaning');
  await testCategory('house-cleaning', 'house-cleaning');
}

run();

import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');

const pId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.*)/)[1].trim().replace(/['"]/g, '');
const ds = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.*)/)[1].trim().replace(/['"]/g, '');
const tok = env.match(/SANITY_API_READ_TOKEN=(.*)/)[1].trim().replace(/['"]/g, '');

async function check() {
  const url = `https://${pId}.api.sanity.io/v2024-01-01/data/query/${ds}?query=` + encodeURIComponent(`{
    "categories": *[_type == "category"]{ _id, title, "slug": slug.current },
    "services": *[_type == "service"]{ _id, title, status, "categoryTitle": category->title, "categorySlug": category->slug.current, "categoryRef": category._ref, "providerName": provider->displayName }
  }`);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
  const data = await res.json();
  console.log(JSON.stringify(data.result, null, 2));
}

check();

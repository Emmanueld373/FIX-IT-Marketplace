import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');

const pId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.*)/)[1].trim().replace(/['"]/g, '');
const ds = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.*)/)[1].trim().replace(/['"]/g, '');
const tok = env.match(/SANITY_API_READ_TOKEN=(.*)/)[1].trim().replace(/['"]/g, '');

async function main() {
  const query = `{
    "providers": *[_type == "providerProfile"]{
      _id,
      displayName,
      clerkUserId,
      expertise,
      onboardingStatus,
      verified,
      "photoUrl": photo.asset->url,
      "services": *[_type == "service" && (provider._ref == ^._id || provider->clerkUserId == ^.clerkUserId)]{
        _id,
        title,
        status,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current,
        "categoryRef": category._ref
      }
    },
    "orphanServices": *[_type == "service" && !defined(provider)]{
      _id,
      title,
      status,
      "categoryTitle": category->title,
      "categorySlug": category->slug.current
    }
  }`;

  const url = `https://${pId}.api.sanity.io/v2024-01-01/data/query/${ds}?query=` + encodeURIComponent(query);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
  const data = await res.json();

  console.log("=== PROVIDERS & SERVICES IN SANITY ===");
  for (const p of data.result.providers) {
    console.log(`\nProvider: ${p.displayName} (Clerk ID: ${p.clerkUserId})`);
    console.log(`  _id: ${p._id}, verified: ${p.verified}, onboarding: ${p.onboardingStatus}`);
    console.log(`  Photo URL:`, p.photoUrl);
    console.log(`  Expertise:`, p.expertise);
    console.log(`  Services (${p.services?.length || 0}):`);
    p.services?.forEach(s => {
      console.log(`    - [${s.status}] "${s.title}" -> Cat: "${s.categoryTitle}" (${s.categorySlug})`);
    });
  }

  if (data.result.orphanServices?.length > 0) {
    console.log("\n=== SERVICES WITHOUT PROVIDER REFERENCE ===");
    data.result.orphanServices.forEach(s => {
      console.log(`  - [${s.status}] "${s.title}" -> Cat: "${s.categoryTitle}" (${s.categorySlug})`);
    });
  }
}

main().catch(console.error);

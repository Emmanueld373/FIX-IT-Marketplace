import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');

const pId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.*)/)[1].trim().replace(/['"]/g, '');
const ds = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.*)/)[1].trim().replace(/['"]/g, '');
const writeToken = env.match(/SANITY_API_WRITE_TOKEN=(.*)/)[1].trim().replace(/['"]/g, '');

async function main() {
  console.log("Fetching Cherith Tv profile and service...");

  const fetchUrl = `https://${pId}.api.sanity.io/v2024-01-01/data/query/${ds}?query=` + encodeURIComponent(`{
    "provider": *[_type == "providerProfile" && clerkUserId == "user_3IzuC3iqhPJ0iQaCbf7MnmuI2a7"][0]{
      _id,
      displayName,
      "photoAssetRef": photo.asset._ref,
      "photoUrl": photo.asset->url
    },
    "services": *[_type == "service" && provider->clerkUserId == "user_3IzuC3iqhPJ0iQaCbf7MnmuI2a7"]{
      _id,
      title,
      coverImage
    }
  }`);

  const res = await fetch(fetchUrl, { headers: { Authorization: `Bearer ${writeToken}` } });
  const data = await res.json();
  const { provider, services } = data.result;

  console.log("Provider:", provider);
  console.log("Services:", services);

  if (!provider?.photoAssetRef) {
    console.error("No photoAssetRef found on provider profile!");
    return;
  }

  for (const s of services) {
    console.log(`Patching service ${s._id} (${s.title}) with coverImage -> ${provider.photoAssetRef}...`);

    const mutateUrl = `https://${pId}.api.sanity.io/v2024-01-01/data/mutate/${ds}`;
    const mutation = {
      mutations: [
        {
          patch: {
            id: s._id,
            set: {
              coverImage: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: provider.photoAssetRef
                }
              }
            }
          }
        }
      ]
    };

    const mutRes = await fetch(mutateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${writeToken}`
      },
      body: JSON.stringify(mutation)
    });

    const mutData = await mutRes.json();
    console.log("Patch response:", mutData);
  }

  console.log("\nAll services patched successfully!");
}

main().catch(console.error);

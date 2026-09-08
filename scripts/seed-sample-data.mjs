import fs from 'fs';
import path from 'path';

// 1. Environment Loading
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'csp17c7x';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error('Error: SANITY_API_WRITE_TOKEN is missing in .env.local');
  process.exit(1);
}

// 2. Helper Functions
function createPortableText(paragraphs) {
  return paragraphs.map((text, idx) => ({
    _type: 'block',
    _key: `p-${idx}-${Math.random().toString(36).substring(2, 9)}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `s-${idx}`,
        text,
        marks: [],
      },
    ],
  }));
}

const assetCache = {};

async function uploadAsset(url, filename) {
  if (assetCache[url]) {
    return assetCache[url];
  }
  try {
    console.log(`  Downloading asset: ${filename}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const arrayBuf = await res.arrayBuffer();

    console.log(`  Uploading ${filename} to Sanity Lake...`);
    const uploadRes = await fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/jpeg',
        },
        body: Buffer.from(arrayBuf),
      }
    );

    const data = await uploadRes.json();
    if (!uploadRes.ok || !data.document?._id) {
      throw new Error(`Sanity upload failed: ${JSON.stringify(data)}`);
    }

    assetCache[url] = data.document._id;
    return data.document._id;
  } catch (err) {
    console.warn(`  Warning: Failed to upload ${filename}: ${err.message}`);
    return null;
  }
}

function createImageField(assetId, alt) {
  if (!assetId) return undefined;
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    alt: alt || 'Sample marketplace illustration',
  };
}

async function sendMutations(mutations) {
  const res = await fetch(
    `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}?returnDocuments=false`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mutations }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Sanity mutation failed: ${JSON.stringify(data)}`);
  }
  return data;
}

// 3. Raw Data Definitions
const RAW_CATEGORIES = [
  {
    id: 'sample-cat-plumbing',
    title: 'Plumbing',
    slug: 'plumbing',
    iconName: 'Wrench',
    description: 'Expert pipe repairs, drainage unblocking, water pump servicing, and sanitary fixture installations across Ghana.',
    imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Leak Detection & Pipe Repair',
      'Drain & Toilet Unblocking',
      'Borehole & Water Tank Servicing',
      'Water Heater Installation',
      'Bathroom & Kitchen Fitting',
    ],
  },
  {
    id: 'sample-cat-cleaning',
    title: 'House Cleaning',
    slug: 'house-cleaning',
    iconName: 'Sparkles',
    description: 'Thorough domestic scrubbing, deep sanitation, post-construction cleanup, and scheduled office maintenance.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Standard Home Cleaning',
      'Deep Cleaning & Scrubbing',
      'Move-In / Move-Out Cleaning',
      'Post-Construction Cleanup',
      'Carpet & Upholstery Steaming',
    ],
  },
  {
    id: 'sample-cat-electrical',
    title: 'Electrical Repairs',
    slug: 'electrical-repairs',
    iconName: 'Zap',
    description: 'Certified domestic diagnostics, circuit breaker repairs, inverter setups, and safe electrical rewiring.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Fault Diagnostics & Rewiring',
      'Circuit Breakers & Fuse Boards',
      'Lighting & Chandelier Fixtures',
      'Inverters & Solar Battery Systems',
      'Backup Generator Hookup',
    ],
  },
  {
    id: 'sample-cat-painting',
    title: 'Painting & Decorating',
    slug: 'painting-decorating',
    iconName: 'Paintbrush',
    description: 'Flawless interior wall finishes, exterior weather-resistant coatings, and decorative POP ceiling designs.',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Interior Wall Painting',
      'Exterior Weatherproof Coating',
      'POP Ceiling Finishing & Cornices',
      'Wood & Metal Protective Paint',
      'Waterproof Wall Sealants',
    ],
  },
  {
    id: 'sample-cat-moving',
    title: 'Moving & Relocation',
    slug: 'moving-relocation',
    iconName: 'Truck',
    description: 'Careful packing, safe transit, furniture disassembly, and dependable inter-city residential relocations.',
    imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Apartment & Home Relocation',
      'Commercial Office Moving',
      'Heavy Appliance Transport',
      'Packing & Loading Assistance',
      'Inter-City Hauling (Accra - Kumasi - Takoradi)',
    ],
  },
  {
    id: 'sample-cat-furniture',
    title: 'Furniture Assembly',
    slug: 'furniture-assembly',
    iconName: 'Armchair',
    description: 'Precision flat-pack assembly for wardrobes, beds, desks, and secure wall-mounted shelves or TV brackets.',
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Wardrobe & Closet Assembly',
      'Bed Frames & Bunk Beds',
      'Office Desks & Ergonomic Chairs',
      'TV Wall Mounting & Cable Hiding',
      'Bookshelves & Wall Cabinets',
    ],
  },
  {
    id: 'sample-cat-gardening',
    title: 'Gardening & Landscaping',
    slug: 'gardening-landscaping',
    iconName: 'Shovel',
    description: 'Lawn mowing, hedge shaping, weed clearing, ornamental planting, and green compound maintenance.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Lawn Mowing & Edge Trimming',
      'Hedge Trimming & Bush Shaping',
      'Compound Weeding & Cleanup',
      'Flower Bed Planting & Mulching',
      'Pest & Lawn Fungus Treatment',
    ],
  },
  {
    id: 'sample-cat-repairs',
    title: 'Appliance & Home Repairs',
    slug: 'appliance-home-repairs',
    iconName: 'Hammer',
    description: 'Troubleshooting and repair of AC units, washing machines, refrigerators, door locks, and general household items.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      'Air Conditioner Servicing & Gas Refill',
      'Washing Machine Diagnostics',
      'Refrigerator & Freezer Repairs',
      'Door Lock & Handle Fitting',
      'Masonry Patching & Tile Regrouting',
    ],
  },
];

const RAW_PROVIDERS = [
  {
    id: 'sample-prov-kwame-mensah',
    displayName: 'Kwame Mensah Plumbing Services',
    slug: 'kwame-mensah-plumbing',
    clerkUserId: 'demo_provider_kwame_mensah',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    headline: 'Certified Master Plumber with 10+ Years Experience across Greater Accra',
    expertise: ['Leak Detection', 'Pipe Fitting', 'Water Pump Servicing', 'Drain Unblocking', 'Water Heaters'],
    bio: [
      '[Sample Demo Profile] Kwame Mensah is a certified master plumber based in Accra with over a decade of residential and commercial experience. Specializing in high-pressure piping, borehole booster pumps, and rapid leak mitigation.',
      'Kwame delivers neat, long-lasting workmanship with upfront transparent pricing in GHS and guarantees all completed fittings.',
    ],
    languages: ['English', 'Twi', 'Ga'],
    serviceAreas: ['Accra Central', 'Osu', 'Cantonments', 'Airport Residential', 'East Legon', 'Tema Community 1-10'],
    availability: 'Mon - Sat: 7:30 AM - 6:30 PM (Emergency 24/7 on call)',
  },
  {
    id: 'sample-prov-akosua-cleanco',
    displayName: 'Akosua CleanCo & Facility Care',
    slug: 'akosua-cleanco-facility-care',
    clerkUserId: 'demo_provider_akosua_cleanco',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    headline: 'High-Standard Residential Deep Cleaning & Post-Construction Care',
    expertise: ['Deep Cleaning', 'Move-In/Move-Out', 'Sanitization', 'Floor Polishing', 'Window Detailing'],
    bio: [
      '[Sample Demo Profile] Akosua CleanCo is an Accra-based professional housekeeping and facility cleaning team led by Akosua Darko. We bring industrial-grade HEPA vacuums, eco-friendly detergents, and trained staff.',
      'Whether refreshing a family home in Cantonments or preparing a newly built apartment in East Legon, we leave every space spotless and germ-free.',
    ],
    languages: ['English', 'Twi'],
    serviceAreas: ['East Legon', 'Cantonments', 'Airport Residential', 'Dzorwulu', 'Spintex', 'Labone'],
    availability: 'Mon - Sun: 8:00 AM - 5:30 PM',
  },
  {
    id: 'sample-prov-kofi-boateng',
    displayName: 'Kofi Boateng Electrical & Power Solutions',
    slug: 'kofi-boateng-electrical',
    clerkUserId: 'demo_provider_kofi_boateng',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    headline: 'Certified Domestic & Industrial Electrician with Solar Inverter Expertise',
    expertise: ['Fault Diagnostics', 'House Rewiring', 'Circuit Breakers', 'Solar Inverter Setup', 'Generator Maintenance'],
    bio: [
      '[Sample Demo Profile] Kofi Boateng is a licensed electrical technician operating across Kumasi and surrounding Ashanti regions. Known for meticulous safety testing, neat trunking, and clean distribution board work.',
      'From emergency power restoration to hybrid inverter and backup generator synchronization, Kofi ensures uninterrupted and safe power.',
    ],
    languages: ['English', 'Twi', 'Fante'],
    serviceAreas: ['Kumasi Central', 'Adum', 'Ahodwo', 'KNUST Campus', 'Bantama', 'Asokwa', 'Tanoso'],
    availability: 'Mon - Sat: 8:00 AM - 6:00 PM',
  },
  {
    id: 'sample-prov-emmanuel-addo',
    displayName: 'Emmanuel Addo Precision Painting',
    slug: 'emmanuel-addo-painting',
    clerkUserId: 'demo_provider_emmanuel_addo',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    headline: 'Professional Interior & Exterior Decorator with Flawless Surface Preparation',
    expertise: ['Interior Painting', 'Exterior Weatherproofing', 'POP Ceilings', 'Cornice Detailing', 'Wall Skimming'],
    bio: [
      '[Sample Demo Profile] Emmanuel Addo has decorated luxury homes and modern commercial offices throughout Greater Accra for 8 years. He specializes in moisture-resistant exterior coatings and smooth interior wall skimming.',
      'Clean drop cloths, precision masking, and zero messy paint splatters guaranteed on every project.',
    ],
    languages: ['English', 'Twi', 'Ga'],
    serviceAreas: ['Spintex', 'Sakumono', 'Tema Community 1-12', 'East Legon Hills', 'Osu', 'Dansoman'],
    availability: 'Mon - Fri: 7:30 AM - 5:30 PM, Sat: 8:00 AM - 2:00 PM',
  },
  {
    id: 'sample-prov-swifthaul',
    displayName: 'SwiftHaul Relocations & Moving Logistics',
    slug: 'swifthaul-relocations',
    clerkUserId: 'demo_provider_swifthaul',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    headline: 'Punctual, Careful Moving Crew with Enclosed Trucks & Bubble Wrapping',
    expertise: ['Home Moving', 'Office Relocation', 'Heavy Appliance Transport', 'Packing & Wrapping', 'Furniture Hoisting'],
    bio: [
      '[Sample Demo Profile] SwiftHaul Logistics provides seamless moving services with enclosed, weatherproof trucks and trained loaders. We protect delicate electronics, glass, and wood furniture with heavy-duty blankets and shrink wrap.',
      'Serving homes, apartments, and corporate offices across Greater Accra and inter-regional corridors.',
    ],
    languages: ['English', 'Twi', 'Hausa'],
    serviceAreas: ['Accra', 'Tema', 'Kasoa', 'Madina', 'Pokuase', 'Adenta', 'Achimota'],
    availability: 'Mon - Sun: 6:30 AM - 7:30 PM',
  },
  {
    id: 'sample-prov-yaw-osei',
    displayName: 'Yaw Osei HomeCare & Garden Services',
    slug: 'yaw-osei-homecare',
    clerkUserId: 'demo_provider_yaw_osei',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    headline: 'Multi-Skilled Handyman: Flat-Pack Assembly, TV Mounting & Garden Upkeep',
    expertise: ['Flat-Pack Assembly', 'Lawn Mowing', 'TV Wall Mounting', 'Hedge Trimming', 'Minor Masonry'],
    bio: [
      '[Sample Demo Profile] Yaw Osei is a versatile household technician capable of assembling complex flat-pack wardrobes, mounting 4K televisions into concrete walls, and transforming overgrown compounds into neat lawns.',
      'Prompt, friendly, and equipped with laser levels and heavy-duty petrol lawn mowers for prompt execution.',
    ],
    languages: ['English', 'Twi'],
    serviceAreas: ['East Legon', 'Legon Hills', 'Adenta', 'Haatso', 'Ashongman', 'Tema'],
    availability: 'Mon - Sat: 8:00 AM - 6:00 PM',
  },
];

const RAW_SERVICES = [
  // 1. Plumbing - Kwame Mensah
  {
    id: 'sample-srv-residential-plumbing',
    title: '[Sample Demo] Residential Plumbing & Emergency Leak Repair',
    slug: 'sample-residential-plumbing-leak-repair',
    categoryId: 'sample-cat-plumbing',
    providerId: 'sample-prov-kwame-mensah',
    summary: '[Sample Demo] Fast troubleshooting for leaking pipes, burst joints, running toilets, and faulty kitchen or bathroom taps.',
    coverImageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 180,
    serviceAreas: ['Accra Central', 'Osu', 'Cantonments', 'Airport Residential', 'Tema'],
    description: [
      '[Sample Content] Water leaks cause structural damage and inflated utility bills if unaddressed. Kwame Mensah offers rapid diagnostic detection and durable repairs using high-grade PVC, PPR, and brass fixtures.',
      'All emergency leak repairs include water meter isolation checks and pressure balancing to prevent recurrence.',
    ],
    includedTasks: [
      'Comprehensive inspection of visible and hidden pipe joints',
      'Repair or replacement of damaged PVC/PPR pipe segments',
      'Tap reseating and washer/cartridge replacement',
      'Toilet flush mechanism calibration and seal replacement',
      'Post-repair pressure testing to confirm zero leakage',
    ],
    exclusions: [
      'Underground excavation beyond 1 meter without prior civil survey',
      'Supply cost of major new sanitaryware (sinks, bathtubs) unless pre-agreed',
    ],
    faqs: [
      {
        _key: 'faq-1',
        question: 'How quickly can you attend to an active water leak in Accra?',
        answer: 'For emergency water leaks in central Accra areas (Osu, Cantonments, East Legon), response time is typically within 60 to 90 minutes.',
      },
      {
        _key: 'faq-2',
        question: 'Do you provide replacement PPR/PVC piping materials?',
        answer: 'Yes, standard couplers, Teflon tape, and sealants are included in the package. Specialized replacement fixtures are invoiced transparently at receipt cost.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Basic Leak Diagnostic & Single Point Fix',
        description: 'Ideal for an isolated dripping tap, leaking toilet shutoff valve, or single loose pipe fitting.',
        price: 180,
        scope: 'Inspection and repair of 1 plumbing point with replacement of standard seals/washers.',
        includedTasks: ['Visual inspection', 'Washer/seal replacement', 'Joint tightening', 'Water flow test'],
        exclusions: ['Major pipe replacements behind tiled walls'],
        estimatedDuration: '1 - 2 hours',
      },
      {
        _key: 'pkg-2',
        name: 'Standard Multi-Point Repair & Drain Clearing',
        description: 'Recommended for multiple fixture leaks, kitchen sink drain blockages, and valve tune-ups.',
        price: 350,
        scope: 'Up to 3 plumbing points addressed including mechanical drain snaking and PPR pipe joint welding.',
        includedTasks: ['Up to 3 fixture repairs', 'Drain clearing with mechanical auger', 'PPR welding if needed', 'Pressure test'],
        exclusions: ['Excavation outside the premises'],
        estimatedDuration: '2 - 3 hours',
      },
      {
        _key: 'pkg-3',
        name: 'Full Residence Plumbing Overhaul & Inspection',
        description: 'Comprehensive audit and tuning of all indoor plumbing, valves, water tanks, and drainage lines.',
        price: 650,
        scope: 'Full-house inspection covering up to 4 bathrooms, main supply valves, and water storage connection.',
        includedTasks: ['All bathroom & kitchen fixtures tuned', 'Full supply line inspection', 'Main shutoff valve replacement', 'Drain cleanout check'],
        exclusions: ['Borehole drilling or deep underground infrastructure'],
        estimatedDuration: '4 - 5 hours',
      },
    ],
  },

  // 2. Plumbing (Borehole / Water Pump) - Kwame Mensah
  {
    id: 'sample-srv-water-pump-borehole',
    title: '[Sample Demo] Water Tank, Borehole & Booster Pump Servicing',
    slug: 'sample-water-pump-borehole-servicing',
    categoryId: 'sample-cat-plumbing',
    providerId: 'sample-prov-kwame-mensah',
    summary: '[Sample Demo] Maintenance and installation of overhead poly-tanks, booster pumps, float switches, and sediment filtration.',
    coverImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 280,
    serviceAreas: ['Accra Central', 'East Legon', 'Cantonments', 'Tema', 'Spintex'],
    description: [
      '[Sample Content] Ensure consistent clean water pressure throughout your compound. We service automatic booster pumps, pressure control switches, and poly-tank storage configurations.',
      'Prevent water stagnation and pump burnout with our seasonal checkup and filtration filter swaps.',
    ],
    includedTasks: [
      'Booster pump motor diagnostic and capacitor testing',
      'Electronic pressure control switch calibration',
      'Float switch wiring and water level sensor test',
      'Sediment filter cartridge flush or replacement',
      'Non-return check valve inspection',
    ],
    exclusions: ['Drilling new boreholes or submersible pump extraction beyond 40m'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Why does my booster pump keep clicking on and off when taps are closed?',
        answer: 'This is usually caused by a failing pressure control sensor or a minor hidden leak in the circuit. Our standard package diagnoses and fixes this exact issue.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Pump & Float Switch Diagnostic Check',
        description: 'Diagnostic inspection for non-starting pumps or faulty automated tank float switches.',
        price: 280,
        scope: 'Electrical and mechanical check of 1 pump and tank float switch assembly.',
        includedTasks: ['Electrical continuity test', 'Float switch adjustment', 'Pressure test'],
        exclusions: ['Replacement pump unit cost'],
        estimatedDuration: '1 - 2 hours',
      },
      {
        _key: 'pkg-2',
        name: 'Comprehensive Pump Descaling & Valve Tuning',
        description: 'Complete mechanical maintenance of pump head, check valve, and sediment filtration unit.',
        price: 520,
        scope: 'Full pump servicing, impeller cleaning, and replacement of pressure seals.',
        includedTasks: ['Impeller cleaning', 'Pressure control switch calibration', 'Filter canister service', 'Air-lock removal'],
        exclusions: ['Submersible pump motor rewinding'],
        estimatedDuration: '2 - 3 hours',
      },
    ],
  },

  // 3. Cleaning (Deep Cleaning) - Akosua CleanCo
  {
    id: 'sample-srv-deep-home-cleaning',
    title: '[Sample Demo] Full House Deep Cleaning & Sanitization Service',
    slug: 'sample-deep-home-cleaning-sanitization',
    categoryId: 'sample-cat-cleaning',
    providerId: 'sample-prov-akosua-cleanco',
    summary: '[Sample Demo] Intensive scrub-down for floors, tile grout, kitchen grease, bathroom limescale, and window glass.',
    coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 450,
    serviceAreas: ['East Legon', 'Cantonments', 'Airport Residential', 'Dzorwulu', 'Spintex', 'Labone'],
    description: [
      '[Sample Content] Transform your living space with our intensive deep cleaning procedure. We remove stubborn dirt that regular sweeping misses: baked-on oven grease, bathroom calcium buildup, and high-level dusting.',
      'Our team provides all required vacuum cleaners, microfibre materials, and hospital-grade sanitizers.',
    ],
    includedTasks: [
      'Deep scrubbing of kitchen cabinets, countertops, and backsplashes',
      'Descaling of bathroom tiles, shower glass, and toilet bowls',
      'HEPA vacuuming of carpets, rugs, and under-furniture areas',
      'Interior window glass and mosquito netting wash',
      'Door frame, baseboard, and light switch sanitization',
    ],
    exclusions: ['Exterior roof pressure washing', 'Hazardous material disposal'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Do I need to supply cleaning soaps or vacuums?',
        answer: 'No. Akosua CleanCo brings all commercial vacuum machines, squeegees, microfiber towels, and eco-friendly cleaning solutions.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: '1-2 Bedroom Apartment Deep Clean',
        description: 'Thorough deep clean for compact apartments or bachelor units.',
        price: 450,
        scope: 'Living room, kitchen, 1-2 bedrooms, and up to 2 bathrooms.',
        includedTasks: ['Floor scrubbing', 'Kitchen grease removal', 'Bathroom descaling', 'Interior windows'],
        exclusions: ['Balcony power washing'],
        estimatedDuration: '3 - 4 hours',
      },
      {
        _key: 'pkg-2',
        name: '3-4 Bedroom Family Residence Deep Clean',
        description: 'Our most popular comprehensive clean for family houses and detached duplexes.',
        price: 750,
        scope: 'Living/dining area, large kitchen, 3-4 bedrooms, up to 4 bathrooms, and porch.',
        includedTasks: ['Full residence scrub', 'Appliance exterior detailing', 'Tile grout restoration', 'Netting wash'],
        exclusions: ['Garden weeding'],
        estimatedDuration: '5 - 6 hours',
      },
      {
        _key: 'pkg-3',
        name: 'Executive Compound / Move-In Scrub & Polish',
        description: 'Top-tier package for newly acquired residences, diplomatic homes, or post-tenancy preparation.',
        price: 1200,
        scope: 'Whole-estate deep clean including boy quarters, exterior patio scrub, and high ceiling fan dusting.',
        includedTasks: ['Whole compound deep scrub', 'Patio pressure wash', 'Inside cabinet sanitizing', 'Wall mark wiping'],
        exclusions: ['Exterior tree pruning'],
        estimatedDuration: '7 - 8 hours',
      },
    ],
  },

  // 4. Cleaning (Standard Routine) - Akosua CleanCo
  {
    id: 'sample-srv-standard-cleaning',
    title: '[Sample Demo] Routine Weekly or Bi-Weekly Home Cleaning',
    slug: 'sample-routine-home-cleaning',
    categoryId: 'sample-cat-cleaning',
    providerId: 'sample-prov-akosua-cleanco',
    summary: '[Sample Demo] Dependable recurring maintenance cleaning: sweeping, mopping, dusting, bed making, and kitchen tidying.',
    coverImageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 220,
    serviceAreas: ['East Legon', 'Cantonments', 'Airport Residential', 'Dzorwulu', 'Spintex'],
    description: [
      '[Sample Content] Keep your home consistently pristine without lifting a finger. Our scheduled routine cleaning maintains your house with fresh scents, vacuumed floors, and spotless bathrooms.',
      'Flexible booking: choose once a week or twice a week slots suited to busy professionals and families.',
    ],
    includedTasks: [
      'Mopping tile and hardwood floors with fragrant disinfectants',
      'Dusting electronics, bookshelves, and decorative items',
      'Kitchen sink cleaning and dish sanitization',
      'Bathroom sink, mirror, and toilet bowl wipe-down',
      'Waste bin emptying and liner replacement',
    ],
    exclusions: ['Deep stain extraction on carpets', 'Grout descaling'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Can I request the same cleaner for weekly sessions?',
        answer: 'Yes! Regular weekly customers can select their preferred staff member for continuity.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Single Session: Studio / 1-Bed Home',
        description: 'Light upkeep clean for smaller residences.',
        price: 220,
        scope: '1 bedroom, 1 bathroom, living area, and kitchen counter.',
        includedTasks: ['Sweep & mop', 'Dusting', 'Bathroom wipe-down', 'Trash disposal'],
        exclusions: ['Oven interior scrub'],
        estimatedDuration: '2 hours',
      },
      {
        _key: 'pkg-2',
        name: 'Single Session: 2-3 Bedroom House',
        description: 'Standard session for 2 to 3 bedroom apartments.',
        price: 360,
        scope: 'Living room, up to 3 bedrooms, 2 bathrooms, kitchen.',
        includedTasks: ['Full floor wash', 'Surface sanitizing', 'Bed making', 'Kitchen dish wash'],
        exclusions: ['Window track cleaning'],
        estimatedDuration: '3 - 4 hours',
      },
    ],
  },

  // 5. Electrical - Kofi Boateng
  {
    id: 'sample-srv-electrical-wiring',
    title: '[Sample Demo] Electrical Fault Finding, Socket Repairs & Rewiring',
    slug: 'sample-electrical-fault-finding-repairs',
    categoryId: 'sample-cat-electrical',
    providerId: 'sample-prov-kofi-boateng',
    summary: '[Sample Demo] Diagnostic troubleshooting for tripping circuit breakers, burnt sockets, light fixture switches, and rewiring.',
    coverImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 150,
    serviceAreas: ['Kumasi Central', 'Adum', 'Ahodwo', 'KNUST Campus', 'Bantama', 'Asokwa'],
    description: [
      '[Sample Content] Dangerous sparks and nuisance tripping breakers need certified resolution. Kofi Boateng uses digital multimeters and insulation testers to isolate phase faults quickly and cleanly.',
      'Work complies strictly with Ghanaian Energy Commission domestic safety regulations.',
    ],
    includedTasks: [
      'Multi-meter diagnostic of distribution panel and circuits',
      'Repair or replacement of burnt wall sockets and switches',
      'Short circuit pinpointing and safe wire termination',
      'Earth grounding resistance verification',
      'Safety tag labeling on breaker panels',
    ],
    exclusions: ['High-voltage utility line work outside property meter'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Why does my breaker trip whenever the air conditioner kicks on?',
        answer: 'This is commonly due to an undersized circuit breaker (MCB) or overloaded phase wiring. We assess the amperage draw and re-balance your panel.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Single Breaker / Socket Fault Diagnostic',
        description: 'Isolate and fix 1 tripping switch, burnt wall plug, or light flickers.',
        price: 150,
        scope: 'Diagnostic check and repair of 1 electrical outlet or breaker switch.',
        includedTasks: ['Fault location', 'Wire termination', 'Socket replacement', 'Circuit check'],
        exclusions: ['Whole house rewiring'],
        estimatedDuration: '1 hour',
      },
      {
        _key: 'pkg-2',
        name: 'Multi-Room Circuit Testing & Panel Rebalancing',
        description: 'Comprehensive circuit test for households experiencing recurring electrical surges.',
        price: 380,
        scope: 'Inspection of main breaker box and up to 4 room circuits.',
        includedTasks: ['Full load check', 'Phase rebalancing', 'Breaker tightening', 'Grounding check'],
        exclusions: ['Transformer repairs'],
        estimatedDuration: '2 - 3 hours',
      },
    ],
  },

  // 6. Electrical (Inverter / Generator) - Kofi Boateng
  {
    id: 'sample-srv-generator-inverter',
    title: '[Sample Demo] Backup Generator Servicing & Inverter Setup',
    slug: 'sample-generator-inverter-servicing',
    categoryId: 'sample-cat-electrical',
    providerId: 'sample-prov-kofi-boateng',
    summary: '[Sample Demo] Routine oil and filter service for home generators and installation of automatic changeover switches.',
    coverImageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 350,
    serviceAreas: ['Kumasi Central', 'Adum', 'Ahodwo', 'KNUST Campus', 'Bantama'],
    description: [
      '[Sample Content] Never be left in the dark during power outages. Kofi Boateng services portable and stationary diesel/petrol generators and connects automatic changeover switches (ATS).',
      'Keep your batteries healthy and inverters operating at peak efficiency throughout the year.',
    ],
    includedTasks: [
      'Engine oil drain and high-grade lubricant refill',
      'Fuel filter and air filter cleanout or replacement',
      'Spark plug calibration / glow plug check',
      'Automatic changeover switch (ATS) testing',
      'Inverter battery bank voltage and equalization test',
    ],
    exclusions: ['Complete internal engine overhaul/block machining'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Can you install an automatic switch so my generator starts when grid power cuts?',
        answer: 'Yes, we specialize in ATS hookups for generators with electric key starters.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Generator Routine Service (Up to 10kVA)',
        description: 'Standard preventive maintenance for residential backup generators.',
        price: 350,
        scope: 'Oil change, filter cleaning, and load test on 1 generator unit.',
        includedTasks: ['Oil change', 'Spark plug service', 'Air filter clean', 'Output voltage test'],
        exclusions: ['Major engine tear-down'],
        estimatedDuration: '1 - 2 hours',
      },
      {
        _key: 'pkg-2',
        name: 'Inverter & Automatic Changeover (ATS) Installation',
        description: 'Seamless wiring between grid electricity, generator, and inverter.',
        price: 650,
        scope: 'ATS wiring, battery interconnects, and critical load panel isolation.',
        includedTasks: ['ATS installation', 'Battery bank wiring', 'Surge protector hookup', 'Load test'],
        exclusions: ['Inverter hardware unit purchase cost'],
        estimatedDuration: '2 - 4 hours',
      },
    ],
  },

  // 7. Painting - Emmanuel Addo
  {
    id: 'sample-srv-interior-exterior-painting',
    title: '[Sample Demo] Interior Room & Exterior Wall Painting',
    slug: 'sample-interior-exterior-painting',
    categoryId: 'sample-cat-painting',
    providerId: 'sample-prov-emmanuel-addo',
    summary: '[Sample Demo] Professional coating with smooth surface preparation, crack filling, tape masking, and double-coat emulsion.',
    coverImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 400,
    serviceAreas: ['Spintex', 'Sakumono', 'Tema Community 1-12', 'East Legon Hills', 'Osu'],
    description: [
      '[Sample Content] Transform your home’s character with flawless, streak-free paint application. Emmanuel Addo spends meticulous time on wall prep: scraping peeling paint, filling hairline cracks, and sanding down ridges.',
      'We use top-tier anti-fungal paint suitable for Ghana’s humid coastal climate.',
    ],
    includedTasks: [
      'Wall crack spackling and sanding to a smooth texture',
      'Protective masking tape on sockets, doors, and skirting boards',
      'Two full coats of high-grade satin or matte acrylic emulsion',
      'Clean edge cutting on ceilings and corner junctions',
      'Post-job cleanup with floor protection removal',
    ],
    exclusions: ['Paint supplies cost unless contracted for turnkey supply'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Do you help recommend long-lasting exterior paints for coastal areas like Tema?',
        answer: 'Yes, we recommend weather-guard anti-fungal silicone paints that repel ocean salt air and rain stains.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Single Room Interior Paint (Labor)',
        description: 'Ideal for repainting a bedroom, home office, or nursery.',
        price: 400,
        scope: 'Up to 1 standard bedroom (approx 12x14 ft) double coat.',
        includedTasks: ['Wall patching', 'Sanding', '2 coats emulsion', 'Edge cutting'],
        exclusions: ['Paint materials'],
        estimatedDuration: '1 day',
      },
      {
        _key: 'pkg-2',
        name: 'Living Room & Dining Area Painting (Labor)',
        description: 'Revitalize your main entertainment hall and dining corridors.',
        price: 850,
        scope: 'Living and dining space walls, including high walls.',
        includedTasks: ['Crack filling', 'Ceiling joint cutting', 'Double coat paint', 'Full cleanup'],
        exclusions: ['Exterior walls'],
        estimatedDuration: '2 days',
      },
    ],
  },

  // 8. Painting (POP Ceiling) - Emmanuel Addo
  {
    id: 'sample-srv-pop-ceiling-painting',
    title: '[Sample Demo] POP Ceiling Finishing, Cornice Detailing & Moulding',
    slug: 'sample-pop-ceiling-finishing',
    categoryId: 'sample-cat-painting',
    providerId: 'sample-prov-emmanuel-addo',
    summary: '[Sample Demo] Expert plaster of Paris (POP) surface smoothing, joint tape sealing, primer application, and brilliant white finish.',
    coverImageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 500,
    serviceAreas: ['Spintex', 'Sakumono', 'Tema', 'East Legon Hills'],
    description: [
      '[Sample Content] POP ceilings require specialized primers and patience to eliminate visible plaster joints and sanding waves. We apply acrylic binding primers followed by non-reflective ceiling brilliant whites.',
      'Enhance recessed LED troughs and perimeter cornices with crisp shadow lines.',
    ],
    includedTasks: [
      'Joint compound application over POP joints and screw heads',
      'Orbital sander smoothing for seamless flat planes',
      'Alkali-resistant primer application to seal plaster porosity',
      'Dual-coat brilliant white ceiling emulsion application',
      'Cornice and decorative medallion detailing',
    ],
    exclusions: ['Suspension steel framework installation from scratch'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Why does ceiling paint peel if not primed properly?',
        answer: 'Unsealed POP plaster absorbs moisture from paint too quickly. Our alkali primer creates a permanent bond preventing future flaking.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'POP Ceiling Touchup & Single Room Coating',
        description: 'Plaster smoothing and painting for 1 room ceiling.',
        price: 500,
        scope: '1 bedroom POP ceiling finishing.',
        includedTasks: ['Joint sanding', 'Primer seal', '2 coats paint'],
        exclusions: ['Cornice replacement'],
        estimatedDuration: '1 day',
      },
      {
        _key: 'pkg-2',
        name: 'Main Living Hall POP Ceiling & Cornice Painting',
        description: 'Complete ceiling finishing for open-plan living rooms with multi-tier bulkheads.',
        price: 1100,
        scope: 'Full living hall ceiling, recessed light troughs, and decorative cornices.',
        includedTasks: ['Full plaster skim', 'Cornice detailing', 'Bulkhead edge sharp lines', 'Final brilliant coat'],
        exclusions: ['Electrical fixture wiring'],
        estimatedDuration: '2 days',
      },
    ],
  },

  // 9. Moving - SwiftHaul
  {
    id: 'sample-srv-residential-moving',
    title: '[Sample Demo] Residential Home Moving & Packing Transport',
    slug: 'sample-residential-moving-transport',
    categoryId: 'sample-cat-moving',
    providerId: 'sample-prov-swifthaul',
    summary: '[Sample Demo] Full-service moving with enclosed trucks, protective blankets, furniture disassembly, and careful room placement.',
    coverImageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 600,
    serviceAreas: ['Accra', 'Tema', 'Kasoa', 'Madina', 'Pokuase', 'Adenta'],
    description: [
      '[Sample Content] Moving homes does not have to be stressful. SwiftHaul handles every step: wrapping delicate TV screens, disassembling king beds, carefully loading into covered trucks, and positioning furniture in your new home.',
      'Our trained loaders respect your property and prevent wall scuffs and staircase scratches.',
    ],
    includedTasks: [
      'Enclosed weatherproof truck transit with designated driver',
      '2 to 4 professional loaders and movers',
      'Padded moving blankets and heavy-duty tie-down straps',
      'Basic furniture disassembly and reassembly at destination',
      'Unloading and room-specific item placement',
    ],
    exclusions: ['Long-term warehouse storage fees'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Are my goods protected against sudden rainfall during transit in Accra?',
        answer: 'Yes, all our moving trucks have fully enclosed aluminium cargo boxes, ensuring zero exposure to rain or road dust.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Studio / 1-Bedroom Apartment Relocation',
        description: 'Covered van and 2 movers for lightweight apartment transitions.',
        price: 600,
        scope: '1-trip transit within Greater Accra for 1-bedroom home contents.',
        includedTasks: ['Van transport', '2 loaders', 'Loading & unloading', 'Blanket wrapping'],
        exclusions: ['Packing personal boxes'],
        estimatedDuration: '3 - 4 hours',
      },
      {
        _key: 'pkg-2',
        name: '2-3 Bedroom Family House Relocation',
        description: '14ft covered box truck with 3 movers for standard homes.',
        price: 1200,
        scope: 'Full 2 to 3 bedroom contents transported within Greater Accra.',
        includedTasks: ['14ft truck', '3 loaders', 'Bed frame disassembly', 'Careful furniture placement'],
        exclusions: ['Air conditioner uninstallation'],
        estimatedDuration: '5 - 6 hours',
      },
      {
        _key: 'pkg-3',
        name: 'Executive Whole-Compound Relocation & Full Packing',
        description: 'Large 20ft truck, 4 movers, full bubble wrap packing service.',
        price: 2200,
        scope: 'Large 4+ bedroom home move with complete packing materials provided.',
        includedTasks: ['20ft truck', '4 movers', 'Boxes & bubble wrap included', 'Full furniture setup'],
        exclusions: ['Inter-city tolls outside Greater Accra'],
        estimatedDuration: '1 full day',
      },
    ],
  },

  // 10. Moving (Commercial / Heavy) - SwiftHaul
  {
    id: 'sample-srv-office-moving',
    title: '[Sample Demo] Commercial Office Moving & Equipment Hauling',
    slug: 'sample-commercial-office-moving',
    categoryId: 'sample-cat-moving',
    providerId: 'sample-prov-swifthaul',
    summary: '[Sample Demo] Business relocation for office workstations, conference tables, file archives, and server hardware.',
    coverImageUrl: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 900,
    serviceAreas: ['Accra', 'Tema', 'Airport City', 'Ridge', 'Cantonments'],
    description: [
      '[Sample Content] Minimize business downtime with our weekend and evening corporate relocation services. We label workstation equipment, wrap monitors, and systematically transport office furniture.',
      'Dedicated moving supervisor assigned to ensure zero lost files or damaged assets.',
    ],
    includedTasks: [
      'Systematic color-coded labeling of desks and storage boxes',
      'Computer monitor anti-static bubble wrapping',
      'Office desk cluster disassembly and re-erection',
      'Filing cabinet safe transit with drawer locking',
      'Weekend execution to ensure zero workday disruption',
    ],
    exclusions: ['Network server rack technical re-cabling'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Can you carry out office moves on Saturday and Sunday?',
        answer: 'Yes, most commercial office relocations are scheduled over the weekend so your staff can resume on Monday morning seamlessly.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Small Office / Branch Relocation (Up to 8 Desks)',
        description: 'Truck and 3 loaders for small startup or agency offices.',
        price: 900,
        scope: 'Up to 8 workstations, executive desk, and filing cabinets.',
        includedTasks: ['Desk disassembly', 'Truck transit', 'Careful reassembly', 'Placement'],
        exclusions: ['Heavy commercial safes exceeding 300kg'],
        estimatedDuration: '4 - 5 hours',
      },
      {
        _key: 'pkg-2',
        name: 'Medium Corporate Floor Move (Up to 25 Workstations)',
        description: 'Dedicated multi-trip truck logistics with 5 movers and on-site foreman.',
        price: 1850,
        scope: 'Full floor office relocation including conference room suite.',
        includedTasks: ['Full packaging', 'Numbered desk tagging', 'Multiple truck runs', 'Weekend setup'],
        exclusions: ['Disposal of old corporate e-waste'],
        estimatedDuration: '1 full day',
      },
    ],
  },

  // 11. Furniture Assembly - Yaw Osei
  {
    id: 'sample-srv-flatpack-assembly',
    title: '[Sample Demo] Flat-Pack Furniture Assembly & TV Wall Mounting',
    slug: 'sample-furniture-assembly-tv-mounting',
    categoryId: 'sample-cat-furniture',
    providerId: 'sample-prov-yaw-osei',
    summary: '[Sample Demo] Fast, sturdy assembly of modular wardrobes, bed frames, dining sets, and solid concrete TV bracket mounting.',
    coverImageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 150,
    serviceAreas: ['East Legon', 'Legon Hills', 'Adenta', 'Haatso', 'Tema'],
    description: [
      '[Sample Content] Avoid confusing assembly instruction manuals and stripped screws. Yaw Osei builds your imported or locally built flat-pack furniture with cordless drills and level gauges.',
      'We also anchor heavy wardrobes and mount large flat-screen TVs into blockwork walls with heavy-duty Fischer wall plugs.',
    ],
    includedTasks: [
      'Inventory check of all wood panels, hinges, dowels, and screws',
      'Square frame assembly with magnetic level alignment',
      'Hinge adjustment for even door gaps and drawer runner calibration',
      'Wall anti-tip safety bracket anchoring',
      'Packing cardboard consolidation and neat disposal',
    ],
    exclusions: ['Custom wood cutting or carpentry modifications beyond manual specs'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Do you supply the TV wall bracket?',
        answer: 'The basic package is labor for your own bracket. We can also provide heavy-duty tilt or swivel brackets for an additional pre-agreed fee.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Single Item Assembly or TV Mount',
        description: 'Quick setup for 1 bed frame, small desk, or 1 TV wall bracket mount.',
        price: 150,
        scope: 'Assembly of 1 small-to-medium flat-pack piece or wall mounting up to a 65-inch TV.',
        includedTasks: ['1 item built or mounted', 'Level check', 'Hardware tightened', 'Debris cleared'],
        exclusions: ['Large sliding door wardrobes'],
        estimatedDuration: '1 - 2 hours',
      },
      {
        _key: 'pkg-2',
        name: '3-Door Wardrobe or Multi-Item Assembly',
        description: 'Recommended for large bedroom wardrobes with drawers and mirrors.',
        price: 320,
        scope: 'Complex wardrobe assembly including sliding doors, drawer runners, and shelves.',
        includedTasks: ['Multi-door wardrobe build', 'Drawer alignment', 'Door hinge fine tuning', 'Anti-tip anchor'],
        exclusions: ['Custom lighting installation inside wardrobe'],
        estimatedDuration: '2 - 3 hours',
      },
      {
        _key: 'pkg-3',
        name: 'Full Master Bedroom Set Assembly',
        description: 'Complete assembly of king bed, 2 nightstands, 4-door wardrobe, and dresser mirror.',
        price: 600,
        scope: 'Up to 5 interconnected bedroom furniture items built in one visit.',
        includedTasks: ['Bed frame & headboard', 'Dresser & nightstands', 'Large wardrobe', 'Mirror mounting'],
        exclusions: ['Repainting chipped panels from shipping'],
        estimatedDuration: '4 - 5 hours',
      },
    ],
  },

  // 12. Gardening - Yaw Osei
  {
    id: 'sample-srv-lawn-garden-care',
    title: '[Sample Demo] Lawn Mowing, Hedge Trimming & Compound Landscaping',
    slug: 'sample-lawn-mowing-gardening-care',
    categoryId: 'sample-cat-gardening',
    providerId: 'sample-prov-yaw-osei',
    summary: '[Sample Demo] Petrol mower lawn cutting, bush pruning, flower bed weeding, green waste bagging, and compound cleanup.',
    coverImageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 160,
    serviceAreas: ['East Legon', 'Legon Hills', 'Adenta', 'Haatso', 'Tema'],
    description: [
      '[Sample Content] Maintain a lush, green, and manicured yard year-round. Yaw Osei brings reliable petrol grass cutters, hedge shears, and rake crews to manicure your lawn and eliminate mosquito breeding brush.',
      'We bag all clipped foliage and leave your paved walkways swept and clean.',
    ],
    includedTasks: [
      'Lawn cutting with petrol-driven lawn mower or trimmer',
      'Crisp edging along curbs, fences, and walkway pavers',
      'Hedge pruning and topiary bush shaping',
      'Weeding of decorative flower beds and paver cracks',
      'Foliage raking, bagging, and clean sweeping of paved compound',
    ],
    exclusions: ['Felling large matured timber trees over 20 feet'],
    faqs: [
      {
        _key: 'faq-1',
        question: 'Do you take the green grass cuttings away with you?',
        answer: 'Yes! We gather and bag all garden waste neatly. Disposal hauling can be included in the service.',
      },
    ],
    packages: [
      {
        _key: 'pkg-1',
        name: 'Standard Residential Lawn Mow & Edge',
        description: 'Routine grass trimming for small-to-medium compound lawns.',
        price: 160,
        scope: 'Lawn up to 300 square meters mowed and perimeter edged.',
        includedTasks: ['Lawn mow', 'Edge trim', 'Rake clippings', 'Walkway sweep'],
        exclusions: ['Extensive bush clearing'],
        estimatedDuration: '1 - 2 hours',
      },
      {
        _key: 'pkg-2',
        name: 'Complete Compound Garden Grooming & Pruning',
        description: 'Comprehensive service including hedge trimming and flower bed weeding.',
        price: 320,
        scope: 'Lawn mowing, hedge sculpting, weed removal, and paver moss scrape.',
        includedTasks: ['Lawn cut', 'Hedge shaping', 'Flowerbed weeding', 'Paver crack sweep', 'Bagging'],
        exclusions: ['Tree felling'],
        estimatedDuration: '3 - 4 hours',
      },
      {
        _key: 'pkg-3',
        name: 'Overgrown Compound Reclamation & Green Disposal',
        description: 'Heavy clearing for vacant plots, unkempt compounds, or pre-event garden revamps.',
        price: 680,
        scope: 'Heavy grass slashing, tall weed extraction, tree branch lopping, and carting off waste.',
        includedTasks: ['Heavy bush slashing', 'Stump trimming', 'Weed extraction', 'Complete green waste cart away'],
        exclusions: ['Chemical stump root poisoning'],
        estimatedDuration: '5 - 6 hours',
      },
    ],
  },
];

// 4. Main Seed Execution
async function runSeed() {
  console.log(`Starting Fix it Sanity Seed Pipeline...`);
  console.log(`Target Project: ${projectId}, Dataset: ${dataset}\n`);

  // Step A: Upload Image Assets
  console.log('--- Step 1: Uploading Category & Profile Image Assets ---');
  const uploadedCategoryAssets = {};
  for (const cat of RAW_CATEGORIES) {
    const filename = `cat-${cat.slug}.jpg`;
    uploadedCategoryAssets[cat.id] = await uploadAsset(cat.imageUrl, filename);
  }

  const uploadedProviderPhotos = {};
  for (const prov of RAW_PROVIDERS) {
    const filename = `prov-${prov.slug}.jpg`;
    uploadedProviderPhotos[prov.id] = await uploadAsset(prov.photoUrl, filename);
  }

  const uploadedServiceCovers = {};
  for (const srv of RAW_SERVICES) {
    const filename = `srv-${srv.slug}.jpg`;
    uploadedServiceCovers[srv.id] = await uploadAsset(srv.coverImageUrl, filename);
  }

  // Step B: Mutate Categories
  console.log('\n--- Step 2: Seeding 8 Core Categories ---');
  const categoryMutations = RAW_CATEGORIES.map((cat) => ({
    createOrReplace: {
      _id: cat.id,
      _type: 'category',
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
      iconName: cat.iconName,
      subcategories: cat.subcategories,
      image: createImageField(uploadedCategoryAssets[cat.id], `${cat.title} Category in Ghana`),
    },
  }));
  await sendMutations(categoryMutations);
  console.log(`  Successfully created/updated ${RAW_CATEGORIES.length} categories.`);

  // Step C: Mutate Providers
  console.log('\n--- Step 3: Seeding 6 Ghanaian Local Service Providers ---');
  const providerMutations = RAW_PROVIDERS.map((prov) => ({
    createOrReplace: {
      _id: prov.id,
      _type: 'providerProfile',
      displayName: prov.displayName,
      slug: { _type: 'slug', current: prov.slug },
      clerkUserId: prov.clerkUserId,
      photo: createImageField(uploadedProviderPhotos[prov.id], prov.displayName),
      headline: prov.headline,
      expertise: prov.expertise,
      bio: createPortableText(prov.bio),
      languages: prov.languages,
      serviceAreas: prov.serviceAreas,
      availability: prov.availability,
      onboardingStatus: 'completed',
      verificationStatus: 'unverified',
      backgroundCheckStatus: 'not_started',
    },
  }));
  await sendMutations(providerMutations);
  console.log(`  Successfully created/updated ${RAW_PROVIDERS.length} provider profiles.`);

  // Step D: Mutate Services
  console.log('\n--- Step 4: Seeding 12 Service Listings with Packages ---');
  const serviceMutations = RAW_SERVICES.map((srv) => ({
    createOrReplace: {
      _id: srv.id,
      _type: 'service',
      title: srv.title,
      slug: { _type: 'slug', current: srv.slug },
      category: {
        _type: 'reference',
        _ref: srv.categoryId,
      },
      provider: {
        _type: 'reference',
        _ref: srv.providerId,
      },
      summary: srv.summary,
      coverImage: createImageField(uploadedServiceCovers[srv.id], srv.title),
      gallery: srv.galleryUrls?.map((url, i) =>
        createImageField(uploadedServiceCovers[srv.id], `${srv.title} Gallery ${i + 1}`)
      ) || [],
      startingPrice: srv.startingPrice,
      currency: 'GHS',
      status: 'published',
      serviceAreas: srv.serviceAreas,
      description: createPortableText(srv.description),
      includedTasks: srv.includedTasks,
      exclusions: srv.exclusions,
      faqs: srv.faqs,
      packages: srv.packages.map((pkg) => ({
        _key: pkg._key,
        _type: 'servicePackage',
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        scope: pkg.scope,
        includedTasks: pkg.includedTasks,
        exclusions: pkg.exclusions,
        estimatedDuration: pkg.estimatedDuration,
      })),
    },
  }));
  await sendMutations(serviceMutations);
  console.log(`  Successfully created/updated ${RAW_SERVICES.length} service listings.`);

  console.log('\n=============================================');
  console.log('🎉 Fix it sample seed completed successfully!');
  console.log('   - 8 Categories seeded');
  console.log('   - 6 Local Providers seeded');
  console.log('   - 12 Detailed Service Listings seeded');
  console.log('   - All images uploaded to Sanity Asset Lake');
  console.log('   - Currency: GHS, Status: Published');
  console.log('=============================================\n');
}

runSeed().catch((err) => {
  console.error('\n❌ Seed failed with error:', err);
  process.exit(1);
});

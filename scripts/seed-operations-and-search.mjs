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

// 2. Data Definitions

// A. Sample Customer Profiles (3)
const SAMPLE_CUSTOMERS = [
  {
    id: 'sample-cust-abena-osei',
    clerkUserId: 'demo_cust_abena_osei',
    fullName: 'Abena Osei',
    email: 'abena.osei.demo@example.com',
    phone: '+233 24 123 4567',
    address: 'House 14, Jungle Avenue, East Legon, Accra',
    city: 'Accra',
  },
  {
    id: 'sample-cust-kwabena-owusu',
    clerkUserId: 'demo_cust_kwabena_owusu',
    fullName: 'Kwabena Owusu',
    email: 'kwabena.owusu.demo@example.com',
    phone: '+233 20 876 5432',
    address: 'Plot 8, Block B, Ahodwo Residential Area, Kumasi',
    city: 'Kumasi',
  },
  {
    id: 'sample-cust-naa-ayeley',
    clerkUserId: 'demo_cust_naa_ayeley',
    fullName: 'Naa Ayeley Quaye',
    email: 'naa.ayeley.demo@example.com',
    phone: '+233 55 432 1098',
    address: 'Apartment 4B, Ringway Estates, Osu, Accra',
    city: 'Accra',
  },
];

// B. Sample Job Requests (4)
const SAMPLE_JOB_REQUESTS = [
  {
    id: 'sample-req-kitchen-leak',
    customerId: 'sample-cust-abena-osei',
    customerClerkUserId: 'demo_cust_abena_osei',
    categoryId: 'sample-cat-plumbing',
    title: '[Sample Demo] Emergency Kitchen Pipe Leak Repair',
    description: 'Noticeable water seepage beneath the double-basin kitchen sink. Water shutoff valve is currently engaged.',
    location: 'East Legon, Accra',
    preferredDate: '2026-09-12',
    scope: 'Diagnostic inspection, replacement of flexible hoses and damaged PVC trap.',
    status: 'matched',
  },
  {
    id: 'sample-req-deep-clean',
    customerId: 'sample-cust-naa-ayeley',
    customerClerkUserId: 'demo_cust_naa_ayeley',
    categoryId: 'sample-cat-cleaning',
    title: '[Sample Demo] Post-Tenancy Deep Cleaning for 3-Bedroom Flat',
    description: 'Incoming tenant needs full scrubbing of tiled floors, window netting, kitchen grease extraction, and bathroom sanitization.',
    location: 'Cantonments, Accra',
    preferredDate: '2026-09-15',
    scope: 'Whole residence deep cleaning including balcony pressure wash.',
    status: 'open',
  },
  {
    id: 'sample-req-inverter-check',
    customerId: 'sample-cust-kwabena-owusu',
    customerClerkUserId: 'demo_cust_kwabena_owusu',
    categoryId: 'sample-cat-electrical',
    title: '[Sample Demo] Inverter Battery Diagnostic & Rewiring',
    description: 'Backup inverter fails to switch over automatically during power cut. Need battery bank load test and transfer switch inspection.',
    location: 'Ahodwo, Kumasi',
    preferredDate: '2026-09-10',
    scope: 'Electrical testing of 4x 200Ah gel batteries and ATS panel calibration.',
    status: 'closed',
  },
  {
    id: 'sample-req-garden-clear',
    customerId: 'sample-cust-abena-osei',
    customerClerkUserId: 'demo_cust_abena_osei',
    categoryId: 'sample-cat-gardening',
    title: '[Sample Demo] Compound Landscape Clearing Before Rainy Season',
    description: 'Overgrown lawn and flowerbed pruning across a 500 sqm compound. Raking, bagging, and hauling of green waste required.',
    location: 'Legon Hills, Accra',
    preferredDate: '2026-09-18',
    scope: 'Petrol mower grass trimming, hedge sculpting, and compound sweeping.',
    status: 'open',
  },
];

// C. Sample Bookings (5) Covering all 5 statuses
const SAMPLE_BOOKINGS = [
  // 1. Requested
  {
    id: 'sample-book-requested',
    customerId: 'sample-cust-abena-osei',
    customerClerkUserId: 'demo_cust_abena_osei',
    providerId: 'sample-prov-akosua-cleanco',
    providerClerkUserId: 'demo_provider_akosua_cleanco',
    serviceId: 'sample-srv-standard-cleaning',
    agreedPackageName: 'Single Session: 2-3 Bedroom House',
    agreedScope: 'Routine scheduled maintenance cleaning of 2 bedrooms, 2 bathrooms, kitchen, and living room.',
    agreedPrice: 360,
    scheduledTime: '2026-09-14T09:30:00Z',
    serviceAddress: 'House 14, Jungle Avenue, East Legon, Accra',
    jobStatus: 'requested',
    paymentStatus: 'unpaid',
    paymentReference: 'test_pay_req_98124',
  },
  // 2. Confirmed
  {
    id: 'sample-book-confirmed',
    customerId: 'sample-cust-naa-ayeley',
    customerClerkUserId: 'demo_cust_naa_ayeley',
    providerId: 'sample-prov-kwame-mensah',
    providerClerkUserId: 'demo_provider_kwame_mensah',
    serviceId: 'sample-srv-residential-plumbing',
    agreedPackageName: 'Standard Multi-Point Repair & Drain Clearing',
    agreedScope: 'Repairing 2 leaking washbasin traps, re-seating kitchen faucet, and mechanical drain snaking.',
    agreedPrice: 350,
    scheduledTime: '2026-09-10T10:00:00Z',
    serviceAddress: 'Apartment 4B, Ringway Estates, Osu, Accra',
    jobStatus: 'confirmed',
    paymentStatus: 'pending',
    paymentReference: 'test_pay_conf_44821',
  },
  // 3. In Progress
  {
    id: 'sample-book-inprogress',
    customerId: 'sample-cust-kwabena-owusu',
    customerClerkUserId: 'demo_cust_kwabena_owusu',
    providerId: 'sample-prov-kofi-boateng',
    providerClerkUserId: 'demo_provider_kofi_boateng',
    serviceId: 'sample-srv-electrical-wiring',
    agreedPackageName: 'Multi-Room Circuit Testing & Panel Rebalancing',
    agreedScope: 'Diagnosing tripping MCB breaker, phase load re-balancing on 3-phase board, and surge protection check.',
    agreedPrice: 380,
    scheduledTime: '2026-09-06T09:30:00Z',
    serviceAddress: 'Plot 8, Block B, Ahodwo Residential Area, Kumasi',
    jobStatus: 'in_progress',
    paymentStatus: 'paid',
    paymentReference: 'test_pay_inprog_77192',
  },
  // 4. Completed
  {
    id: 'sample-book-completed',
    customerId: 'sample-cust-abena-osei',
    customerClerkUserId: 'demo_cust_abena_osei',
    providerId: 'sample-prov-akosua-cleanco',
    providerClerkUserId: 'demo_provider_akosua_cleanco',
    serviceId: 'sample-srv-deep-home-cleaning',
    agreedPackageName: '3-4 Bedroom Family Residence Deep Clean',
    agreedScope: 'Intensive floor scrubbing, tile limescale descaling, kitchen oven grease removal, and window wash.',
    agreedPrice: 750,
    scheduledTime: '2026-09-02T08:00:00Z',
    serviceAddress: 'House 14, Jungle Avenue, East Legon, Accra',
    jobStatus: 'completed',
    paymentStatus: 'paid',
    paymentReference: 'test_pay_comp_33910',
  },
  // 5. Cancelled
  {
    id: 'sample-book-cancelled',
    customerId: 'sample-cust-naa-ayeley',
    customerClerkUserId: 'demo_cust_naa_ayeley',
    providerId: 'sample-prov-swifthaul',
    providerClerkUserId: 'demo_provider_swifthaul',
    serviceId: 'sample-srv-residential-moving',
    agreedPackageName: 'Studio / 1-Bedroom Apartment Relocation',
    agreedScope: 'Moving personal furniture and appliances from Osu to Tema Community 6.',
    agreedPrice: 600,
    scheduledTime: '2026-08-28T07:30:00Z',
    serviceAddress: 'Apartment 4B, Ringway Estates, Osu, Accra',
    jobStatus: 'cancelled',
    paymentStatus: 'refunded',
    paymentReference: 'test_pay_ref_11209',
  },
];

// D. Sample Conversations & Messages (4 Threads)
const SAMPLE_CONVERSATIONS = [
  {
    id: 'sample-conv-plumbing-confirmed',
    customerId: 'sample-cust-naa-ayeley',
    providerId: 'sample-prov-kwame-mensah',
    bookingId: 'sample-book-confirmed',
    participants: ['demo_cust_naa_ayeley', 'demo_provider_kwame_mensah'],
    messages: [
      {
        id: 'sample-msg-p1',
        senderClerkUserId: 'demo_cust_naa_ayeley',
        text: 'Hello Kwame, I just booked the leak repair for Thursday at 10 AM. Do I need to purchase the replacement PPR pipes and couplers beforehand or will you bring them?',
        createdAt: '2026-09-05T14:10:00Z',
      },
      {
        id: 'sample-msg-p2',
        senderClerkUserId: 'demo_provider_kwame_mensah',
        text: 'Good afternoon Naa. I carry standard size PPR pipes, fittings, Teflon tape, and pressure test gauges in my work van. You do not need to purchase anything in advance. If any non-standard fixture is required, I will advise you on-site.',
        createdAt: '2026-09-05T14:25:00Z',
      },
      {
        id: 'sample-msg-p3',
        senderClerkUserId: 'demo_cust_naa_ayeley',
        text: 'That is wonderful! The main water shutoff valve is located in the compound behind the kitchen wall. See you Thursday.',
        createdAt: '2026-09-05T15:02:00Z',
      },
      {
        id: 'sample-msg-p4',
        senderClerkUserId: 'demo_provider_kwame_mensah',
        text: 'Noted with thanks. My assistant and I will be at your premises at 10:00 AM sharp.',
        createdAt: '2026-09-05T15:15:00Z',
      },
    ],
  },
  {
    id: 'sample-conv-cleaning-requested',
    customerId: 'sample-cust-abena-osei',
    providerId: 'sample-prov-akosua-cleanco',
    bookingId: 'sample-book-requested',
    participants: ['demo_cust_abena_osei', 'demo_provider_akosua_cleanco'],
    messages: [
      {
        id: 'sample-msg-c1',
        senderClerkUserId: 'demo_cust_abena_osei',
        text: 'Hi Akosua CleanCo, I sent a booking request for routine cleaning this Monday. Could the team arrive at 9:30 AM instead of 9:00 AM?',
        createdAt: '2026-09-05T16:00:00Z',
      },
      {
        id: 'sample-msg-c2',
        senderClerkUserId: 'demo_provider_akosua_cleanco',
        text: 'Hello Abena! Yes, 9:30 AM on Monday works perfectly for our East Legon route. We will adjust our schedule accordingly.',
        createdAt: '2026-09-05T16:18:00Z',
      },
      {
        id: 'sample-msg-c3',
        senderClerkUserId: 'demo_cust_abena_osei',
        text: 'Great. Could you confirm if you bring your own vacuum cleaners and mop buckets?',
        createdAt: '2026-09-05T16:30:00Z',
      },
      {
        id: 'sample-msg-c4',
        senderClerkUserId: 'demo_provider_akosua_cleanco',
        text: 'Yes, we bring all commercial HEPA vacuum machines, microfibre mops, and sanitizers. You only need to provide water and electricity access.',
        createdAt: '2026-09-05T16:45:00Z',
      },
    ],
  },
  {
    id: 'sample-conv-electrical-inprogress',
    customerId: 'sample-cust-kwabena-owusu',
    providerId: 'sample-prov-kofi-boateng',
    bookingId: 'sample-book-inprogress',
    participants: ['demo_cust_kwabena_owusu', 'demo_provider_kofi_boateng'],
    messages: [
      {
        id: 'sample-msg-e1',
        senderClerkUserId: 'demo_cust_kwabena_owusu',
        text: 'Good morning Kofi, are you still on track for the Ahodwo inspection this morning?',
        createdAt: '2026-09-06T07:45:00Z',
      },
      {
        id: 'sample-msg-e2',
        senderClerkUserId: 'demo_provider_kofi_boateng',
        text: 'Good morning Kwabena. Yes, I am on my way and currently passing KNUST junction. Expect me in 15 minutes.',
        createdAt: '2026-09-06T08:05:00Z',
      },
      {
        id: 'sample-msg-e3',
        senderClerkUserId: 'demo_provider_kofi_boateng',
        text: 'I have arrived at the gate and commenced the phase load diagnostic on the main distribution box.',
        createdAt: '2026-09-06T08:32:00Z',
      },
      {
        id: 'sample-msg-e4',
        senderClerkUserId: 'demo_cust_kwabena_owusu',
        text: 'Understood, the security guard has been briefed to grant you entry to the breaker room.',
        createdAt: '2026-09-06T08:40:00Z',
      },
    ],
  },
  {
    id: 'sample-conv-gardening-request',
    customerId: 'sample-cust-abena-osei',
    providerId: 'sample-prov-yaw-osei',
    jobRequestId: 'sample-req-garden-clear',
    participants: ['demo_cust_abena_osei', 'demo_provider_yaw-osei'],
    messages: [
      {
        id: 'sample-msg-g1',
        senderClerkUserId: 'demo_cust_abena_osei',
        text: 'Hi Yaw, I posted a job request for compound clearing in Legon Hills. The elephant grass is getting thick.',
        createdAt: '2026-09-05T18:10:00Z',
      },
      {
        id: 'sample-msg-g2',
        senderClerkUserId: 'demo_provider_yaw-osei',
        text: 'Hello Abena, I can handle that. Does the compound have building rocks or gravel mixed in the grass, or is it pure soil?',
        createdAt: '2026-09-05T18:30:00Z',
      },
      {
        id: 'sample-msg-g3',
        senderClerkUserId: 'demo_cust_abena_osei',
        text: 'It is mostly clear red soil with some decorative flower beds near the perimeter fence.',
        createdAt: '2026-09-05T18:45:00Z',
      },
      {
        id: 'sample-msg-g4',
        senderClerkUserId: 'demo_provider_yaw-osei',
        text: 'Perfect. My crew will bring the petrol brush cutters, hedge shears, and heavy-duty disposal sacks on Saturday morning.',
        createdAt: '2026-09-05T19:00:00Z',
      },
    ],
  },
];

// E. Search Configuration Document
const SEARCH_AGENT_CONTEXT = {
  id: 'fix-it-search-agent-context',
  title: 'Fix it Search Agent Context (Ghana Marketplace)',
  contentScopeFilter: `*[_type in ["service", "category", "providerProfile"] && (!defined(status) || status == "published")] {
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
  "category": category->{ _id, title, slug, iconName },
  "provider": provider->{ _id, displayName, slug, serviceAreas, availability, verificationStatus }
}`,
  searchInstructions: `You are the intelligent search assistant for Fix it, Ghana's premier local services marketplace.
- Ground every result strictly in stored Sanity data. Never invent services, prices, providers, ratings, or availability.
- Match service titles, categories, and included tasks first. Match descriptions and provider expertise as supporting matches.
- Specificity rule: An exact service match (e.g., "Plumbing leak repair") must rank above a broad category match.
- Filter strictly by the customer's selected location (Accra, Kumasi, Tema, East Legon, etc.), budget, and availability if provided.
- Prices must always be represented in Ghana Cedis (GHS).
- Return structured service cards containing: title, slug, category, provider name, service area, starting price in GHS, and verification badge if applicable.
- Privacy boundary: Strictly exclude private customer details, phone numbers, addresses, messages, bookings, and unverified check records from search answers.
- Text matching is token-based with wildcards: match individual query words rather than full exact sentences.`,
};

// 3. Execution Pipeline
async function runSeed() {
  console.log('Starting Fix it Operations, Messaging & Search Config Seed...');
  console.log(`Target: Project [${projectId}], Dataset [${dataset}]\n`);

  // Step 1: Customer Profiles
  console.log('--- Step 1: Seeding 3 Customer Profiles ---');
  const customerMutations = SAMPLE_CUSTOMERS.map((cust) => ({
    createOrReplace: {
      _id: cust.id,
      _type: 'customerProfile',
      clerkUserId: cust.clerkUserId,
      fullName: cust.fullName,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      city: cust.city,
    },
  }));
  await sendMutations(customerMutations);
  console.log(`  Created/updated ${SAMPLE_CUSTOMERS.length} customer profiles.`);

  // Step 2: Job Requests
  console.log('\n--- Step 2: Seeding 4 Job Requests ---');
  const jobRequestMutations = SAMPLE_JOB_REQUESTS.map((req) => ({
    createOrReplace: {
      _id: req.id,
      _type: 'jobRequest',
      customer: { _type: 'reference', _ref: req.customerId },
      customerClerkUserId: req.customerClerkUserId,
      category: { _type: 'reference', _ref: req.categoryId },
      title: req.title,
      description: req.description,
      location: req.location,
      preferredDate: req.preferredDate,
      scope: req.scope,
      status: req.status,
      createdAt: new Date().toISOString(),
    },
  }));
  await sendMutations(jobRequestMutations);
  console.log(`  Created/updated ${SAMPLE_JOB_REQUESTS.length} job requests.`);

  // Step 3: Bookings (All 5 Statuses)
  console.log('\n--- Step 3: Seeding 5 Bookings (Requested, Confirmed, In Progress, Completed, Cancelled) ---');
  const bookingMutations = SAMPLE_BOOKINGS.map((book) => ({
    createOrReplace: {
      _id: book.id,
      _type: 'booking',
      customer: { _type: 'reference', _ref: book.customerId },
      customerClerkUserId: book.customerClerkUserId,
      provider: { _type: 'reference', _ref: book.providerId },
      providerClerkUserId: book.providerClerkUserId,
      service: { _type: 'reference', _ref: book.serviceId },
      agreedPackageName: book.agreedPackageName,
      agreedScope: book.agreedScope,
      agreedPrice: book.agreedPrice,
      currency: 'GHS',
      scheduledTime: book.scheduledTime,
      serviceAddress: book.serviceAddress,
      jobStatus: book.jobStatus,
      paymentStatus: book.paymentStatus,
      paymentReference: book.paymentReference,
      createdAt: new Date().toISOString(),
    },
  }));
  await sendMutations(bookingMutations);
  console.log(`  Created/updated ${SAMPLE_BOOKINGS.length} bookings covering all 5 job statuses.`);

  // Step 4: Messaging (Conversations & Messages)
  console.log('\n--- Step 4: Seeding 4 Conversations & 16 Messages ---');
  const conversationMutations = [];
  const messageMutations = [];

  for (const conv of SAMPLE_CONVERSATIONS) {
    const lastMsg = conv.messages[conv.messages.length - 1];
    conversationMutations.push({
      createOrReplace: {
        _id: conv.id,
        _type: 'conversation',
        participants: conv.participants,
        customer: { _type: 'reference', _ref: conv.customerId },
        provider: { _type: 'reference', _ref: conv.providerId },
        booking: conv.bookingId ? { _type: 'reference', _ref: conv.bookingId } : undefined,
        jobRequest: conv.jobRequestId ? { _type: 'reference', _ref: conv.jobRequestId } : undefined,
        lastMessageText: lastMsg.text,
        lastMessageAt: lastMsg.createdAt,
      },
    });

    for (const msg of conv.messages) {
      messageMutations.push({
        createOrReplace: {
          _id: msg.id,
          _type: 'message',
          conversation: { _type: 'reference', _ref: conv.id },
          senderClerkUserId: msg.senderClerkUserId,
          text: msg.text,
          createdAt: msg.createdAt,
        },
      });
    }
  }

  await sendMutations(conversationMutations);
  console.log(`  Created/updated ${conversationMutations.length} conversations.`);

  await sendMutations(messageMutations);
  console.log(`  Created/updated ${messageMutations.length} messages.`);

  // Step 5: Search Configuration Document
  console.log('\n--- Step 5: Configuring Search Agent Context Document ---');
  const searchConfigMutation = [
    {
      createOrReplace: {
        _id: SEARCH_AGENT_CONTEXT.id,
        _type: 'agentContext',
        title: SEARCH_AGENT_CONTEXT.title,
        contentScopeFilter: SEARCH_AGENT_CONTEXT.contentScopeFilter,
        searchInstructions: SEARCH_AGENT_CONTEXT.searchInstructions,
      },
    },
  ];
  await sendMutations(searchConfigMutation);
  console.log('  Successfully configured fix-it-search-agent-context document.');

  console.log('\n======================================================');
  console.log('🎉 Operations, Messaging & Search Seed Completed!');
  console.log('   - 3 Customer Profiles seeded');
  console.log('   - 4 Job Requests seeded');
  console.log('   - 5 Bookings (Requested, Confirmed, In Progress, Completed, Cancelled)');
  console.log('   - 4 Conversations with 16 authentic Messages seeded');
  console.log('   - 1 Search Configuration Agent Context document created');
  console.log('======================================================\n');
}

runSeed().catch((err) => {
  console.error('\n❌ Seed failed with error:', err);
  process.exit(1);
});

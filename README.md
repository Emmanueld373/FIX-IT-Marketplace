# Fix it Marketplace

A modern, fast local services marketplace in Ghana connecting customers with trusted local service providers for plumbing, electrical repairs, house cleaning, painting, moving, furniture assembly, gardening, and general household tasks.

## Tech Stack
- **Frontend**: Pure Semantic HTML5, Vanilla CSS3 (Custom Design System tokens), Vanilla JavaScript (ES6 Modules)
- **Backend**: Node.js & Express REST API with Sanity Client & Clerk Backend integration
- **Content & Database**: Sanity.io CMS
- **Icons**: Font Awesome 6.5.2
- **Typography**: Plus Jakarta Sans, Outfit & Inter

## Project Structure
```
fix-it-marketplace-main/
├── public/                 # Frontend client (pure HTML, CSS, JS)
│   ├── css/                # globals.css, layout.css, components.css, pages.css
│   ├── js/                 # API client, auth, shared components, page scripts
│   ├── videos/             # Background & promotional media
│   └── *.html              # 12 clean semantic HTML pages
├── server/                 # Express backend server
│   ├── routes/             # Modular REST API endpoints
│   ├── lib/                # Sanity & Clerk client utilities
│   ├── middleware/         # Auth & validation middlewares
│   └── index.js            # Express application entry point
├── scripts/                # Database seed & maintenance scripts
├── studio/                 # Sanity Studio CMS schema definitions
├── package.json            # Root scripts & dependencies
└── .env.local              # Environment configuration
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
Or for auto-reloading development mode:
```bash
npm run dev
```

### 3. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) to access Fix it Marketplace.

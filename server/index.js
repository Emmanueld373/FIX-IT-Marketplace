import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Route modules
import searchRoutes from './routes/api-search.js';
import adminRoutes from './routes/api-admin.js';
import bookingsRoutes from './routes/api-bookings.js';
import providerRoutes from './routes/api-provider.js';
import uploadRoutes from './routes/api-upload.js';
import profileRoutes from './routes/api-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files — serve the public/ directory
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api', searchRoutes);        // /api/categories, /api/search, /api/services/:slug
app.use('/api/admin', adminRoutes);    // /api/admin/check, /api/admin/providers, /api/admin/services
app.use('/api/bookings', bookingsRoutes); // /api/bookings
app.use('/api/provider', providerRoutes); // /api/provider/profile, /api/provider/dashboard-data, etc.
app.use('/api/upload', uploadRoutes);  // /api/upload/image
app.use('/api/profile', profileRoutes); // /api/profile/sync

// SPA-style fallback: serve the appropriate HTML page for known routes
const pageRoutes = {
  '/': 'index.html',
  '/search': 'search.html',
  '/bookings': 'bookings.html',
  '/messages': 'messages.html',
  '/saved': 'saved.html',
  '/admin': 'admin.html',
  '/sign-in': 'sign-in.html',
  '/sign-up': 'sign-up.html',
  '/provider/dashboard': 'provider-dashboard.html',
  '/provider/onboarding': 'provider-onboarding.html',
  '/provider/profile': 'provider-profile.html',
  '/provider': 'provider-dashboard.html',
};

// Named route handler
Object.entries(pageRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(publicDir, file));
  });
});

// Dynamic routes with slugs
app.get('/services/:slug', (req, res) => {
  res.sendFile(path.join(publicDir, 'service.html'));
});
app.get('/categories/:slug', (req, res) => {
  res.sendFile(path.join(publicDir, 'category.html'));
});

// Catch-all fallback to homepage
app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🔧 Fix-it Marketplace Server`);
  console.log(`  ➜ Local:   http://localhost:${PORT}`);
  console.log(`  ➜ API:     http://localhost:${PORT}/api\n`);
});

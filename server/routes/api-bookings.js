import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { checkAdminAccess } from '../middleware/admin.js';
import { getServerClient } from '../lib/sanity.js';
import { getClerkUser } from '../middleware/auth.js';
import { Store } from '../lib/store.js';

const router = Router();

// GET /api/bookings
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    const role = req.query.role; // 'customer' | 'provider' | 'all'
    const storeBookings = Store.getBookings({ userId, role });

    let sanityBookings = [];
    try {
      const client = getServerClient();
      let filter = `_type == "booking" && (customerClerkUserId == $userId || providerClerkUserId == $userId || provider->clerkUserId == $userId)`;
      if (role === 'customer') {
        filter = `_type == "booking" && customerClerkUserId == $userId`;
      } else if (role === 'provider') {
        filter = `_type == "booking" && (providerClerkUserId == $userId || provider->clerkUserId == $userId)`;
      }

      sanityBookings = await client.fetch(
        `*[${filter}] | order(_createdAt desc){
          _id, customerClerkUserId, providerClerkUserId,
          "customerName": customer->fullName, "customerEmail": customer->email,
          "customerPhone": customer->phone, "providerName": provider->displayName,
          "providerPhotoUrl": provider->photo.asset->url,
          "serviceTitle": service->title, "serviceSlug": service->slug.current,
          agreedPackageName, agreedScope, agreedPrice, currency,
          scheduledTime, serviceAddress, jobStatus, paymentStatus,
          paymentReference, _createdAt
        }`,
        { userId: userId || '' }
      );
    } catch (_) {}

    // Merge without duplicates
    const combined = [...storeBookings];
    const existingIds = new Set(storeBookings.map(b => b._id || b.id));
    (sanityBookings || []).forEach(sb => {
      if (!existingIds.has(sb._id)) {
        combined.push({
          ...sb,
          id: sb._id,
          status: sb.jobStatus || 'confirmed',
          price: sb.agreedPrice,
          packageName: sb.agreedPackageName,
          location: sb.serviceAddress,
          scheduledDate: sb.scheduledTime
        });
      }
    });

    res.json({ success: true, bookings: combined });
  } catch (error) {
    console.warn('[BOOKINGS_GET_ERROR]', error?.message || error);
    res.json({ success: true, bookings: Store.getBookings({ userId: req.userId }) });
  }
});

// POST /api/bookings
router.post('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.userId || req.body.customerId || req.body.customerClerkUserId || 'user_' + Date.now();
    const serviceAddress = (req.body.serviceAddress || req.body.location || 'Accra').trim();
    const serviceId = req.body.serviceId;
    const serviceSlug = req.body.serviceSlug;
    const serviceTitle = req.body.serviceTitle || 'Home Service';
    const providerId = req.body.providerId;
    const providerName = req.body.providerName || 'Fix-it Pro';
    const providerClerkUserId = req.body.providerClerkUserId;
    const agreedPackageName = req.body.agreedPackageName || req.body.packageName || 'Standard Package';
    const agreedScope = req.body.agreedScope || req.body.notes || 'Service Appointment';
    const agreedPrice = req.body.agreedPrice !== undefined ? req.body.agreedPrice : (req.body.price || 150);
    const currency = req.body.currency || 'GH₵';
    const scheduledTime = req.body.scheduledTime || req.body.scheduledDate || new Date().toISOString();
    const customerNotes = req.body.customerNotes || req.body.notes || '';
    const customerName = req.body.customerName || 'Valued Customer';
    const customerEmail = req.body.customerEmail || '';

    // Create in real-time persistent store immediately
    const newBooking = Store.createBooking({
      userId,
      customerClerkUserId: userId,
      customerName,
      customerEmail,
      serviceAddress,
      serviceId,
      serviceSlug,
      serviceTitle,
      providerId,
      providerName,
      providerClerkUserId,
      agreedPackageName,
      agreedScope: customerNotes ? `${agreedScope} (Notes: ${customerNotes})` : agreedScope,
      agreedPrice,
      price: agreedPrice,
      currency,
      scheduledTime,
      scheduledDate: scheduledTime,
      jobStatus: 'confirmed',
      status: 'confirmed'
    });

    // Asynchronously try Sanity creation if write token exists
    if (process.env.SANITY_API_WRITE_TOKEN && !process.env.SANITY_API_WRITE_TOKEN.includes('your_private')) {
      (async () => {
        try {
          const client = getServerClient({ useWriteToken: true });
          await client.create({
            _type: 'booking',
            customerClerkUserId: userId,
            providerClerkUserId: providerClerkUserId || '',
            agreedPackageName,
            agreedScope,
            agreedPrice,
            currency,
            scheduledTime: new Date(scheduledTime).toISOString(),
            serviceAddress,
            jobStatus: 'requested',
            paymentStatus: 'unpaid',
            createdAt: new Date().toISOString()
          });
        } catch (sanityErr) {
          console.warn('[SANITY_BOOKING_ASYNC_SYNC_WARN]', sanityErr.message);
        }
      })();
    }

    res.json({
      success: true,
      bookingId: newBooking._id,
      booking: newBooking,
      message: 'Booking request confirmed successfully!'
    });
  } catch (error) {
    console.error('[BOOKINGS_POST_ERROR]', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH /api/bookings
router.patch('/', optionalAuth, async (req, res) => {
  try {
    const { bookingId, id, jobStatus, status } = req.body;
    const targetId = bookingId || id;
    const newStatus = jobStatus || status;

    if (!targetId || !newStatus) {
      return res.status(400).json({ error: 'Booking ID and status are required' });
    }

    const updated = Store.updateBookingStatus(targetId, newStatus);

    // Try Sanity patch asynchronously
    if (process.env.SANITY_API_WRITE_TOKEN && !process.env.SANITY_API_WRITE_TOKEN.includes('your_private')) {
      (async () => {
        try {
          const client = getServerClient({ useWriteToken: true });
          await client.patch(targetId).set({ jobStatus: newStatus }).commit();
        } catch (_) {}
      })();
    }

    res.json({
      success: true,
      bookingId: targetId,
      jobStatus: newStatus,
      booking: updated,
      message: `Booking status updated to ${newStatus}`
    });
  } catch (error) {
    console.error('[BOOKINGS_PATCH_ERROR]', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;

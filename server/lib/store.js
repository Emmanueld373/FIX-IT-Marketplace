import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory for persistent storage
const dataDir = path.join(__dirname, '..', '..', 'data');
const storeFilePath = path.join(dataDir, 'db.json');

// In-memory real-time state
const db = {
  bookings: [],
  messages: [],
  reviews: [],
  providerProfiles: {},
  providerServices: []
};

// Initial load
function loadDb() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(storeFilePath)) {
      const raw = fs.readFileSync(storeFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.bookings) db.bookings = parsed.bookings;
      if (parsed.messages) db.messages = parsed.messages;
      if (parsed.reviews) db.reviews = parsed.reviews;
      if (parsed.providerProfiles) db.providerProfiles = parsed.providerProfiles;
      if (parsed.providerServices) db.providerServices = parsed.providerServices;
    }
  } catch (err) {
    console.warn('[STORE_LOAD_WARNING]', err.message);
  }
}

// Persist to disk
function saveDb() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(storeFilePath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    // In serverless read-only contexts, fallback to /tmp
    try {
      const tmpPath = path.join('/tmp', 'fixit_db.json');
      fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
    } catch (_) {}
  }
}

loadDb();

export const Store = {
  // --- Bookings ---
  getBookings({ userId, role }) {
    return db.bookings.filter(b => {
      if (!userId) return true;
      if (role === 'customer') {
        return b.customerClerkUserId === userId || b.customerId === userId;
      }
      if (role === 'provider') {
        return b.providerClerkUserId === userId || b.providerId === userId;
      }
      return (
        b.customerClerkUserId === userId ||
        b.customerId === userId ||
        b.providerClerkUserId === userId ||
        b.providerId === userId
      );
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBookingById(id) {
    return db.bookings.find(b => b._id === id || b.id === id);
  },

  createBooking(data) {
    const id = 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newBooking = {
      _id: id,
      id: id,
      customerClerkUserId: data.customerClerkUserId || data.userId,
      customerId: data.customerClerkUserId || data.userId,
      customerName: data.customerName || 'Customer',
      customerEmail: data.customerEmail || '',
      providerId: data.providerId || '',
      providerClerkUserId: data.providerClerkUserId || '',
      providerName: data.providerName || 'Fix-it Pro',
      providerPhotoUrl: data.providerPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      serviceId: data.serviceId || '',
      serviceTitle: data.serviceTitle || 'Home Service',
      serviceSlug: data.serviceSlug || '',
      agreedPackageName: data.agreedPackageName || data.packageName || 'Standard Service',
      agreedScope: data.agreedScope || data.notes || 'Service Appointment',
      agreedPrice: data.agreedPrice !== undefined ? data.agreedPrice : (data.price || 150),
      price: data.agreedPrice !== undefined ? data.agreedPrice : (data.price || 150),
      currency: data.currency || 'GH₵',
      scheduledTime: data.scheduledTime || data.scheduledDate || new Date().toISOString(),
      scheduledDate: data.scheduledTime || data.scheduledDate || new Date().toISOString(),
      serviceAddress: data.serviceAddress || data.location || 'Accra',
      location: data.serviceAddress || data.location || 'Accra',
      jobStatus: data.jobStatus || 'confirmed',
      status: data.jobStatus || 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      _createdAt: new Date().toISOString()
    };

    db.bookings.unshift(newBooking);
    saveDb();

    // Automatically create an initial conversation message between customer and provider
    if (newBooking.providerName) {
      Store.sendMessage({
        senderId: 'system',
        senderName: 'Fix-it System',
        recipientId: newBooking.customerClerkUserId,
        recipientName: newBooking.customerName,
        text: `Booking confirmed for ${newBooking.serviceTitle} on ${new Date(newBooking.scheduledDate).toLocaleDateString()}. Provider ${newBooking.providerName} has received your request.`,
        bookingId: newBooking._id,
        serviceTitle: newBooking.serviceTitle
      });
    }

    return newBooking;
  },

  updateBookingStatus(id, newStatus) {
    const booking = db.bookings.find(b => b._id === id || b.id === id);
    if (!booking) return null;
    booking.jobStatus = newStatus;
    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();
    saveDb();
    return booking;
  },

  // --- Real-Time Messages ---
  sendMessage({ senderId, senderName, senderRole, recipientId, recipientName, text, serviceTitle, bookingId }) {
    const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const p1 = String(senderId || 'guest');
    const p2 = String(recipientId || 'provider');
    const convId = [p1, p2].sort().join('_');

    const message = {
      id,
      _id: id,
      convId,
      senderId: p1,
      senderName: senderName || 'User',
      senderRole: senderRole || 'customer',
      recipientId: p2,
      recipientName: recipientName || 'Provider',
      text: text.trim(),
      serviceTitle: serviceTitle || '',
      bookingId: bookingId || '',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.messages.push(message);
    saveDb();
    return message;
  },

  getConversations(userId) {
    const userMessages = db.messages.filter(
      m => m.senderId === userId || m.recipientId === userId || (!userId && m.senderId === 'system')
    );

    const convMap = new Map();
    userMessages.forEach(m => {
      const otherId = m.senderId === userId ? m.recipientId : m.senderId;
      const otherName = m.senderId === userId ? m.recipientName : m.senderName;
      const convKey = m.convId;

      if (!convMap.has(convKey)) {
        convMap.set(convKey, {
          id: convKey,
          otherId,
          name: otherName || 'Customer Service',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          lastMessage: m.text,
          time: m.timestamp || new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: m.createdAt,
          messages: []
        });
      }

      const conv = convMap.get(convKey);
      conv.lastMessage = m.text;
      conv.time = m.timestamp || new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      conv.updatedAt = m.createdAt;
      conv.messages.push({
        id: m.id,
        sender: m.senderId === userId ? 'me' : 'them',
        senderName: m.senderName,
        text: m.text,
        time: m.timestamp,
        createdAt: m.createdAt
      });
    });

    return Array.from(convMap.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getMessagesByConv(convId, userId) {
    return db.messages
      .filter(m => m.convId === convId)
      .map(m => ({
        id: m.id,
        sender: m.senderId === userId ? 'me' : 'them',
        senderName: m.senderName,
        text: m.text,
        time: m.timestamp,
        createdAt: m.createdAt
      }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  // --- Reviews ---
  createReview({ serviceId, providerId, rating, comment, customerName, customerId }) {
    const id = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const review = {
      _id: id,
      id,
      serviceId,
      providerId,
      rating: parseFloat(rating) || 5.0,
      comment,
      customerName: customerName || 'Verified Customer',
      customerId: customerId || 'user',
      createdAt: new Date().toISOString()
    };
    db.reviews.unshift(review);
    saveDb();
    return review;
  },

  getReviews(targetId) {
    if (!targetId) return db.reviews;
    return db.reviews.filter(r => r.serviceId === targetId || r.providerId === targetId);
  },

  // --- Provider Profiles & Services ---
  saveProviderProfile(clerkUserId, profileData) {
    db.providerProfiles[clerkUserId] = {
      ...profileData,
      clerkUserId,
      updatedAt: new Date().toISOString()
    };
    saveDb();
    return db.providerProfiles[clerkUserId];
  },

  getProviderProfile(clerkUserId) {
    return db.providerProfiles[clerkUserId] || null;
  }
};

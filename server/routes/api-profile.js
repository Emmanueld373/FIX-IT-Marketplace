import { Router } from 'express';
import { requireAuth, getClerkUser } from '../middleware/auth.js';
import { getServerClient } from '../lib/sanity.js';

const router = Router();

// POST /api/profile/sync
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const client = getServerClient({ useWriteToken: true });

    const existing = await client.fetch(
      `*[_type == "customerProfile" && clerkUserId == $userId][0]{ _id, fullName, email }`,
      { userId }
    );

    const user = await getClerkUser(userId);
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.username || 'Valued Customer';
    const email = user?.emailAddresses?.[0]?.emailAddress || '';
    const phone = user?.phoneNumbers?.[0]?.phoneNumber || '';

    if (existing) {
      if (!existing.fullName || !existing.email) {
        await client.patch(existing._id).set({
          fullName: existing.fullName || fullName,
          email: existing.email || email,
          phone: phone || undefined,
        }).commit();
      }
      return res.json({ status: 'existing', profileId: existing._id });
    }

    const created = await client.create({
      _type: 'customerProfile', clerkUserId: userId, fullName, email, phone, city: 'Accra',
    });

    res.json({ status: 'created', profileId: created._id });
  } catch (error) {
    console.error('[PROFILE_SYNC_ERROR]', error);
    res.status(500).json({ error: 'Failed to sync user profile' });
  }
});

export default router;

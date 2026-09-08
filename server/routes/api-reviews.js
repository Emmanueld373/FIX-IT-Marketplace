import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { Store } from '../lib/store.js';

const router = Router();

// GET /api/reviews?targetId=...
router.get('/', (req, res) => {
  try {
    const targetId = req.query.serviceId || req.query.providerId || req.query.targetId;
    const reviews = Store.getReviews(targetId);
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('[REVIEWS_GET_ERROR]', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// POST /api/reviews
router.post('/', optionalAuth, (req, res) => {
  try {
    const customerId = req.userId || req.body.customerId || 'user';
    const { serviceId, providerId, rating, comment, customerName } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Review comment is required' });
    }

    const review = Store.createReview({
      serviceId,
      providerId,
      rating: parseFloat(rating) || 5,
      comment: comment.trim(),
      customerName: customerName || 'Verified Customer',
      customerId
    });

    res.json({ success: true, review });
  } catch (err) {
    console.error('[REVIEWS_CREATE_ERROR]', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

export default router;

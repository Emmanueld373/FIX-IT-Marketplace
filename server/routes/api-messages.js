import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { Store } from '../lib/store.js';

const router = Router();

// GET /api/messages/conversations — get all active chat threads for current user
router.get('/conversations', optionalAuth, (req, res) => {
  try {
    const userId = req.userId || req.query.userId || 'guest_user';
    const conversations = Store.getConversations(userId);
    res.json({ success: true, conversations });
  } catch (err) {
    console.error('[MESSAGES_CONVERSATIONS_ERROR]', err);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// GET /api/messages/:convId — get chronological messages for a conversation
router.get('/:convId', optionalAuth, (req, res) => {
  try {
    const userId = req.userId || req.query.userId || 'guest_user';
    const { convId } = req.params;
    const messages = Store.getMessagesByConv(convId, userId);
    res.json({ success: true, messages });
  } catch (err) {
    console.error('[MESSAGES_GET_ERROR]', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// POST /api/messages — send a real-time message
router.post('/', optionalAuth, (req, res) => {
  try {
    const senderId = req.userId || req.body.senderId || 'user_' + Date.now();
    const {
      senderName,
      senderRole,
      recipientId,
      recipientName,
      text,
      serviceTitle,
      bookingId
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    const message = Store.sendMessage({
      senderId,
      senderName: senderName || 'Valued Customer',
      senderRole: senderRole || 'customer',
      recipientId: recipientId || 'provider',
      recipientName: recipientName || 'Fix-it Pro',
      text: text.trim(),
      serviceTitle,
      bookingId
    });

    res.json({ success: true, message });
  } catch (err) {
    console.error('[MESSAGES_SEND_ERROR]', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;

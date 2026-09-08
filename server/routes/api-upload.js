import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { getServerClient } from '../lib/sanity.js';

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// POST /api/upload/image
router.post('/image', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, or GIF are accepted.' });
    }

    const client = getServerClient({ useWriteToken: true });
    const asset = await client.assets.upload('image', req.file.buffer, {
      filename: req.file.originalname || 'profile-photo.jpg',
      contentType: req.file.mimetype,
    });

    res.json({ success: true, assetId: asset._id, url: asset.url });
  } catch (error) {
    console.error('[IMAGE_UPLOAD_ERROR]', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;

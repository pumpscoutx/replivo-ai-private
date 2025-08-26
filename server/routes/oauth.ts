import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Status endpoints
router.get('/:provider/status/:userId', async (req, res) => {
  const { provider, userId } = req.params;
  try {
    const has = await (storage as any).hasOAuthToken?.(userId, provider);
    res.json({ provider, userId, connected: !!has });
  } catch (e) {
    res.json({ provider, userId, connected: false });
  }
});

// Start OAuth (placeholder)
router.get('/:provider/start', (req, res) => {
  const { provider } = req.params;
  res.status(501).json({ message: `OAuth start for ${provider} not configured in this demo` });
});

// OAuth callback (placeholder)
router.get('/:provider/callback', (req, res) => {
  const { provider } = req.params;
  res.status(501).json({ message: `OAuth callback for ${provider} not configured in this demo` });
});

export default router;
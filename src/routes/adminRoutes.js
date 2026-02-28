import express from 'express';
import { RESPONSE_CODES } from '#src/lib/common';
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({ status: 'Admin API is operational' });
});

// Future routes will look like:
// router.get('/sessions', verifyAdmin, adminSessionController.getAllSessions);
// router.delete('/sessions/:userId', verifyAdmin, adminSessionController.revokeUserSessions);

export default router;
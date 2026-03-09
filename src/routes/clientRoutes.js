import express from 'express';
import { RESPONSE_CODES } from '#src/lib/common.js';
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({ status: 'Client API is operational' });
});

// Future routes will look like:
// router.post('/login', clientAuthController.login);
// router.get('/auth/github', oauthService.githubRedirect);

export default router;
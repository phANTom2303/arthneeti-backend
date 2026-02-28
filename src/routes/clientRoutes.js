import express from 'express';

const router = express.Router();

// This endpoint will be accessible at: http://localhost:5000/api/client/health
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'Client API is operational' });
});

// Future routes will look like:
// router.post('/login', clientAuthController.login);
// router.get('/auth/github', oauthService.githubRedirect);

export default router;
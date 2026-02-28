const express = require('express');
const router = express.Router();

// This endpoint will be accessible at: http://localhost:5000/api/admin/health
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'Admin API is operational' });
});

// Future routes will look like:
// router.get('/sessions', verifyAdmin, adminSessionController.getAllSessions);
// router.delete('/sessions/:userId', verifyAdmin, adminSessionController.revokeUserSessions);

module.exports = router;
import express from 'express';
import { getAuth } from '../config/firebase.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Verify user token and get user info
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userRecord = await getAuth().getUser(req.user.uid);

        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            createdAt: userRecord.metadata.creationTime
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Verify token endpoint (for frontend validation)
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token required' });
        }

        const decodedToken = await getAuth().verifyIdToken(token);

        res.json({
            valid: true,
            uid: decodedToken.uid,
            email: decodedToken.email
        });
    } catch (error) {
        res.json({ valid: false, error: error.message });
    }
});

export default router;

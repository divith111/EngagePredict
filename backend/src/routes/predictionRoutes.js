import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getFirestore } from '../config/firebase.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/predict - Analyze content and get prediction
router.post('/predict', verifyToken, upload.single('media'), async (req, res) => {
    try {
        const { caption, hashtags, platform, postingTime, dayOfWeek, location, targetAudience, mediaInfo } = req.body;

        // Prepare data for ML service
        const analysisData = {
            caption: caption || '',
            hashtags: hashtags || '',
            platform: platform || 'instagram',
            postingTime: postingTime || '12:00',
            dayOfWeek: dayOfWeek || 'Wednesday',
            location: location || '',
            targetAudience: targetAudience || 'General',
            mediaInfo: mediaInfo ? JSON.parse(mediaInfo) : null,
            userId: req.user.uid
        };

        let prediction;

        try {
            // Call ML service for prediction
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, analysisData, {
                timeout: 30000
            });
            prediction = mlResponse.data;
        } catch (mlError) {
            console.log('ML service unavailable, using fallback prediction');
            // Fallback prediction if ML service is down
            prediction = generateFallbackPrediction(analysisData);
        }

        // Save prediction to Firestore
        const db = getFirestore();
        const predictionRef = await db.collection('predictions').add({
            userId: req.user.uid,
            ...analysisData,
            score: prediction.score,
            engagementLevel: prediction.engagementLevel,
            feedback: prediction.feedback,
            tips: prediction.tips,
            createdAt: new Date()
        });

        res.json({
            id: predictionRef.id,
            ...prediction
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to analyze content' });
    }
});

// GET /api/history - Get user's prediction history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const db = getFirestore();
        const snapshot = await db
            .collection('predictions')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const predictions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        res.json(predictions);
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// DELETE /api/history/:id - Delete a prediction
router.delete('/history/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();

        // Verify ownership
        const docRef = db.collection('predictions').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Prediction not found' });
        }

        if (doc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await docRef.delete();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete prediction' });
    }
});

// Fallback prediction function
function generateFallbackPrediction(data) {
    let score = 50;
    const feedback = [];
    const tips = [];

    // Caption analysis
    const captionLength = data.caption?.length || 0;
    if (captionLength > 100 && captionLength < 300) {
        score += 10;
        feedback.push({ type: 'success', text: 'Optimal caption length', impact: '+10%' });
    } else if (captionLength < 50) {
        score -= 5;
        feedback.push({ type: 'warning', text: 'Add more context to your caption', impact: '-5%' });
    }

    // Hashtag analysis
    const hashtagCount = (data.hashtags?.match(/#\w+/g) || []).length;
    if (hashtagCount >= 3 && hashtagCount <= 10) {
        score += 10;
        feedback.push({ type: 'success', text: `${hashtagCount} hashtags is optimal`, impact: '+10%' });
    } else if (hashtagCount < 3) {
        feedback.push({ type: 'warning', text: 'Add more hashtags for discoverability', impact: '-5%' });
    }

    // Media quality
    if (data.mediaInfo) {
        const { orientation, resolution } = data.mediaInfo;

        if (resolution === '1080p' || resolution === '4K') {
            score += 15;
            feedback.push({ type: 'success', text: 'High quality resolution detected', impact: '+15%' });
        }

        const verticalPlatforms = ['tiktok', 'instagram'];
        if (verticalPlatforms.includes(data.platform) && orientation === 'Portrait') {
            score += 20;
            feedback.push({ type: 'success', text: 'Portrait orientation is optimal', impact: '+20%' });
        } else if (verticalPlatforms.includes(data.platform) && orientation === 'Landscape') {
            score -= 15;
            feedback.push({ type: 'error', text: 'Change to Portrait for better reach', impact: '-15%' });
        }
    }

    // Posting time
    if (data.postingTime) {
        const hour = parseInt(data.postingTime.split(':')[0]);
        if ((hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 21)) {
            score += 10;
            feedback.push({ type: 'success', text: 'Great posting time', impact: '+10%' });
        }
    }

    score = Math.max(0, Math.min(100, score));
    const engagementLevel = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

    tips.push('Post consistently to build momentum');
    tips.push('Engage with comments in the first hour');
    tips.push('Use trending audio for additional reach');

    return {
        score,
        engagementLevel,
        feedback,
        tips,
        predictedReach: Math.round(score * 100 + Math.random() * 500),
        predictedLikes: Math.round(score * 10 + Math.random() * 50),
        predictedComments: Math.round(score * 2 + Math.random() * 10)
    };
}

export default router;
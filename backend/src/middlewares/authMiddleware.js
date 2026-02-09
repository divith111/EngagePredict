import { getAuth } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decodedToken = await getAuth().verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email?.split('@')[0]
            };
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error' });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            try {
                const decodedToken = await getAuth().verifyIdToken(token);
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name
                };
            } catch (error) {
                // Token invalid, continue without user
                req.user = null;
            }
        } else {
            req.user = null;
        }
        next();
    } catch (error) {
        next();
    }
};

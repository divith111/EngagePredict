import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

let firebaseApp = null;

export const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Option 1: Use service account JSON file path
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }
        // Option 2: Use environment variables for service account
        else if (process.env.FIREBASE_PROJECT_ID) {
            const serviceAccount = {
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
            };

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }
        // Option 3: Initialize with default (for testing)
        else {
            console.warn('⚠️  Firebase credentials not found. Running in limited mode.');
            firebaseApp = admin.initializeApp({
                projectId: 'engagepredict-demo'
            });
        }

        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        throw error;
    }
};

// Get Firestore instance
export const getFirestore = () => {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return admin.firestore();
};

// Get Auth instance
export const getAuth = () => {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return admin.auth();
};

// Get Storage instance
export const getStorage = () => {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return admin.storage();
};

export default admin;

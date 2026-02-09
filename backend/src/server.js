import app from './app.js';
import { initializeFirebase } from './config/firebase.js';

const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
initializeFirebase();

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     EngagePredict Backend Server       ║
╠════════════════════════════════════════╣
║  Status: Running                       ║
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════╝
  `);
});

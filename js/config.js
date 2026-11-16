/* =====================================================================
   FIREBASE SETUP — paste your config here (Firebase console →
   Project settings → General → Your apps → Web app → SDK setup → Config).
   This config is safe to publish; access is controlled by your
   Realtime Database rules and sign-in (see README.md).
   ===================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDQ8pdVjYiQ_YfvUPiOYk6BU4IViUvS5OE",
  authDomain: "trackers-4ad6e.firebaseapp.com",
  databaseURL: "https://trackers-4ad6e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trackers-4ad6e",
  storageBucket: "trackers-4ad6e.firebasestorage.app",
  messagingSenderId: "905056124165",
  appId: "1:905056124165:web:e56034dcc64a22364ecb6c"
};
/* Folder name inside each user's private space (users/<uid>/<DATA_ROOT>). */
window.DATA_ROOT = "tracker";
/* Sign out automatically after this many minutes without activity (0 = never). */
window.IDLE_SIGNOUT_MINUTES = 60;
/* AI assistant (Google Gemini). Each person adds their own API key in AI → Settings; it is stored only in their browser. */
window.AI_FEATURES = true;

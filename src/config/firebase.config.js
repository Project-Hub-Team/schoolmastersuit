// Firebase Configuration
// Ghana School Management System - Firebase Config

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyCRNfY33h_7IiBd33dQvJU6N-Z8_89QdR4",
  authDomain: "school-management-system-afc40.firebaseapp.com",
  databaseURL: "https://school-management-system-afc40-default-rtdb.firebaseio.com",
  projectId: "school-management-system-afc40",
  storageBucket: "school-management-system-afc40.firebasestorage.app",
  messagingSenderId: "596795127606",
  appId: "1:596795127606:web:996108327b84793f5fa597",
  measurementId: "G-W8N6LP1DV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Initialize App Check (uncomment in production)
// Replace with your reCAPTCHA site key
// if (typeof window !== 'undefined') {
//   initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
//     isTokenAutoRefreshEnabled: true
//   });
// }

export default app;

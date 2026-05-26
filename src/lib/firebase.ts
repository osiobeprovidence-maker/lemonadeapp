import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const envValue = (key: string, fallback: string) => {
  const value = import.meta.env[key];
  const configured = value && !value.startsWith('YOUR_') && !value.startsWith('your-');
  return configured || !import.meta.env.DEV ? value : fallback;
};

const firebaseConfig = {
  apiKey: envValue('VITE_FIREBASE_API_KEY', 'demo-api-key'),
  authDomain: envValue('VITE_FIREBASE_AUTH_DOMAIN', 'demo-project.firebaseapp.com'),
  projectId: envValue('VITE_FIREBASE_PROJECT_ID', 'demo-project'),
  storageBucket: envValue('VITE_FIREBASE_STORAGE_BUCKET', 'demo-project.appspot.com'),
  messagingSenderId: envValue('VITE_FIREBASE_MESSAGING_SENDER_ID', '000000000000'),
  appId: envValue('VITE_FIREBASE_APP_ID', '1:000000000000:web:0000000000000000000000'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (error) {
    // Emulator already connected
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator already connected
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulator already connected
  }
}

export default app;

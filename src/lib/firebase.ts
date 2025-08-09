import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRgKHqCbF0DLx3quHIkBTkIQkVrdPFAnw",
  authDomain: "ndsvoice-ee2af.firebaseapp.com",
  projectId: "ndsvoice-ee2af",
  storageBucket: "ndsvoice-ee2af.firebasestorage.app",
  messagingSenderId: "937766101167",
  appId: "1:937766101167:web:dc8469be38a8201aa9f45a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  SUBMISSIONS: 'submissions',
  ACTIVITY_LOGS: 'activity_logs'
} as const;

// Helper function to handle Firestore errors
export const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error.code === 'permission-denied') {
    return 'Permission denied. Please check your access rights.';
  }
  
  if (error.code === 'not-found') {
    return 'Document not found.';
  }
  
  if (error.code === 'already-exists') {
    return 'Document already exists.';
  }
  
  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.';
  }
  
  return error?.message || `An error occurred during ${operation}`;
};

// Network status helpers
export const goOffline = () => disableNetwork(db);
export const goOnline = () => enableNetwork(db);

export default app;
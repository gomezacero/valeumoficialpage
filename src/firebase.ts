import { initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export async function getDb() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(getApp());
}

export async function addFirestoreDoc(collectionName: string, data: Record<string, unknown>) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([
    import("firebase/firestore"),
    getDb(),
  ]);
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function logAnalyticsEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    const { isSupported, getAnalytics, logEvent } = await import("firebase/analytics");
    if (!(await isSupported())) return;
    logEvent(getAnalytics(getApp()), eventName, params);
  } catch {
    // Silently ignore — analytics is non-critical
  }
}

export function initAnalyticsLazy() {
  if (typeof window === "undefined") return;
  const schedule =
    (window as typeof window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ??
    ((cb: () => void) => window.setTimeout(cb, 2000));
  schedule(() => {
    import("firebase/analytics")
      .then(async ({ isSupported, getAnalytics }) => {
        if (await isSupported()) getAnalytics(getApp());
      })
      .catch(() => null);
  });
}

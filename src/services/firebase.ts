/**
 * Firebase Client SDK Initialization
 * 
 * Initializes Firebase App and Cloud Functions for client-side usage.
 */

import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import type { CoachRequest, CoachResponse } from '../types/Coach';

// Firebase config from environment variables
// User will need to set these in .env.local
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Singleton app instance
let app: FirebaseApp;

function getApp(): FirebaseApp {
    if (!app) {
        const apps = getApps();
        app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    }
    return app;
}

// Get functions instance
const functions = getFunctions(getApp(), 'us-central1');

// Connect to emulator in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

/**
 * Call the coachPhilosophy Cloud Function
 */
export async function callCoachPhilosophy(request: CoachRequest): Promise<CoachResponse> {
    const callable = httpsCallable<CoachRequest, CoachResponse>(functions, 'coachPhilosophy');
    const result = await callable(request);
    return result.data;
}

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

// Firebase configuration - replace with your own Firebase project config
export const firebaseConfig = {
  apiKey: "AIzaSyDgufvVsuMDIYekcmssNK08XgHPjdKBwNQ",
  authDomain: "roomiefind-91984.firebaseapp.com",
  projectId: "roomiefind-91984",
  storageBucket: "roomiefind-91984.firebasestorage.app",
  messagingSenderId: "939686048346",
  appId: "1:939686048346:web:fa470d932650c0fbf65e63",
  measurementId: "G-M480CPXBCB"
};

// Firebase providers for Angular
export const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(firebaseConfig)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore())
];

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDT6ODJ0Tcr3EaojHrfsrpXNrUnR2qQi48",
    authDomain: "ufo-project-bcfcc.firebaseapp.com",
    projectId: "ufo-project-bcfcc",
    storageBucket: "ufo-project-bcfcc.appspot.com",
    messagingSenderId: "871826136173",
    appId: "1:871826136173:web:7dd11cf54cb35318ce7364",
    measurementId: "G-3XJ4HJ7WG6"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

export { app, storage, database };

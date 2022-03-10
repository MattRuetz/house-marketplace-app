// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: 'AIzaSyAXV2-VZiI-6jNsG-K6IV1dmgvW85CT5Dc',

    authDomain: 'house-marketplace-app-dac61.firebaseapp.com',

    projectId: 'house-marketplace-app-dac61',

    storageBucket: 'house-marketplace-app-dac61.appspot.com',

    messagingSenderId: '943677503278',

    appId: '1:943677503278:web:6086126cb5077d26196cbf',
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const db = getFirestore();

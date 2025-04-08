// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWbBOnHDCYmVhYTBRyMSlwIecxMSQnl5Q",
  authDomain: "smartedu-collegemanagement.firebaseapp.com",
  projectId: "smartedu-collegemanagement",
  storageBucket: "smartedu-collegemanagement.firebasestorage.app",
  messagingSenderId: "117284112982",
  appId: "1:117284112982:web:d5f2bac5fe5df9d79709f7",
  measurementId: "G-DKW0DR8H14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

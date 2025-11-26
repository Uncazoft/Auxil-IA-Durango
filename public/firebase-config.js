// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBisJobug91bYk6qtBUCmVOZZGybGSSizY",
  authDomain: "auxil-ia-8dce3.firebaseapp.com",
  databaseURL: "https://auxil-ia-8dce3-default-rtdb.firebaseio.com",
  projectId: "auxil-ia-8dce3",
  storageBucket: "auxil-ia-8dce3.appspot.com",
  messagingSenderId: "937948317414",
  appId: "1:937948317414:web:247c24acbb874d8c5a9d27",
  measurementId: "G-S9B6NJ76QN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOWWT5xExxAqtyCrLfKuCD6ZXmu1UqFlE",
    authDomain: "hr-autoshortlist.firebaseapp.com",
    projectId: "hr-autoshortlist",
    storageBucket: "hr-autoshortlist.firebasestorage.app",
    messagingSenderId: "863047670512",
    appId: "1:863047670512:web:252f47663d25edcb418035",
    measurementId: "G-HB36MF8BGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };

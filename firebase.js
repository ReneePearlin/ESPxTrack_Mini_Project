// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDY8v3sFgo8y4yXM2eV-SocRGHXq1OHjwU",
  authDomain: "busgit-7f19d.firebaseapp.com",
  projectId: "busgit-7f19d",
  storageBucket: "busgit-7f19d.firebasestorage.app",
  messagingSenderId: "471387662803",
  appId: "1:471387662803:web:25114ebd4392a5d1a4a726",
  measurementId: "G-LB2BYHRVEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

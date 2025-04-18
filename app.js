// app.js
import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleSignInBtn");
const status = document.getElementById("status");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => window.location.href = "main.html")
      .catch(err => status.innerText = err.message);
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => window.location.href = "main.html")
      .catch(err => status.innerText = err.message);
  });
}

if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => window.location.href = "main.html")
      .catch(err => status.innerText = err.message);
  });
}

onAuthStateChanged(auth, user => {
  // Already logged in? Send to dashboard
  if (user && location.pathname.includes("index")) {
    window.location.href = "main.html";
  }
});

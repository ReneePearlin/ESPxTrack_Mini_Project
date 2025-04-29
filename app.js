// app.js
import { auth } from './firebase.js';  
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Grab elements after DOM is ready
  const loginBtn  = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const googleBtn = document.getElementById('googleSignInBtn');
  const status    = document.getElementById('status');

  // LOGIN
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      status.textContent = ''; // clear previous
      
      signInWithEmailAndPassword(auth, email, password)
        .then(() => { window.location.href = 'main.html'; })
        .catch(err => { status.textContent = err.message; });
    });
  }

  // SIGN UP
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      status.textContent = '';

      createUserWithEmailAndPassword(auth, email, password)
        .then(() => { window.location.href = 'main.html'; })
        .catch(err => { status.textContent = err.message; });
    });
  }

  // GOOGLE SIGN-IN
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const provider = new GoogleAuthProvider();
      status.textContent = '';

      signInWithPopup(auth, provider)
        .then(() => { window.location.href = 'main.html'; })
        .catch(err => { status.textContent = err.message; });
    });
  }

  // AUTO-REDIRECT if already logged in
  onAuthStateChanged(auth, user => {
    if (user && window.location.pathname.endsWith('index.html')) {
      window.location.href = 'main.html';
    }
  });
});

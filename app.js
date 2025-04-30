import { auth } from './firebase.js';  
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn  = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const googleBtn = document.getElementById('googleSignInBtn');
  const status    = document.getElementById('status');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      status.textContent = '';

      signInWithEmailAndPassword(auth, email, password)
        .then(() => { window.location.href = 'main.html'; })
        .catch(err => { status.textContent = err.message; });
    });
  }

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

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const provider = new GoogleAuthProvider();
      status.textContent = '';

      signInWithPopup(auth, provider)
        .then(() => { window.location.href = 'main.html'; })
        .catch(err => { status.textContent = err.message; });
    });
  }

  onAuthStateChanged(auth, user => {
    if (user && window.location.pathname.endsWith('index.html')) {
      window.location.href = 'main.html';
    }
  });
});

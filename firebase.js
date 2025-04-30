import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth }
  from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getFirestore }
  from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDY8v3sFgo8y4yXM2eV-SocRGHXq1OHjwU",
  authDomain: "busgit-7f19d.firebaseapp.com",
  databaseURL: "https://busgit-7f19d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "busgit-7f19d",
  storageBucket: "busgit-7f19d.appspot.com",
  messagingSenderId: "471387662803",
  appId: "1:471387662803:web:25114ebd4392a5d1a4a726",
  measurementId: "G-LB2BYHRVEQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

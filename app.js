// app.js

function signUp() {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  console.log("🚀 Signing up with", email);

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("✅ Sign up success:", userCredential);
      window.location.href = 'main.html';
    })
    .catch(error => {
      console.error("❌ Sign up error:", error);
      alert(error.message);
    });
}

function logIn() {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  console.log("🚀 Logging in with", email);

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("✅ Login success:", userCredential);
      window.location.href = 'main.html';
    })
    .catch(error => {
      console.error("❌ Login error:", error);
      alert(error.message);
    });
}

function googleSignIn() {
  console.log("🔘 Google Sign-In clicked");
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      console.log("✅ Google Sign-In success:", result);
      window.location.href = 'main.html';
    })
    .catch(error => {
      console.error("❌ Google Sign-In error:", error);
      alert(error.message);
    });
}

function logout() {
  firebase.auth().signOut()
    .then(() => {
      console.log("👋 Logged out");
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error("❌ Logout error:", error);
      alert(error.message);
    });
}

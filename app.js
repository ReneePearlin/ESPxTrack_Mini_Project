function signIn() {
  // Redirect to sign-in page if needed
  alert("Redirect to sign-in page (coming soon)");
}

function logIn() {
  // Redirect to log-in page if needed
  alert("Redirect to log-in page (coming soon)");
}

function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => window.location.href = 'main.html')
    .catch(console.error);
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = 'index.html';
  });
}

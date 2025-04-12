function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => window.location.href = 'main.html')
    .catch(e => alert(e.message));
}

function logIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = 'main.html')
    .catch(e => alert(e.message));
}

function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => window.location.href = 'main.html')
    .catch(e => alert(e.message));
}

function logout() {
  firebase.auth().signOut()
    .then(() => window.location.href = 'index.html');
}

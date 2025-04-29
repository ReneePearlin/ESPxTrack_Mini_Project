const auth = firebase.auth();

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "main.html";
    })
    .catch(err => {
      showMessage(err.message);
    });
}

function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "main.html";
    })
    .catch(err => {
      showMessage(err.message);
    });
}

function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => {
      window.location.href = "main.html";
    })
    .catch(err => {
      showMessage(err.message);
    });
}

function showMessage(msg) {
  document.getElementById("message").innerText = msg;
}

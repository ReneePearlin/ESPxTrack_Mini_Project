import { db, auth } from './firebase-config.js';

// Map Initialization (Leaflet)
let map = L.map('map').setView([12.8435, 80.1534], 13); // Centered on OMR/Chennai
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sidebar Panel Toggle Setup
const panelPairs = [
  ['btnRealTime', 'panelRealTime'],
  ['btnRouteSummary', 'panelRouteSummary'],
  ['btnPerformanceMetrics', 'panelPerformanceMetrics'],
  ['btnOccupancyInsights', 'panelOccupancyInsights'],
  ['btnDiagnosticPanel', 'panelDiagnosticPanel'],
  ['btnGeofencing', 'panelGeofencing'],
  ['btnPastRoutes', 'panelPastRoutes']
];

panelPairs.forEach(([btnId, panelId]) => {
  const button = document.getElementById(btnId);
  const panel = document.getElementById(panelId);

  if (button && panel) {
    button.addEventListener('click', () => {
      // Hide all panels first
      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
      // Show the selected panel
      panel.classList.remove('hidden');
    });
  }
});

// Close buttons inside each panel
document.querySelectorAll('.panel .closeBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.panel').classList.add('hidden');
  });
});

// Toggle bus list (Right Sidebar)
const toggleBusListBtn = document.getElementById('toggleBusList');
const busList = document.getElementById('busList');
toggleBusListBtn.addEventListener('click', () => {
  busList.classList.toggle('hidden');
});

// Search functionality (center panel)
const searchBtn = document.getElementById('searchBtn');
const busInput = document.getElementById('busInput');
const busDetails = document.getElementById('busDetails');

searchBtn.addEventListener('click', () => {
  const busNumber = busInput.value.trim();
  if (!busNumber) return;

  // Example Firebase call (Realtime Database or Firestore)
  // Here you can adjust it to fetch based on your DB structure
  fetchBusDetails(busNumber);
});

function fetchBusDetails(busNumber) {
  const busRef = firebase.database().ref(`buses/${busNumber}`);
  busRef.once('value').then(snapshot => {
    const data = snapshot.val();
    if (data) {
      busDetails.innerHTML = `
        <strong>Bus Number:</strong> ${busNumber}<br>
        <strong>Route:</strong> ${data.route}<br>
        <strong>Status:</strong> ${data.status}<br>
        <strong>Last Seen:</strong> ${data.timestamp}
      `;
    } else {
      busDetails.textContent = 'Bus not found.';
    }
  }).catch(err => {
    console.error(err);
    busDetails.textContent = 'Error fetching data.';
  });
}

// Placeholder for clearing past route markers
function clearPastRouteMarkers() {
  // TODO: implement marker cleanup
}

// Logout functionality
document.getElementById('btnLogout').addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  }).catch(error => {
    console.error('Logout error:', error);
  });
});

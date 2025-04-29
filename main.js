// main.js
import { auth, db } from './firebase.js';
import {
  collection,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {
  signOut
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

let map, markers = {}, busData = {};

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupAuth();
  loadBusData();
  bindUI();
});

function initMap() {
  map = L.map('map').setView([12.8722, 80.2194], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Fixed destination
  L.marker([12.873, 80.222])
    .addTo(map)
    .bindPopup("St. Joseph’s Group of Colleges, OMR")
    .openPopup();
}

function setupAuth() {
  document.getElementById('btnLogout')
    .addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      });
    });
}

function loadBusData() {
  const busesCol = collection(db, 'buses');
  onSnapshot(busesCol, snapshot => {
    // Build a simple map of busNumber→busInfo
    busData = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      // assume each doc has fields: busNumber, lat, lng, route
      busData[data.busNumber] = { ...data };
    });

    console.log('Loaded busData:', busData);
    refreshMarkers();
    populateBusList();
  }, err => {
    console.error("Firestore listen failed:", err);
  });
}

function refreshMarkers() {
  // Clear old markers
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  // Add new ones
  Object.values(busData).forEach(bus => {
    const m = L.marker([bus.lat, bus.lng])
      .addTo(map)
      .bindPopup(`Bus ${bus.busNumber}<br>${bus.route}`);
    markers[bus.busNumber] = m;
  });
}

function bindUI() {
  // Sidebar‐buttons are still placeholders:
  ['btnNotifications','btnPastRoutes','btnGeofencing','btnRouteDev','btnAnalytics']
    .forEach(id => {
      document.getElementById(id)
        .addEventListener('click', () => {
          alert(`${id} clicked — implement this feature`);
        });
    });

  // Toggle bus list
  const busListEl = document.getElementById('busList');
  document.getElementById('toggleBusList')
    .addEventListener('click', () => {
      busListEl.classList.toggle('hidden');
    });

  // Search
  document.getElementById('searchBtn')
    .addEventListener('click', searchBus);

  // Click list‐item
  busListEl.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      const num = e.target.dataset.bus;
      focusBus(num);
      showBusDetails(num);
    }
  });
}

function populateBusList() {
  const ul = document.getElementById('busList');
  ul.innerHTML = '';
  Object.values(busData).forEach(bus => {
    const li = document.createElement('li');
    li.textContent = `Bus ${bus.busNumber}`;
    li.dataset.bus = bus.busNumber;
    ul.appendChild(li);
  });
}

function searchBus() {
  const num = document.getElementById('busSearch').value.trim();
  if (!busData[num]) {
    document.getElementById('busDetails').textContent = `No bus ${num} found`;
    return;
  }
  focusBus(num);
  showBusDetails(num);
}

function focusBus(num) {
  const marker = markers[num];
  if (marker) {
    marker.openPopup();
    map.panTo(marker.getLatLng());
  }
}

function showBusDetails(busNumber) {
  const bus = busData[busNumber];
  document.getElementById('busDetails').innerHTML = `
    <strong>Bus ${bus.busNumber}</strong><br>
    Route: ${bus.route}<br>
    Location: [${bus.lat.toFixed(4)}, ${bus.lng.toFixed(4)}]<br>
    Destination: St. Joseph’s Group of Colleges, OMR
  `;
}

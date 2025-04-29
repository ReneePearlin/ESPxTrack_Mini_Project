// main.js
import { database, auth } from './firebase.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js';
import { signOut }     from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

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

  // fixed destination marker
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
  const busesRef = ref(database, 'buses');
  onValue(busesRef, snapshot => {
    const data = snapshot.val() || {};
    busData = data;
    refreshMarkers();
    populateBusList();  
  });
}

function refreshMarkers() {
  // remove old
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  Object.entries(busData).forEach(([id, bus]) => {
    const m = L.marker([bus.lat, bus.lng])
      .addTo(map)
      .bindPopup(`Bus ${bus.busNumber}<br>${bus.route}`);
    markers[bus.busNumber] = m;
  });
}

function bindUI() {
  // sidebar feature buttons (placeholder)
  ['btnNotifications','btnPastRoutes','btnGeofencing','btnRouteDev','btnAnalytics']
    .forEach(id => {
      document.getElementById(id)
        .addEventListener('click', () => {
          alert(`${id} clicked — implement this feature`);
        });
    });

  // Bus List toggle
  const busListEl = document.getElementById('busList');
  document.getElementById('toggleBusList')
    .addEventListener('click', () => {
      busListEl.classList.toggle('hidden');
    });

  // Search
  document.getElementById('searchBtn')
    .addEventListener('click', searchBus);

  // Click on a bus in the list
  busListEl.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      showBusDetails(e.target.dataset.bus);
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
  if (!busData) return;
  const found = Object.values(busData)
    .find(b => b.busNumber === num);
  if (found) {
    showBusDetails(found.busNumber);
    // open its popup and pan
    markers[num].openPopup();
    map.panTo(markers[num].getLatLng());
  } else {
    document.getElementById('busDetails')
      .textContent = `No bus ${num} found`;
  }
}

function showBusDetails(busNumber) {
  const bus = Object.values(busData)
    .find(b => b.busNumber === busNumber);
  if (!bus) return;
  document.getElementById('busDetails').innerHTML = `
    <strong>Bus ${bus.busNumber}</strong><br>
    Route: ${bus.route}<br>
    Location: [${bus.lat.toFixed(4)}, ${bus.lng.toFixed(4)}]<br>
    Destination: St. Joseph’s Group of Colleges, OMR
  `;
}

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
  map = L.map('map').setView([13.04, 80.23], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([12.873, 80.222]) // St. Joseph’s Group of Colleges
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
  const busesCol = collection(db, 'buses'); // assumes root-level collection

  onSnapshot(busesCol, snapshot => {
    busData = {};
    snapshot.forEach(doc => {
      const data = doc.data();

      // Filter only buses with coordinates
      if (data.latitude && data.longitude && data.id) {
        busData[data.id] = {
          id: data.id,
          lat: data.latitude,
          lng: data.longitude,
          route: data.routeName,
          status: data.status,
          nextStop: data.nextStop,
          speed: data.speed
        };
      }
    });

    refreshMarkers();
    populateBusList();
  });
}

function refreshMarkers() {
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  Object.values(busData).forEach(bus => {
    const m = L.marker([bus.lat, bus.lng])
      .addTo(map)
      .bindPopup(`
        <strong>${bus.id}</strong><br>
        Route: ${bus.route}<br>
        Next Stop: ${bus.nextStop}<br>
        Status: ${bus.status}<br>
        Speed: ${bus.speed?.toFixed(1)} km/h
      `);
    markers[bus.id] = m;
  });
}

function bindUI() {
  ['btnNotifications','btnPastRoutes','btnGeofencing','btnRouteDev','btnAnalytics']
    .forEach(id => {
      document.getElementById(id)
        .addEventListener('click', () => {
          alert(`${id} clicked — implement this feature`);
        });
    });

  document.getElementById('toggleBusList')
    .addEventListener('click', () => {
      document.getElementById('busList').classList.toggle('hidden');
    });

  document.getElementById('searchBtn')
    .addEventListener('click', searchBus);

  document.getElementById('busList')
    .addEventListener('click', e => {
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
    li.textContent = `Bus ${bus.id}`;
    li.dataset.bus = bus.id;
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
    <strong>${bus.id}</strong><br>
    Route: ${bus.route}<br>
    Next Stop: ${bus.nextStop}<br>
    Speed: ${bus.speed?.toFixed(1)} km/h<br>
    Status: ${bus.status}<br>
    Destination: St. Joseph’s Group of Colleges, OMR
  `;
}

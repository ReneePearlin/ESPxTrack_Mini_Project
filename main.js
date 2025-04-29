import { auth, db } from './firebase.js';
import {
  collection,
  onSnapshot,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {
  signOut
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

let map;
let currentMarkers = {};
let busData = {};
const BUS_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];

let currentFeature = '';

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

  L.marker([12.873, 80.222])
    .addTo(map)
    .bindPopup("St. Joseph’s Group of Colleges, OMR")
    .openPopup();
}

function setupAuth() {
  document.getElementById('btnLogout').addEventListener('click', () =>
    signOut(auth).then(() => window.location.href = 'index.html')
  );
}

function loadBusData() {
  const col = collection(db, 'live_buses');
  onSnapshot(col, snap => {
    busData = {};
    snap.forEach((doc, i) => {
      const d = doc.data();
      if (d.id && d.latitude && d.longitude) {
        busData[d.id] = {
          ...d,
          color: BUS_COLORS[i % BUS_COLORS.length]
        };
      }
    });
    drawCurrentMarkers();
    populateBusList();
    populateFeatureBusSelect();
  });
}

function drawCurrentMarkers() {
  Object.values(currentMarkers).forEach(m => map.removeLayer(m));
  currentMarkers = {};
  Object.values(busData).forEach(bus => {
    const icon = L.icon({
      iconUrl: 'path/to/bus-icon.png', // replace with your actual icon path
      iconSize: [30, 50],
      iconAnchor: [15, 25],
      popupAnchor: [0, -25]
    });

    const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(map)
      .bindPopup(`<strong>Bus ${bus.id}</strong><br>${bus.routeName}`);
    currentMarkers[bus.id] = marker;
  });
}

function bindUI() {
  const panel = document.getElementById('featurePanel');
  const featureBtnIds = {
    btnRealTime: 'Real-Time Status',
    btnRouteSummary: 'Route Summary',
    btnPerformance: 'Performance Metrics',
    btnOccupancy: 'Occupancy Insights',
    btnDiagnostics: 'Diagnostic Panel',
    btnGeofencing: 'Geofencing'
  };

  Object.entries(featureBtnIds).forEach(([btnId, label]) => {
    document.getElementById(btnId).addEventListener('click', () => {
      currentFeature = label;
      document.getElementById('featureResult').innerHTML = '';
      panel.classList.remove('hidden');
    });
  });

  panel.querySelector('.closeBtn').addEventListener('click', () => panel.classList.add('hidden'));

  document.getElementById('loadFeatureData').addEventListener('click', () => {
    const busId = document.getElementById('featureBusSelect').value;
    const resultBox = document.getElementById('featureResult');
    if (!busId || !busData[busId]) {
      resultBox.innerHTML = `<p style="color:red;">Invalid Bus</p>`;
      return;
    }

    const bus = busData[busId];
    switch (currentFeature) {
      case 'Real-Time Status':
        resultBox.innerHTML = `<p>Latitude: ${bus.latitude}<br>Longitude: ${bus.longitude}</p>`;
        break;
      case 'Route Summary':
        resultBox.innerHTML = `<p>Route: ${bus.routeName}<br>From: ${bus.start}<br>To: ${bus.end}</p>`;
        break;
      case 'Performance Metrics':
        resultBox.innerHTML = `<p>Speed: ${bus.speed || 'N/A'} km/h<br>Fuel: ${bus.fuel || 'N/A'}%</p>`;
        break;
      case 'Occupancy Insights':
        resultBox.innerHTML = `<p>Occupancy: ${bus.occupancy || 'N/A'} / ${bus.capacity || 'N/A'}</p>`;
        break;
      case 'Diagnostic Panel':
        resultBox.innerHTML = `<p>Battery Health: ${bus.battery || 'Good'}<br>Engine: ${bus.engine || 'OK'}</p>`;
        break;
      case 'Geofencing':
        const inZone = bus.latitude >= 12.85 && bus.latitude <= 13.1 && bus.longitude >= 80.1 && bus.longitude <= 80.3;
        resultBox.innerHTML = `<p>Status: ${inZone ? 'Inside' : 'Outside'} the designated zone</p>`;
        break;
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

function populateFeatureBusSelect() {
  const sel = document.getElementById('featureBusSelect');
  sel.innerHTML = '<option value="">Select Bus…</option>';
  Object.values(busData).forEach(bus => {
    const o = document.createElement('option');
    o.value = bus.id;
    o.text = `Bus ${bus.id}`;
    sel.appendChild(o);
  });
}

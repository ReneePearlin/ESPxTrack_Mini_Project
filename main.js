import { auth, db } from './firebase.js';
import {
  collection,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {
  signOut
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

let map;
let currentMarkers = {};
let busData = {};

const BUS_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f1c40f',
  '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
];

let currentFeature = '';
const featureLabels = {
  btnRealTimeStatus: 'Real-Time Status',
  btnRouteSummary: 'Route Summary',
  btnPerformanceMetrics: 'Performance Metrics',
  btnOccupancyInsights: 'Occupancy Insights',
  btnDiagnosticPanel: 'Diagnostic Panel',
  btnGeofencing: 'Geofencing'
};

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupAuth();
  loadBusData();
  setupUI();
});

function initMap() {
  map = L.map('map').setView([13.04, 80.23], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
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
          fuel: d.fuel ?? 'N/A', // Handle missing 'fuel'
          occupancy: d.occupancy ?? 'N/A', // Handle missing 'occupancy'
          capacity: d.capacity ?? 'N/A', // Handle missing 'capacity'
          color: BUS_COLORS[i % BUS_COLORS.length] 
        };
      }
    });
    drawMarkers();
    populateBusList();
    populateBusSelects();
  });
}

function drawMarkers() {
  // Remove old markers
  Object.values(currentMarkers).forEach(m => map.removeLayer(m));
  currentMarkers = {};

  Object.values(busData).forEach(bus => {
    const icon = L.divIcon({
      className: 'bus-marker',
      html: `<div style="background:${bus.color};width:16px;height:16px;border-radius:50%;"></div>`,
      iconSize: [16, 16]
    });
    const m = L.marker([bus.latitude, bus.longitude], { icon })
      .addTo(map)
      .bindPopup(`<strong>Bus ${bus.id}</strong><br>${bus.routeName}`);
    currentMarkers[bus.id] = m;
  });
}

function setupUI() {
  // Sidebar buttons → feature panel
  Object.keys(featureLabels).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => {
      currentFeature = featureLabels[btnId];
      document.getElementById('featureTitle').textContent = currentFeature;
      document.getElementById('featureResult').innerHTML = '';
      document.getElementById('featurePanel').classList.remove('hidden');
    });
  });

  // Close button for the feature panel
  document.querySelector('#featurePanel .closeBtn')
    .addEventListener('click', () =>
      document.getElementById('featurePanel').classList.add('hidden')
    );

  // Bus list toggle
  document.getElementById('toggleBusList')
    .addEventListener('click', () =>
      document.getElementById('busList').classList.toggle('hidden')
    );

  // Show feature data
  document.getElementById('loadFeatureData')
    .addEventListener('click', showFeatureData);
}

function populateBusList() {
  const ul = document.getElementById('busList');
  ul.innerHTML = '';
  Object.values(busData).forEach(bus => {
    const li = document.createElement('li');
    li.textContent = `Bus ${bus.id}`;
    li.onclick = () => map.setView([bus.latitude, bus.longitude], 14);
    ul.appendChild(li);
  });
}

function populateBusSelects() {
  document.querySelectorAll('.bus-select').forEach(sel => {
    sel.innerHTML = '<option value="">Select Bus…</option>';
    Object.values(busData).forEach(bus => {
      const o = document.createElement('option');
      o.value = bus.id;
      o.text = `Bus ${bus.id}`;
      sel.appendChild(o);
    });
  });
}

function showFeatureData() {
  const busId = document.getElementById('featureBusSelect').value;
  const out = document.getElementById('featureResult');
  if (!busId || !busData[busId]) {
    out.innerHTML = '<p style="color:red;">Please select a valid bus.</p>';
    return;
  }
  const b = busData[busId];
  let html = '';
  switch (currentFeature) {
    case 'Real-Time Status':
      html = `
        <p><strong>Lat:</strong> ${b.latitude}<br>
        <strong>Lng:</strong> ${b.longitude}</p>`;
      break;
    case 'Route Summary':
      html = `
        <p><strong>Route:</strong> ${b.routeName}<br>
        <strong>From:</strong> ${b.start || 'N/A'}<br>
        <strong>To:</strong> ${b.end || 'N/A'}</p>`;
      break;
    case 'Performance Metrics':
      html = `
        <p><strong>Speed:</strong> ${b.speed ?? 'N/A'} km/h<br>
        <strong>Fuel:</strong> ${b.fuel} %</p>`; // Use the 'fuel' field
      break;
    case 'Occupancy Insights':
      html = `
        <p><strong>Occupancy:</strong> ${b.occupancy} / ${b.capacity}</p>`; // Use 'occupancy' and 'capacity'
      break;
    case 'Diagnostic Panel':
      html = `
        <p><strong>Battery:</strong> ${b.battery ?? 'Unknown'}<br>
        <strong>Engine:</strong> ${b.engine ?? 'Unknown'}</p>`;
      break;
    case 'Geofencing':
      const inZone = (
        b.latitude >= 12.85 && b.latitude <= 13.1 &&
        b.longitude >= 80.1 && b.longitude <= 80.3
      );
      html = `<p>Status: <strong>${inZone ? 'Inside' : 'Outside'}</strong> Zone</p>`;
      break;
  }
  out.innerHTML = html;
}

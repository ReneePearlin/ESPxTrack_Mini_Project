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
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // ✅ Mark St. Joseph’s Institute of Technology
  const stJosephsCoords = [12.86944, 80.21583];
  L.marker(stJosephsCoords)
    .addTo(map)
    .bindPopup("<strong>St. Joseph’s Institute of Technology</strong>")
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
          fuel: d.fuel ?? 'N/A',
          occupancy: d.occupancy ?? 'N/A',
          capacity: d.capacity ?? 'N/A',
          battery: d.battery ?? 'N/A',
          engine: d.engine ?? 'N/A',
          speed: d.speed ?? 'N/A',
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
  Object.values(currentMarkers).forEach(m => map.removeLayer(m));
  currentMarkers = {};

  Object.values(busData).forEach((bus, idx) => {
    const idNum = bus.id.toString().replace(/\D/g, '');
    const color = bus.color;
    const icon = L.divIcon({
      className: 'bus-marker',
      html: `<div style="
        background:${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([bus.latitude, bus.longitude], { icon })
      .addTo(map)
      .bindPopup(`<strong>Bus No ${idNum}</strong><br>${bus.routeName}`);

    currentMarkers[bus.id] = marker;
  });
}

function setupUI() {
  Object.keys(featureLabels).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => {
      currentFeature = featureLabels[btnId];
      document.getElementById('featureTitle').textContent = currentFeature;
      document.getElementById('featureResult').innerHTML = '';
      document.getElementById('featurePanel').classList.remove('hidden');
    });
  });

  document.querySelector('#featurePanel .closeBtn')
    .addEventListener('click', () =>
      document.getElementById('featurePanel').classList.add('hidden')
    );

  document.getElementById('loadFeatureData')
    .addEventListener('click', showFeatureData);

  document.getElementById('toggleBusList')
    .addEventListener('click', () =>
      document.getElementById('busList').classList.toggle('hidden')
    );
}

function populateBusList() {
  const ul = document.getElementById('busList');
  ul.innerHTML = '';
  Object.values(busData).forEach(bus => {
    const li = document.createElement('li');
    const idNum = bus.id.toString().replace(/\D/g, '');
    li.textContent = `Bus No ${idNum}`;
    li.addEventListener('click', () => zoomToBus(bus.id));
    ul.appendChild(li);
  });
}

function populateBusSelects() {
  document.querySelectorAll('.bus-select').forEach(sel => {
    sel.innerHTML = '<option value="">Select Bus…</option>';
    Object.values(busData).forEach(bus => {
      const o = document.createElement('option');
      const idNum = bus.id.toString().replace(/\D/g, '');
      o.value = bus.id;
      o.text = `Bus No ${idNum}`;
      sel.appendChild(o);
    });
  });
}

function zoomToBus(busId) {
  const marker = currentMarkers[busId];
  if (!marker) return;
  map.setView(marker.getLatLng(), 15, { animate: true });
  marker.openPopup();
  showBusDetails(busId);
}

function showBusDetails(busId) {
  const b = busData[busId];
  const panel = document.getElementById('busDetailsPanel');
  panel.classList.remove('hidden');

  const idNum = b.id.toString().replace(/\D/g, '');
  document.getElementById('detailTitle').textContent = `Bus No ${idNum}`;
  document.getElementById('detailContent').innerHTML = `
    <p><strong>Route:</strong> ${b.routeName}</p>
    <p><strong>From:</strong> ${b.start}</p>
    <p><strong>To:</strong> ${b.end}</p>
    <p><strong>Fuel:</strong> ${b.fuel}%</p>
    <p><strong>Occupancy:</strong> ${b.occupancy}/${b.capacity}</p>
    <p><strong>Battery:</strong> ${b.battery}</p>
    <p><strong>Engine:</strong> ${b.engine}</p>
  `;
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
      html = `<p><strong>Latitude:</strong> ${b.latitude}<br>
              <strong>Longitude:</strong> ${b.longitude}</p>`;
      break;

    case 'Route Summary':
      html = `<p><strong>Route:</strong> ${b.routeName}<br>
              <strong>From:</strong> ${b.start}<br>
              <strong>To:</strong> ${b.end}</p>`;
      break;

    case 'Performance Metrics':
      html = `<p><strong>Speed:</strong> ${b.speed} km/h<br>
              <strong>Fuel:</strong> ${b.fuel}%</p>`;
      break;

    case 'Occupancy Insights':
      html = `<p><strong>Occupancy:</strong> ${b.occupancy}/${b.capacity}</p>`;
      break;

    case 'Diagnostic Panel':
      html = `<p><strong>Battery:</strong> ${b.battery}<br>
              <strong>Engine:</strong> ${b.engine}</p>`;
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

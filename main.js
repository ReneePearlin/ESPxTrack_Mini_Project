import { auth, db } from './firebase.js';
import { collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

let map;
let currentMarkers = {};
let pastRouteMarkers = [];
let busData = {};
const BUS_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f1c40f',
  '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
];

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
    signOut(auth).then(() => window.location.href='index.html')
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
    populateBusSelects();
  });
}

function drawCurrentMarkers() {
  Object.values(currentMarkers).forEach(m => map.removeLayer(m));
  currentMarkers = {};

  Object.values(busData).forEach(bus => {
    const busIcon = L.icon({
      iconUrl: 'path/to/bus-icon.png',
      iconSize: [30, 50],
      iconAnchor: [15, 25],
      popupAnchor: [0, -25]
    });

    const marker = L.marker([bus.latitude, bus.longitude], { icon: busIcon }).addTo(map)
      .bindPopup(`<strong>Bus ${bus.id}</strong><br>${bus.routeName}`);
    currentMarkers[bus.id] = marker;
  });
}

function bindUI() {
  const panels = {
    btnRealTimeStatus: 'panelRealTimeStatus',
    btnRouteSummary: 'panelRouteSummary',
    btnPerformanceMetrics: 'panelPerformanceMetrics',
    btnOccupancyInsights: 'panelOccupancyInsights',
    btnDiagnosticPanel: 'panelDiagnosticPanel',
    btnGeofencing: 'panelGeofencing'
  };

  Object.entries(panels).forEach(([btnId, panelId]) => {
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    if (btn && panel) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
        panel.classList.remove('hidden');
      });
    }
  });

  document.querySelectorAll('.panel .closeBtn')
    .forEach(btn => btn.addEventListener('click', () => {
      btn.closest('.panel').classList.add('hidden');
    }));

  const toggleBtn = document.getElementById('toggleBusList');
  const busList = document.getElementById('busList');
  if (toggleBtn && busList) {
    toggleBtn.addEventListener('click', () => {
      busList.classList.toggle('hidden');
    });
  }

  // Additional event listeners for panel functionalities can be added here
}

function populateBusList() {
  const ul = document.getElementById('busList');
  if (!ul) return;
  ul.innerHTML = '';
  Object.values(busData).forEach(bus => {
    const li = document.createElement('li');
    li.textContent = `Bus ${bus.id}`;
    li.dataset.bus = bus.id;
    ul.appendChild(li);
  });
}

function populateBusSelects() {
  const selects = document.querySelectorAll('.bus-select');
  selects.forEach(sel => {
    sel.innerHTML = '<option value="">Select Bus…</option>';
    Object.values(busData).forEach(bus => {
      const o = document.createElement('option');
      o.value = bus.id;
      o.text = `Bus ${bus.id}`;
      sel.appendChild(o);
    });
  });
}

// Functions to handle panel-specific functionalities can be added here

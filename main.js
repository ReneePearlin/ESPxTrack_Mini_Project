// main.js
import { auth, db } from './firebase.js';
import { collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

let map;
let currentMarkers = {};
let pastMarkers = [];
let busData = {};
const BUS_COLORS = [
  '#e74c3c','#3498db','#2ecc71','#f1c40f',
  '#9b59b6','#e67e22','#1abc9c','#34495e'
];

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupAuth();
  loadBusData();
  bindUI();
});

function initMap() {
  map = L.map('map').setView([13.04,80.23], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  L.marker([12.873,80.222])
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
  const col = collection(db,'live_buses');
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
    populatePastRoutesSelect();
  });
}

function drawCurrentMarkers() {
  // remove old
  Object.values(currentMarkers).forEach(m => map.removeLayer(m));
  currentMarkers = {};

  // draw new
  Object.values(busData).forEach(bus => {
    const marker = L.circleMarker([bus.latitude, bus.longitude], {
      radius: 8,
      color: bus.color,
      fillColor: bus.color,
      fillOpacity: 0.9
    }).addTo(map)
      .bindPopup(`<strong>${bus.id}</strong><br>${bus.routeName}`);
    currentMarkers[bus.id] = marker;
  });
}

function bindUI() {
  // Panel toggles
  [['btnPastRoutes','panelPastRoutes']].forEach(([btn,panel]) => {
    document.getElementById(btn).addEventListener('click', () => {
      // hide all panels, then show this one
      document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
      document.getElementById(panel).classList.remove('hidden');
      clearPastMarkers();
    });
  });

  // Close buttons
  document.querySelectorAll('.panel .closeBtn')
    .forEach(btn => btn.addEventListener('click', () => {
      btn.closest('.panel').classList.add('hidden');
      clearPastMarkers();
    }));

  // Show Past Route
  document.getElementById('showPastRouteBtn')
    .addEventListener('click', () => {
      const busId = document.getElementById('pastRoutesBusSelect').value;
      plotPastRoute(busId);
    });

  // Bus list toggle & search remain unchanged…
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

function populatePastRoutesSelect() {
  const sel = document.getElementById('pastRoutesBusSelect');
  sel.innerHTML = '<option value="">Select Bus…</option>';
  Object.values(busData).forEach(bus => {
    const o = document.createElement('option');
    o.value = bus.id;
    o.text = `Bus ${bus.id}`;
    sel.appendChild(o);
  });
}

function plotPastRoute(busId) {
  clearPastMarkers();
  if (!busData[busId] || !Array.isArray(busData[busId].history)) {
    return alert(`No past-route data for ${busId}`);
  }
  busData[busId].history.forEach(pt => {
    const pm = L.circleMarker([pt.latitude, pt.longitude], {
      radius: 5,
      color: busData[busId].color,
      fillColor: busData[busId].color,
      fillOpacity: 0.6
    }).addTo(map);
    pastMarkers.push(pm);
  });
}

function clearPastMarkers() {
  pastMarkers.forEach(m => map.removeLayer(m));
  pastMarkers = [];
}

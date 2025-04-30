import { auth, db } from './firebase.js';
import {
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import {
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

let map, selectedBusId = null;
let busMarkers = {};

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = 'index.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => window.location.href = 'index.html');
});

window.addEventListener('DOMContentLoaded', async () => {
  // Initialize Leaflet map
  map = L.map('map').setView([12.8406, 80.1538], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Add St. Joseph’s marker
  L.marker([12.8406, 80.1538])
    .addTo(map)
    .bindPopup("St. Joseph's Group of Colleges");

  // Load bus data from Firestore
  const snapshot = await getDocs(collection(db, 'live_buses'));
  const busListEl = document.getElementById('busList');
  const busSelectEl = document.getElementById('busSelect');
  busListEl.innerHTML = '';
  busSelectEl.innerHTML = '';

  snapshot.forEach(doc => {
    const bus = doc.data();
    const busId = doc.id;
    const { latitude, longitude, routeName } = bus;

    // Add to Leaflet map
    const icon = L.icon({
      iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${busId.charAt(0)}|FF0000|000000`,
      iconSize: [30, 45],
      className: 'bus-marker'
    });
    const marker = L.marker([latitude, longitude], { icon }).addTo(map)
      .bindPopup(`<b>${busId}</b><br>${routeName}`);
    busMarkers[busId] = marker;

    // Add to bus list
    const li = document.createElement('li');
    li.textContent = busId;
    li.addEventListener('click', () => {
      if (selectedBusId) {
        busMarkers[selectedBusId]._icon.classList.remove('selected-bus');
      }
      selectedBusId = busId;
      marker._icon.classList.add('selected-bus');
      map.setView([latitude, longitude], 15);
    });
    busListEl.appendChild(li);

    // Add to feature dropdown
    const opt = document.createElement('option');
    opt.value = busId;
    opt.textContent = busId;
    busSelectEl.appendChild(opt);
  });
});

// Feature Panel
const panel = document.getElementById('featurePanel');
const panelTitle = document.getElementById('panelTitle');
const closeBtn = document.querySelector('.closeBtn');
closeBtn.addEventListener('click', () => panel.classList.add('hidden'));

document.querySelectorAll('.sidebar-left button[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    panelTitle.textContent = btn.textContent;
    panel.classList.remove('hidden');
    document.getElementById('featureResult').innerHTML = '';
  });
});

document.getElementById('executeFeatureBtn').addEventListener('click', async () => {
  const selectedBusId = document.getElementById('busSelect').value;
  const snapshot = await getDocs(collection(db, 'live_buses'));
  let data;
  snapshot.forEach(doc => {
    if (doc.id === selectedBusId) {
      data = doc.data();
    }
  });

  const resultDiv = document.getElementById('featureResult');
  if (!data) {
    resultDiv.innerHTML = '<p>Bus not found.</p>';
    return;
  }

  resultDiv.innerHTML = `
    <p><b>Route:</b> ${data.routeName}</p>
    <p><b>Speed:</b> ${data.speed} km/h</p>
    <p><b>Fuel:</b> ${data.fuel}%</p>
    <p><b>Occupancy:</b> ${data.occupancy}/${data.capacity}</p>
    <p><b>Battery:</b> ${data.battery}%</p>
    <p><b>Engine:</b> ${data.engine ? 'ON' : 'OFF'}</p>
    <p><b>From:</b> ${data.start}</p>
    <p><b>To:</b> ${data.end}</p>
  `;
});

// Search functionality
document.getElementById('searchBusBtn').addEventListener('click', () => {
  const busId = document.getElementById('busSearch').value.trim();
  if (busMarkers[busId]) {
    const marker = busMarkers[busId];
    map.setView(marker.getLatLng(), 15);
    marker.openPopup();
    document.getElementById('busDetails').innerText = `Bus ${busId} focused.`;
  } else {
    document.getElementById('busDetails').innerText = `Bus ${busId} not found.`;
  }
});

// Toggle right sidebar
document.getElementById('toggleBusList').addEventListener('click', () => {
  const rightBar = document.querySelector('.sidebar-right');
  rightBar.classList.toggle('hidden');
});

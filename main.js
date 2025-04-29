// main.js
import { auth, db } from './firebase.js';
import { collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

let map, routeLayers = {}, busData = {}, pastRouteLayer;

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

  // fixed destination marker
  L.marker([12.873, 80.222])
    .addTo(map)
    .bindPopup("St. Joseph’s Group of Colleges, OMR")
    .openPopup();
}

function setupAuth() {
  document.getElementById('btnLogout')
    .addEventListener('click', () =>
      signOut(auth).then(() => window.location.href = 'index.html')
    );
}

function loadBusData() {
  const busesCol = collection(db, 'live_buses');
  onSnapshot(busesCol, snapshot => {
    busData = {};
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.latitude && d.longitude && d.id) {
        busData[d.id] = {
          id: d.id,
          lat: d.latitude,
          lng: d.longitude,
          route: d.routeName,
          status: d.status,
          nextStop: d.nextStop,
          speed: d.speed,
          history: d.history || []  // option for past coordinates
        };
      }
    });

    drawCurrentRoutes();
    populateBusList();
    populatePastRoutesSelect();
  });
}

function drawCurrentRoutes() {
  // remove old
  Object.values(routeLayers).forEach(l => map.removeLayer(l));
  routeLayers = {};

  // draw dashed line from each bus to college
  Object.values(busData).forEach(bus => {
    const line = L.polyline(
      [[bus.lat, bus.lng], [12.873, 80.222]],
      { dashArray: '5,10' }
    ).addTo(map)
     .bindPopup(`<strong>${bus.id}</strong><br>Route to Campus`);
    routeLayers[bus.id] = line;
  });
}

function bindUI() {
  // Sidebar panels
  const features = [
    { btn: 'btnNotifications', panel: 'panelNotifications' },
    { btn: 'btnPastRoutes',   panel: 'panelPastRoutes'   },
    { btn: 'btnGeofencing',   panel: 'panelGeofencing'   },
    { btn: 'btnRouteDev',     panel: 'panelRouteDev'     },
    { btn: 'btnAnalytics',    panel: 'panelAnalytics'    }
  ];
  features.forEach(f => {
    document.getElementById(f.btn)
      .addEventListener('click', () => showPanel(f.panel));
  });

  // Close buttons
  document.querySelectorAll('.panel .closeBtn')
    .forEach(btn => btn.addEventListener('click', () =>
      btn.closest('.panel').classList.add('hidden')
    ));

  // Bus list toggle
  document.getElementById('toggleBusList')
    .addEventListener('click', () =>
      document.getElementById('busList').classList.toggle('hidden')
    );

  // Search
  document.getElementById('searchBtn')
    .addEventListener('click', () => {
      const num = document.getElementById('busSearch').value.trim();
      if (busData[num]) focusBus(num);
    });

  // Past Routes: show on button
  document.getElementById('showPastRouteBtn')
    .addEventListener('click', () => {
      const busId = document.getElementById('pastRoutesBusSelect').value;
      drawPastRoute(busId);
    });

  // Clicking a bus in the list
  document.getElementById('busList')
    .addEventListener('click', e => {
      if (e.target.tagName === 'LI') {
        const num = e.target.dataset.bus;
        focusBus(num);
      }
    });
}

function showPanel(panelId) {
  // hide all
  document.querySelectorAll('#panelContainer .panel')
    .forEach(p => p.classList.add('hidden'));
  // show requested
  document.getElementById(panelId).classList.remove('hidden');
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
  sel.innerHTML = `<option value="">Select Bus…</option>`;
  Object.values(busData).forEach(bus => {
    const opt = document.createElement('option');
    opt.value = bus.id;
    opt.text = `Bus ${bus.id}`;
    sel.appendChild(opt);
  });
}

function drawPastRoute(busId) {
  // remove old
  if (pastRouteLayer) map.removeLayer(pastRouteLayer);
  const bus = busData[busId];
  if (!bus || !bus.history.length) {
    return alert(`No past-route data for ${busId}`);
  }
  pastRouteLayer = L.polyline(
    bus.history.map(pt => [pt.latitude, pt.longitude]),
    { color: '#e67e22' }
  ).addTo(map);
  map.fitBounds(pastRouteLayer.getBounds());
}

function focusBus(busId) {
  // pan to start of dashed line
  const layer = routeLayers[busId];
  if (layer) {
    layer.openPopup();
    map.panTo(layer.getLatLngs()[0]);
  }
}

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

// Custom bus icons (replace with your hosted images)
const BUS_ICONS = [
 // 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png', // red bus
//  'https://cdn-icons-png.flaticon.com/512/2776/2776068.png', // blue bus
// 'https://cdn-icons-png.flaticon.com/512/2776/2776069.png', // green bus
 // 'https://cdn-icons-png.flaticon.com/512/2776/2776070.png', // yellow bus
//  'https://cdn-icons-png.flaticon.com/512/2776/2776071.png', // purple bus
//  'https://cdn-icons-png.flaticon.com/512/2776/2776072.png', // orange bus
//  'https://cdn-icons-png.flaticon.com/512/2776/2776073.png', // pink bus
//  'https://cdn-icons-png.flaticon.com/512/2776/2776074.png'  // gray bus
'https://cdn-icons-png.flaticon.com/128/635/635705.png' // The one and only
];

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupAuth();
  loadBusData();
  setupUI();
});

function initMap() {
  map = L.map('map').setView([13.04, 80.23], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // Destination marker with custom icon
  const destinationIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  L.marker([12.86944, 80.21583], { icon: destinationIcon })
    .addTo(map)
    .bindPopup("📍 <strong>St. Joseph's Group of Colleges</strong>")
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
          speed: d.speed.toFixed(2) ?? 'N/A',
          battery: d.battery ?? 'N/A',
          engine: d.engine ?? 'N/A',
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
  // Clear old markers
  Object.values(currentMarkers).forEach(m => map.removeLayer(m));
  currentMarkers = {};

  Object.values(busData).forEach((bus, idx) => {
    const idNum = bus.id.toString().replace(/\D/g, '');
    
    const icon = L.icon({
      iconUrl: BUS_ICONS[idx % BUS_ICONS.length],
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const marker = L.marker(
      [bus.latitude, bus.longitude],
      { 
        icon,
        rotationAngle: bus.bearing || 0 // Optional: rotate marker if bearing data exists
      }
    ).addTo(map)
     .bindPopup(`
       <div class="bus-popup">
         <strong>Bus No${idNum}</strong><br>
         <span class="route-name">${bus.routeName}</span><br>
         <div class="bus-stats">
           <span>🚌 ${bus.occupancy}/${bus.capacity}</span>
           <span>⛽ ${bus.fuel}%</span>
           <span>⚡ ${bus.battery}</span>
         </div>
       </div>
     `);

    // Store reference to marker
    currentMarkers[bus.id] = marker;

    // Add click event to zoom to bus
    marker.on('click', () => {
      map.setView(marker.getLatLng(), 15);
      showBusDetails(bus.id);
    });
  });
}

function setupUI() {
  // Feature buttons
  Object.keys(featureLabels).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => {
      currentFeature = featureLabels[btnId];
      document.getElementById('featureTitle').textContent = currentFeature;
      document.getElementById('featureResult').innerHTML = '';
      document.getElementById('featurePanel').classList.remove('hidden');
      
      // Special setup for certain features
      if (btnId === 'btnGeofencing') {
        document.getElementById('geofenceControls').classList.remove('hidden');
      } else {
        document.getElementById('geofenceControls').classList.add('hidden');
      }
    });
  });

  // Panel controls
  document.querySelector('#featurePanel .closeBtn').addEventListener('click', () => {
    document.getElementById('featurePanel').classList.add('hidden');
  });

  document.getElementById('loadFeatureData').addEventListener('click', showFeatureData);

  // Toggle bus list
  document.getElementById('toggleBusList').addEventListener('click', () => {
    document.getElementById('busList').classList.toggle('hidden');
  });

  // Close bus details panel
  document.getElementById('closeBusDetails').addEventListener('click', () => {
    document.getElementById('busDetailsPanel').classList.add('hidden');
  });
}

function populateBusList() {
  const ul = document.getElementById('busList');
  ul.innerHTML = '';
  
  Object.values(busData).forEach(bus => {
    const li = document.createElement('li');
    const idNum = bus.id.toString().replace(/\D/g, '');
    
    li.innerHTML = `
      <span class="bus-color" style="background-color:${bus.color}"></span>
      <span class="bus-number">Bus No${idNum}</span>
      <span class="bus-route">${bus.routeName}</span>
    `;
    
    li.addEventListener('click', () => {
      zoomToBus(bus.id);
      document.getElementById('busList').classList.add('hidden');
    });
    
    ul.appendChild(li);
  });
}

function populateBusSelects() {
  document.querySelectorAll('.bus-select').forEach(sel => {
    sel.innerHTML = '<option value="">Select Bus...</option>';
    Object.values(busData).forEach(bus => {
      const o = document.createElement('option');
      const idNum = bus.id.toString().replace(/\D/g, '');
      o.value = bus.id;
      o.text = `Bus No${idNum} (${bus.routeName})`;
      sel.appendChild(o);
    });
  });
}

function zoomToBus(busId) {
  const marker = currentMarkers[busId];
  if (!marker) return;
  
  map.setView(marker.getLatLng(), 15, { 
    animate: true,
    duration: 1
  });
  
  marker.openPopup();
  showBusDetails(busId);
}

function showBusDetails(busId) {
  const b = busData[busId];
  if (!b) return;

  const panel = document.getElementById('busDetailsPanel');
  panel.classList.remove('hidden');

  const idNum = b.id.toString().replace(/\D/g, '');
  document.getElementById('detailTitle').textContent = `Bus No${idNum}`;
  document.getElementById('detailContent').innerHTML = `
    <div class="bus-detail-row">
      <span class="detail-label">Route:</span>
      <span class="detail-value">${b.routeName}</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">From:</span>
      <span class="detail-value">${b.start}</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">To:</span>
      <span class="detail-value">${b.end}</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">Speed:</span>
      <span class="detail-value">${b.speed.toFixed(2)} km/h</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">Fuel:</span>
      <span class="detail-value">${b.fuel}%</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">Occupancy:</span>
      <span class="detail-value">${b.occupancy}/${b.capacity}</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">Battery:</span>
      <span class="detail-value">${b.battery}</span>
    </div>
    <div class="bus-detail-row">
      <span class="detail-label">Engine:</span>
      <span class="detail-value">${b.engine}</span>
    </div>
  `;
}

function showFeatureData() {
  const busId = document.getElementById('featureBusSelect').value;
  const out = document.getElementById('featureResult');
  
  if (!busId || !busData[busId]) {
    out.innerHTML = '<div class="error-message">Please select a valid bus.</div>';
    return;
  }
  
  const b = busData[busId];
  const idNum = b.id.toString().replace(/\D/g, '');
  let html = '';
  
  switch (currentFeature) {
    case 'Real-Time Status':
      html = `
        <div class="feature-data">
          <h3>Bus No${idNum} Location</h3>
          <div class="data-row">
            <span>Latitude:</span>
            <span class="data-value">${b.latitude}</span>
          </div>
          <div class="data-row">
            <span>Longitude:</span>
            <span class="data-value">${b.longitude}</span>
          </div>
          <button class="btn zoom-btn" onclick="zoomToBus('${busId}')">Zoom to Bus</button>
        </div>
      `;
      break;
      
    case 'Route Summary':
      html = `
        <div class="feature-data">
          <h3>Bus No${idNum} Route</h3>
          <div class="route-map">
            <div class="route-stop">
              <span class="stop-marker">🟢</span>
              <span class="stop-name">${b.start}</span>
            </div>
            <div class="route-line"></div>
            <div class="route-stop">
              <span class="stop-marker">🔴</span>
              <span class="stop-name">${b.end}</span>
            </div>
          </div>
          <div class="route-distance">
            <span>Route Distance:</span>
            <span class="data-value">${b.distance || 'N/A'} km</span>
          </div>
        </div>
      `;
      break;
      
    case 'Performance Metrics':
      html = `
        <div class="feature-data">
          <h3>Performance Metrics</h3>
          <div class="metric-gauge">
            <div class="gauge-fill gauge-speed" style="--value:${Math.min(b.speed || 0, 100).toFixed(2)}"></div>
            <div class="gauge-label">
              <span>Speed</span>
              <span class="gauge-value">${b.speed.toFixed(2)} km/h</span>
            </div>
          </div>
          <div class="metric-gauge">
            <div class="gauge-fill gauge-fuel" style="--value:${Math.min(b.fuel || 0, 100).toFixed(2)}"></div>
            <div class="gauge-label">
              <span>Fuel</span>
              <span class="gauge-value">${b.fuel.toFixed(2)} %</span>
            </div>
          </div>
           
        </div>
      `;
      break;
      
    case 'Occupancy Insights':
      const occupancyPercent = Math.round((b.occupancy / b.capacity) * 100);
      html = `
        <div class="feature-data">
          <h3>Occupancy Status</h3>
          <div class="occupancy-meter">
            <div class="meter-fill" style="width:${occupancyPercent}%"></div>
            <span class="meter-text">${b.occupancy}/${b.capacity} (${occupancyPercent}%)</span>
          </div>
          <div class="occupancy-trend">
            <span>Trend: ${getOccupancyTrend(b.occupancy)}</span>
          </div>
        </div>
      `;
      break;
      
    case 'Diagnostic Panel':
      html = `
        <div class="feature-data">
          <h3>Diagnostic Status</h3>
          <div class="diagnostic-item ${b.battery === 'Good' ? 'good' : 'warning'}">
            <span>Battery:</span>
            <span>${b.battery}</span>
          </div>
          <div class="diagnostic-item ${b.engine === 'Normal' ? 'good' : 'warning'}">
            <span>Engine:</span>
            <span>${b.engine}</span>
          </div>
          <div class="diagnostic-item">
            <span>Last Maintenance:</span>
            <span>${b.lastMaintenance || 'N/A'}</span>
          </div>
        </div>
      `;
      break;
      
    case 'Geofencing':
      const inZone = (
        b.latitude >= 12.85 && b.latitude <= 13.1 &&
        b.longitude >= 80.1 && b.longitude <= 80.3
      );
      html = `
        <div class="feature-data">
          <h3>Geofence Status</h3>
          <div class="geofence-status ${inZone ? 'in-zone' : 'out-zone'}">
            <span>${inZone ? '✅ Inside' : '❌ Outside'} Operational Zone</span>
          </div>
          <div class="geofence-map">
            <button class="btn" onclick="showGeofenceOnMap()">Show Zone on Map</button>
          </div>
        </div>
      `;
      break;
  }
  
  out.innerHTML = html;
}

// Helper function for occupancy trend
function getOccupancyTrend(current) {
  // This would normally compare with previous data
  const rand = Math.random();
  if (rand > 0.6) return 'Increasing';
  if (rand > 0.3) return 'Steady';
  return 'Decreasing';
}

// Show geofence area on map
window.showGeofenceOnMap = function() {
  const bounds = [
    [12.85, 80.1], // SW
    [13.1, 80.3]   // NE
  ];
  
  // Remove existing geofence if any
  map.eachLayer(layer => {
    if (layer.options && layer.options.className === 'geofence-layer') {
      map.removeLayer(layer);
    }
  });
  
  // Add new geofence rectangle
  L.rectangle(bounds, {
    className: 'geofence-layer',
    color: '#ff7800',
    weight: 2,
    fillOpacity: 0.1
  }).addTo(map);
  
  // Zoom to show the geofence area
  map.fitBounds(bounds);
};

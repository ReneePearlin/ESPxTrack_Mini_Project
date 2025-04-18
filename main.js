// main.js
let map;
let markers = [];
let allBuses = [];

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 12.9716, lng: 77.5946 }, // default center
    zoom: 12
  });
}

// Fetch bus data and update markers
async function fetchBusData() {
  try {
    const res = await fetch('/api/buses'); // your real endpoint
    allBuses = await res.json();           // [{ number, route, lat, lng }, ...]
    updateMarkers(allBuses);
  } catch (e) {
    console.error('Failed to fetch buses', e);
  }
}

// Place markers for given bus list
function updateMarkers(busList) {
  // clear old
  markers.forEach(m => m.setMap(null));
  markers = [];

  busList.forEach(bus => {
    const marker = new google.maps.Marker({
      position: { lat: bus.lat, lng: bus.lng },
      map,
      title: `#${bus.number} – ${bus.route}`
    });
    markers.push(marker);
  });
}

// Filter & refresh
function filterBuses() {
  const numQ = document.getElementById('busNumberInput').value.trim().toLowerCase();
  const routeQ = document.getElementById('busRouteInput').value.trim().toLowerCase();

  const filtered = allBuses.filter(bus => {
    const matchNum   = !numQ   || bus.number.toLowerCase().includes(numQ);
    const matchRoute = !routeQ || bus.route.toLowerCase().includes(routeQ);
    return matchNum && matchRoute;
  });

  updateMarkers(filtered);
}

// Sidebar button stubs
document.getElementById('liveRoutesBtn').onclick     = () => alert('Showing Live Routes…');
document.getElementById('pastRoutesBtn').onclick     = () => alert('Showing Past Routes…');
document.getElementById('notificationsBtn').onclick  = () => alert('Showing Notifications…');

// Wire up search
document.getElementById('searchBtn').addEventListener('click', filterBuses);
document.getElementById('busNumberInput').addEventListener('input', filterBuses);
document.getElementById('busRouteInput').addEventListener('input', filterBuses);

// Kick everything off
window.initMap = initMap;
fetchBusData();
setInterval(fetchBusData, 5000);

let map;
let markers = [];
let allBuses = [];

// Initialize Google Map (Default location: Chennai)
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
    zoom: 12,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,  // Disable UI elements like zoom
    styles: [
      { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
      { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
      { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#9e9e9e" }] },
      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
    ]
  });

  // Call fetchBusData on page load
  fetchBusData();
}

// Fetch bus data from your backend API
async function fetchBusData() {
  try {
    const res = await fetch('/api/buses'); // Replace with your actual API endpoint
    allBuses = await res.json();           // [{ number, route, lat, lng }, ...]
    updateMarkers(allBuses);
  } catch (e) {
    console.error('Failed to fetch buses', e);
  }
}

// Update markers on map with the current bus data
function updateMarkers(busList) {
  // Clear any old markers
  markers.forEach(m => m.setMap(null));
  markers = [];

  busList.forEach(bus => {
    const marker = new google.maps.Marker({
      position: { lat: bus.lat, lng: bus.lng },
      map,
      title: `Bus #${bus.number} – ${bus.route}`,
      icon: {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', // Use bus icon here
        scaledSize: new google.maps.Size(32, 32), // Resize the icon
      }
    });
    markers.push(marker);
  });
}

// Filter buses based on input search
function filterBuses() {
  const numQ = document.getElementById('busNumberInput').value.trim().toLowerCase();
  const routeQ = document.getElementById('busRouteInput').value.trim().toLowerCase();

  const filtered = allBuses.filter(bus => {
    const matchNum = !numQ || bus.number.toLowerCase().includes(numQ);
    const matchRoute = !routeQ || bus.route.toLowerCase().includes(routeQ);
    return matchNum && matchRoute;
  });

  updateMarkers(filtered);
}

// Sidebar Button Functions
document.getElementById('liveRoutesBtn').onclick = () => alert('Showing Live Routes…');
document.getElementById('pastRoutesBtn').onclick = () => alert('Showing Past Routes…');
document.getElementById('notificationsBtn').onclick = () => alert('Showing Notifications…');

// Search Button Event Listener
document.getElementById('searchBtn').addEventListener('click', filterBuses);
document.getElementById('busNumberInput').addEventListener('input', filterBuses);
document.getElementById('busRouteInput').addEventListener('input', filterBuses);

// Initialize map and fetch bus data
window.initMap = initMap;

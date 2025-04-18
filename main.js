let map;
let markers = [];

// Predefined bus data (Static Data)
const buses = [
  { number: "101", route: "Route A", lat: 13.0827, lng: 80.2707 },
  { number: "102", route: "Route B", lat: 13.0956, lng: 80.2467 },
  { number: "103", route: "Route C", lat: 13.0838, lng: 80.2787 },
  { number: "104", route: "Route D", lat: 13.0912, lng: 80.2369 }
];

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

  // Create markers for each bus
  buses.forEach(bus => {
    const marker = new google.maps.Marker({
      position: { lat: bus.lat, lng: bus.lng },
      map,
      title: `Bus #${bus.number} – ${bus.route}`,
      icon: {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', // Placeholder bus icon
        scaledSize: new google.maps.Size(32, 32) // Resize the icon
      }
    });
    markers.push(marker);
  });
}

// Search functionality (optional)
function filterBuses() {
  const numQ = document.getElementById('busNumberInput').value.trim().toLowerCase();
  const routeQ = document.getElementById('busRouteInput').value.trim().toLowerCase();

  // Hide all markers first
  markers.forEach(marker => marker.setMap(null));

  const filtered = buses.filter(bus => {
    const matchNum = !numQ || bus.number.toLowerCase().includes(numQ);
    const matchRoute = !routeQ || bus.route.toLowerCase().includes(routeQ);
    return matchNum && matchRoute;
  });

  // Display filtered buses
  filtered.forEach(bus => {
    const marker = new google.maps.Marker({
      position: { lat: bus.lat, lng: bus.lng },
      map,
      title: `Bus #${bus.number} – ${bus.route}`,
      icon: {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', // Placeholder bus icon
        scaledSize: new google.maps.Size(32, 32)
      }
    });
    markers.push(marker);
  });
}

// Event listener for search button
document.getElementById('searchBtn').addEventListener('click', filterBuses);

// Initialize map
window.initMap = initMap;


let map;
let markers = [];
let allBuses = [];

// Initialize Google Map (default location: Chennai)
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
    zoom: 12,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,  // Disable UI (no zoom, street view)
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#212121"
          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#212121"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#212121"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#373737"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#3c3c3c"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#3e3e3e"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#000000"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#3d3d3d"
          }
        ]
      }
    ]
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
      title: `#${bus.number} – ${bus.route}`,
      icon: {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', // Bus icon
        scaledSize: new google.maps.Size(32, 32), // Resize the icon
      }
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


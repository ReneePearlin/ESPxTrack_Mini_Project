let map;
let busMarkers = []; // Store markers for buses

// Example of mock data (you can replace this with real data later)
const busData = [
  { id: 1, route: "Route 101", lat: 12.9716, lng: 77.5946 }, // Example: Bangalore
  { id: 2, route: "Route 202", lat: 12.9556, lng: 77.6086 },
  { id: 3, route: "Route 303", lat: 12.9396, lng: 77.6226 },
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12,
  });

  console.log("✅ Google Map initialized");

  // Add bus markers for each bus in the mock data
  busData.forEach(bus => {
    const marker = new google.maps.Marker({
      position: { lat: bus.lat, lng: bus.lng },
      map: map,
      title: `Bus ${bus.id} - ${bus.route}`,
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    busMarkers.push(marker); // Store each marker for later use
  });
}

function trackBus() {
  const number = document.getElementById("busNumber").value;
  const route = document.getElementById("busRoute").value;
  
  if (!number || !route) {
    alert("Please enter both Bus Number and Route.");
    return;
  }

  const bus = busData.find(b => b.id == number && b.route === route);
  if (bus) {
    alert(`Tracking Bus No: ${number} on Route: ${route}`);
    map.setCenter(new google.maps.LatLng(bus.lat, bus.lng));
    map.setZoom(14);
  } else {
    alert("Bus not found. Check the number and route.");
  }
}

function showLiveRoutes() {
  alert("Displaying live routes on the map.");
  // You can expand this to dynamically load live data from your server.
}

function showPastRoutes() {
  alert("Displaying past routes.");
  // Here you can later add logic to show past bus routes.
}

function showGeofencing() {
  alert("Displaying geofencing zones.");
  // You can add geofencing logic to highlight certain areas on the map.
}

function showNotifications() {
  alert("Showing notifications.");
  // You can display real-time notifications here.
}

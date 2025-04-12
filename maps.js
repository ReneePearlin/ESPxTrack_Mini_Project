let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
    zoom: 12,
  });

  console.log("✅ Google Map initialized");
}

function trackBus() {
  const number = document.getElementById("busNumber").value;
  const route = document.getElementById("busRoute").value;
  alert(`Tracking Bus No: ${number} on Route: ${route}`);
  // Add logic here to highlight bus or show route on map
}

function showLiveRoutes() {
  alert("Live Routes will appear here!");
}

function showPastRoutes() {
  alert("Past Routes data coming soon!");
}

function showGeofencing() {
  alert("Geofencing zones will appear here.");
}

function showNotifications() {
  alert("Notifications will be displayed here.");
}

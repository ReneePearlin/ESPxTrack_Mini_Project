let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.9716, lng: 77.5946 }, // Example: Bangalore
    zoom: 12,
  });

  // Placeholder: draw buses here
}

function trackBus() {
  const busNo = document.getElementById('busNumber').value;
  const route = document.getElementById('route').value;

  alert(`Tracking Bus: ${busNo} on Route: ${route}`);

  // TODO: Add logic to show marker on the map
}

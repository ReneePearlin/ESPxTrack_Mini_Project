let map;
let geofenceCircle = null;
let geofenceListener = null;

function initMap() {
  // Initialize the map centered on Chennai
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 13.0827, lng: 80.2707 },
    zoom: 13,
  });
}

function activateGeofence() {
  alert("Click anywhere on the map to place a geofence (1 km radius)");

  // Remove previous geofence if any
  if (geofenceCircle) {
    geofenceCircle.setMap(null);
    geofenceCircle = null;
  }

  // Remove previous listener to avoid multiple listeners stacking
  if (geofenceListener) {
    google.maps.event.removeListener(geofenceListener);
  }

  // Add new click listener to place geofence
  geofenceListener = map.addListener("click", function (event) {
    const center = event.latLng;

    // Draw a circle (geofence) of 1 km radius
    geofenceCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: map,
      center: center,
      radius: 1000
    });

    console.log("Geofence set at:", center.lat(), center.lng());

    // Only allow one geofence at a time
    google.maps.event.removeListener(geofenceListener);
  });
}

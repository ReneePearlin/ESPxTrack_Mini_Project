let map, geofenceCircle, mapClickListener;

window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 13.0827, lng: 80.2707 }, // Chennai
    zoom: 13,
  });
};

window.activateGeofence = function () {
  alert("Click on the map to create a geofence (1 km radius).");

  if (geofenceCircle) geofenceCircle.setMap(null);
  if (mapClickListener) google.maps.event.removeListener(mapClickListener);

  mapClickListener = map.addListener("click", (event) => {
    const center = event.latLng;

    geofenceCircle = new google.maps.Circle({
      strokeColor: \"#FF0000\",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: \"#FF9999\",
      fillOpacity: 0.35,
      map,
      center,
      radius: 1000,
    });

    console.log(\"Geofence placed at:\", center.lat(), center.lng());

    google.maps.event.removeListener(mapClickListener);
  });
};

window.clearGeofence = function () {
  if (geofenceCircle) {
    geofenceCircle.setMap(null);
    geofenceCircle = null;
  }
  if (mapClickListener) {
    google.maps.event.removeListener(mapClickListener);
    mapClickListener = null;
  }
};

// Placeholder functions
window.liveTracking = function () {
  alert(\"Live tracking feature is under development.\");
};

window.showPastRoutes = function () {
  alert(\"Past routes feature is under development.\");
};

window.showNotifications = function () {
  alert(\"Notifications feature is under development.\");
};

window.logout = function () {
  window.location.href = \"index.html\";
};

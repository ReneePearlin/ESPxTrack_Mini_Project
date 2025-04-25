let map, geofenceCircle, mapClickListener;

document.addEventListener("DOMContentLoaded", function () {
  map = L.map("map").setView([13.0827, 80.2707], 13); // Chennai

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
});

window.activateGeofence = function () {
  alert("Click on the map to create a geofence (1 km radius).");

  if (geofenceCircle) map.removeLayer(geofenceCircle);
  if (mapClickListener) map.off("click", mapClickListener);

  mapClickListener = function (event) {
    const center = event.latlng;

    geofenceCircle = L.circle(center, {
      color: "#FF0000",
      fillColor: "#FF9999",
      fillOpacity: 0.35,
      radius: 1000,
    }).addTo(map);

    console.log("Geofence placed at:", center.lat, center.lng);

    map.off("click", mapClickListener); // Remove listener after one use
  };

  map.on("click", mapClickListener);
};

window.clearGeofence = function () {
  if (geofenceCircle) {
    map.removeLayer(geofenceCircle);
    geofenceCircle = null;
  }
  if (mapClickListener) {
    map.off("click", mapClickListener);
    mapClickListener = null;
  }
};

window.liveTracking = function () {
  alert("Live tracking feature is under development.");
};

window.showPastRoutes = function () {
  alert("Past routes feature is under development.");
};

window.showNotifications = function () {
  alert("Notifications feature is under development.");
};

window.logout = function () {
  window.location.href = "index.html";
};

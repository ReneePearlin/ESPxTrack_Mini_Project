const map = L.map('map').setView([12.8722, 80.2194], 13); // OMR region

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// Destination marker
const collegeMarker = L.marker([12.873, 80.222])
  .addTo(map)
  .bindPopup("St. Joseph’s Group of Colleges, OMR")
  .openPopup();

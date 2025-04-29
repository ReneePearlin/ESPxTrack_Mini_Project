const map = L.map('map').setView([12.8722, 80.2194], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([12.873, 80.222]).addTo(map).bindPopup("St. Joseph’s Group of Colleges").openPopup();

const dbRef = firebase.database().ref("buses");

function updateBusListAndMap(data) {
  document.getElementById("busList").innerHTML = "";
  Object.entries(data).forEach(([id, bus]) => {
    const li = document.createElement("li");
    li.innerText = `${bus.busNumber} - ${bus.route}`;
    li.onclick = () => showBusDetails(bus);
    document.getElementById("busList").appendChild(li);

    L.marker([bus.lat, bus.lng])
      .addTo(map)
      .bindPopup(`Bus ${bus.busNumber}<br>${bus.route}`);
  });
}

dbRef.on("value", snapshot => updateBusListAndMap(snapshot.val()));

function showBusDetails(bus) {
  document.getElementById("busDetails").innerHTML = `
    <h3>Bus ${bus.busNumber}</h3>
    <p>Route: ${bus.route}</p>
    <p>Location: [${bus.lat}, ${bus.lng}]</p>
    <p>Destination: St. Joseph’s Group of Colleges</p>
  `;
}

function searchBus() {
  const input = document.getElementById("busSearch").value;
  dbRef.once("value", snapshot => {
    const data = snapshot.val();
    for (const bus of Object.values(data)) {
      if (bus.busNumber === input) return showBusDetails(bus);
    }
    document.getElementById("busDetails").innerHTML = "Bus not found";
  });
}

function logout() {
  firebase.auth().signOut().then(() => location.href = "login.html");
}

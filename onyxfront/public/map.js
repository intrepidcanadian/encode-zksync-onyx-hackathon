let map;
let userMarker;
let markers = [];
let infoWindow; 

let userIcon = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 10,
  fillColor: "#00F",
  fillOpacity: 1,
  strokeWeight: 1
}; 

let walletIcon = {
  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
  scale: 5,
  fillColor: "#F00",
  fillOpacity: 1,
  strokeWeight: 1
};

function updateUserLocation() {
  if (!userMarker) return;

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(`Latitude: ${lat}, longitude: ${lng}`);

        const pos = { lat: lat, lng: lng };

        userMarker.setPosition(pos);
        map.setCenter(pos);                
        
      },
      function (error) {
        console.error("Error getting user location:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}



function fetchDataAndUpdateMarkers() {
  fetch("http://localhost:3002/data-endpoint")
    .then((response) => response.json())
    .then((data) => {
      markers.forEach(marker => marker.setMap(null));
      markers = [];

      for (const [walletAddress, location] of Object.entries(data)) {
        const latLng = { lat: parseFloat(location.lat), lng: parseFloat(location.lng) };
        const marker = new google.maps.Marker({
          map: map,
          position: latLng,
          title: walletAddress,
          icon: walletIcon,  
          opacity: 1.0,
        });

        marker.addListener("click", () => {
          const contentString = `
            <div style="color: black;">
              <p style="font-weight: bold;">Wallet Address: ${walletAddress}</p>
              <p style="font-weight: bold;">Latitude: ${latLng.lat}</p>
              <p style="font-weight: bold;">Longitude: ${latLng.lng}</p>
            </div>
          `;
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        markers.push(marker); 
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function initMap() {
  const pos = { lat: 43.669694, lng: -79.384963 }; 

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: pos,  
    mapId: "MAP_ID",
  });

  // userMarker = new google.maps.Marker({
  //   map: map,
  //   position: pos,
  //   title: "Current Location",
  //   icon: userIcon, 
  // });

  infoWindow = new google.maps.InfoWindow();

  updateUserLocation();
  fetchDataAndUpdateMarkers();

  setInterval(() => {
    updateUserLocation();
    fetchDataAndUpdateMarkers();
  }, 30 * 1000);
}

initMap();

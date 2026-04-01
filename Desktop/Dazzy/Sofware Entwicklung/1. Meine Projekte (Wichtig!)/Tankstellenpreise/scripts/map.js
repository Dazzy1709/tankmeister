import { fetchTankstellenData } from "./fetchTankstellen.js";
import { createTankstellenFigure, currentLogoLink, sliderValue, declareLogoLink } from "./index.js";
import { createMapRoute,isRouteActive } from "./createRoute.js";

export let map, currentUserLocation, infoWindow, tankstellenMarkers = [];
let watchId = null;

export async function initMap() {
  const loc = await getLoc();
  currentUserLocation = { lat: loc.lat, lng: loc.lng }

  //Loading in the google maps Javascript import library to use their tools//
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  //Init the map//
  const mapElement = document.getElementById("map");

  map = new google.maps.Map(mapElement, {
    center: { lat: currentUserLocation.lat, lng: currentUserLocation.lng },
    zoom: 13,
    mapId: "DEMO_MAP_ID"
  });

 infoWindow = new google.maps.InfoWindow({
    ariaLabel: "Uluru",
  });


  //Create the buttons for the Map //
  const locationButton = document.createElement("button");
  const tankFinderButton = document.createElement("button");

  function createMapButtons () {
    //Button for fetching Location//
    locationButton.textContent = "Standort Update";
    locationButton.classList.add("mein-standort-button");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
    locationButton);

    //button for fetcing location//
    tankFinderButton.textContent = "Tankstellen suchen";
    tankFinderButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
    tankFinderButton);
  }
  createMapButtons();
  


  //Create the icons for the map //
  const userLocationMarker = new AdvancedMarkerElement({
    map: map, position: currentUserLocation, title: "Du befindest dich hier!",
  });
  userLocationMarker.classList.add("marker");

  function createMapIcons () {
    //Marker bei dem akutellen standort erstellen und reinzoomen//
    const userLocationIcon = document.createElement("img");
    const userLocationPulse = document.createElement("div");
    userLocationIcon.classList.add("icon");
    userLocationPulse.classList.add("pulse")
    userLocationIcon.src = 'https://cdn-icons-png.flaticon.com/512/8361/8361110.png';

    userLocationMarker.append(userLocationIcon);
    userLocationMarker.append(userLocationPulse);
  }
  
  createMapIcons();


  
   watchId = watchLoc(
    (pos) => {
      // update marker position
      userLocationMarker.position = pos;
  
    },
    (err) => {
      console.error("Tracking error:", err);
    }
  );

  // Centre the user loc on screen and show infoMarker //
  function moveToUserLoc () {
  
    map.setCenter(currentUserLocation);
    map.setZoom(17);
  
    infoWindow.setPosition(currentUserLocation);
    infoWindow.setContent("Du befindest dich hier!");
    infoWindow.open(map, userLocationMarker); 
  }



  //Get the current user location upon clicking the update button//
  locationButton.addEventListener("click", async () => {
    try {
      moveToUserLoc();

    } catch (error) {
      console.error("Fehler beim Abrufen der Position:", error);
      handleLocationError(true, infoWindow, map.getCenter());
    }
  });


  async function getTankstellenData () {
    let tankstellenDaten;
    tankstellenDaten = await fetchTankstellenData(currentUserLocation.lat,currentUserLocation.lng, sliderValue);
  
    return tankstellenDaten;
  }


  function createTankstellenMarker (tankstelle) {
      //Erstelle einen Marker und grobe infobox mit name und preise für jede gefundene Tankstelle//
      tankstelle.forEach((station, index) => {
        const tankstellenMarker = new AdvancedMarkerElement({
          position: { lat: station.lat, lng: station.lng },
          map: map,
          title: station.name,
        });

        //Für jede gefunde tankstelle ein icon erstellen//
        const tankstellenLocationImg = document.createElement("img");
        tankstellenLocationImg.classList.add("tankstellen-icon");
        tankstellenLocationImg.src = 'https://cdn-icons-png.flaticon.com/512/1170/1170466.png';

       //Inhalt der infobox//
        const contentString = `
          <div class="info-box-tankstelle">
            <strong>${station.brand} Tankstelle</strong>
            <div class="address">
              📍 ${station.street} ${station.houseNumber}, ${station.postCode}
            </div>
            <div class="prices-container">
              <div class="price-item diesel">
                <div class="price-content">
                  <span class="price-label">⛽ Diesel</span>
                  <span class="price-value">${parseFloat(station.diesel).toFixed(2)}€</span>
                </div>
              </div>
              <div class="price-item e5">
                <div class="price-content">
                  <span class="price-label">⛽ Super E5</span>
                  <span class="price-value">${parseFloat(station.e5).toFixed(2)}€</span>
                </div>
              </div>
              <div class="price-item e10">
                <div class="price-content">
                  <span class="price-label">⛽ Super E10</span>
                  <span class="price-value">${parseFloat(station.e10).toFixed(2) || "/"}€</span>
                </div>
              </div>
            </div>
            
            <button class="start-route-btn" data-lat="${station.lat}" data-lng="${station.lng}">
              🚗 Route starten
            </button>
          </div>
        `;

        //Tankstellenmarker und inofbox content ins Array pushen//
        tankstellenMarkers.push({
          marker: tankstellenMarker,
          station: station,
          content: contentString
        });

        tankstellenMarker.append(tankstellenLocationImg);
        tankstellenMarker.classList.add("marker");


        if (index === 0 ) {
          infoWindow.setContent(contentString);  
          infoWindow.open(map, tankstellenMarker);
        }
        
        tankstellenMarker.addListener("gmp-click", () => {
          infoWindow.setContent(contentString);
          infoWindow.open(map, tankstellenMarker);

          google.maps.event.addListener(infoWindow, 'domready', () => {
            const btn = document.querySelector(".start-route-btn");
            if (btn && !btn.hasAttribute('data-listener')) {
              btn.setAttribute('data-listener', 'true');
              btn.addEventListener("click", async () => {
                const destination = {  
                  lat: station.lat, 
                  lng: station.lng
                };
                await createMapRoute(map, currentUserLocation, destination);
                if (isRouteActive) {
                  mapElement.toggleAttribute("route-active")
                }
                map.setCenter(currentUserLocation);
              });
            }
          });
        });
      });

       //Function to create a route upon clicking the button in the infoWindow//
       document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('start-route-btn')) {
          e.stopPropagation();
          const destination = {
            lat: parseFloat(e.target.dataset.lat),
            lng: parseFloat(e.target.dataset.lng)
          };
          await createMapRoute(map, currentUserLocation, destination);
          map.setCenter(currentUserLocation);
        }
      });
  }


  //Eventlistener für die Tankstellen suche//
  tankFinderButton.addEventListener("click", async () => {
    try {
      //Remove existing Tankstellen figures from tankstellen oin der nähe before initilising seaarch//
      const container = document.getElementById("tankstellenAuflistung");
      container.innerHTML = ''; 

      const tankstellen = await getTankstellenData();
      createTankstellenMarker(tankstellen);
      createTankstellenFigure(tankstellen);
  
      map.setCenter(currentUserLocation);
      map.setZoom(15);
      
    } catch (error) {
      console.error("Fehler beim Abrufen der Position:", error);
      handleLocationError(true, infoWindow, map.getCenter());
    };
  });
};

//Create a route to the location of the tankstelle //
function handleLocationError (browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

// Defining the function for getting the exact user location using navigator, returns promise //
export async function getLoc() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(pos);
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject("Geolocation not supported");
    }
  });
}

//Watch the user Location so that it gets tracked in real time //
function watchLoc(onUpdate, onError) {
  if (!navigator.geolocation) {
    onError("Geolocation not supported");
    return;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      onUpdate(pos);
    },
    (error) => {
      onError(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 3000,
    }
  );
}
import { map, currentUserLocation, tankstellenMarkers} from "./map.js";

export let currentLogoLink;

export function declareLogoLink (station) {

  switch (station.brand.toLowerCase()) {
    case "aral":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/commons/6/60/Aral_Logo.svg";
      break;
    case "famila":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/commons/e/eb/Famila-Logo_Bremke_%26_Hoerster.png";
      break;
    case "hem":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/de/1/10/HEM_Logo.jpg";
      break;
    case "oil!":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Logo_OIL%21.svg";
      break;
    case "shell":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/de/thumb/7/74/Royal_Dutch_Shell.svg/3840px-Royal_Dutch_Shell.svg.png";
      break;
    case "esso":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/commons/4/41/Esso_Logo.svg";
      break;
    case "totalenergies":
    case "total":
      currentLogoLink = "https://www.esyoil.com/benzinpreise/_sp-assets/img/totalenergies.e673e83.svg";
      break;
    case "jet":
      currentLogoLink = "https://de.wikipedia.org/wiki/Jet_%28Tankstelle%29#/media/Datei:Jet_logo_1997.svg";
      break;
    case "orlen":
      currentLogoLink = "https://mb.cision.com/Public/21236/logo/b8647e002a72cddd_org.jpg";
      break;
    case "star":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/commons/e/ed/Star_Tankstelle_Logo_2020.svg";
      break;
    case "avia":
      currentLogoLink = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/AVIA_International_logo.svg/3840px-AVIA_International_logo.svg.png";
      break;
    default:
      currentLogoLink = "https://cdn-icons-png.flaticon.com/512/846/846347.png"; 
      break;
  }

  return currentLogoLink;
}


//Create a figur for each Tankstelle that was found via the API call //
export async function createTankstellenFigure (tankstellen) {

  const container = document.getElementById("tankstellenAuflistung");
  tankstellen.forEach(station => {

    const diesel = station.diesel ? parseFloat(station.diesel).toFixed(2) :  "Preis Nicht vefügbar";
    const e5 = station.e5 ? parseFloat(station.e5).toFixed(2) :  "Preis Nicht vefügbar";
    const e10 = station.e10 ? parseFloat(station.e10).toFixed(2) :  "Preis Nicht vefügbar";

    // Determine logo based on brand
    declareLogoLink(station);

    // Create the figure element //
    const figure = document.createElement("figure");
    figure.style.border = "1px solid #ccc";
    figure.style.borderRadius = "8px";
    figure.style.padding = "10px";
  
    // Create content inside //
    figure.innerHTML = `
      <div class = "figure-head">
        <figcaption>
        <div class = "tankstellen-logo-container">
          <img src=${currentLogoLink} class="tankstellen-logo">
        </div>
        <span class="tankstellen-brand">${station.brand} </span>
        </figcaption>
        <small>
          ${station.street}<br> 
          ${station.postCode}
        </small>
      </div>
      <div class = "tankstellen-preise-container">
        <div class = "tankstellen-preis"><p><strong> ${diesel} €</strong>Diesel</p></div>
        <div class = "tankstellen-preis"><p><strong> ${e5} €</strong>Super e5</p></div>
        <div class = "tankstellen-preis"><p><strong> ${e10} €</strong>Super e10</p></div>
      </div>
    `;
  
    // Append figure to container //
    container.appendChild(figure);

    figure.addEventListener("click", () => {
      const destination = {  
        lat: station.lat, 
        lng: station.lng};
      
      // Find the corresponding marker for this station //
      const markerData = tankstellenMarkers.find(
        m => m.station.lat === station.lat && m.station.lng === station.lng
      );
      
      if (markerData && markerData.marker) {
        // Trigger the marker's click event programmatically //
        google.maps.event.trigger(markerData.marker, 'gmp-click');
      }

      map.setCenter(destination);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    })
  });
}

//Creates a slider for calculating the search
export let sliderValue = 1;
const slider = document.getElementById("tank-slider");

function createSlider () {
  const valueDisplay = document.getElementById("slider-value");
  const value = slider.value;
  valueDisplay.textContent = value;

  // Update the slider track color dynamically
  const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, 
    #4caf50 0%, 
    #2196f3 ${percentage * 0.5}%, 
    #ff9800 ${percentage}%, 
    #ccc ${percentage}%, 
    #ccc 100%)`;
    onSliderChange(value);
    sliderValue = value;
}

export function onSliderChange(value) {
  return value;
};

slider.addEventListener("input", () => {
  createSlider();
  createRadiusCircle();
});



//Circle for visualizing the search radius via google maps circle
let walkingCircle;
function createRadiusCircle () {

  const searchRadius = Number(sliderValue) * 1000;
  map.setZoom(searchRadius - (100 * sliderValue))

  if (!walkingCircle) {
    walkingCircle = new google.maps.Circle({
      strokeColor: '#555',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: '#555',
      fillOpacity: 0.35,
      map: map,
      center: currentUserLocation,
      radius: searchRadius ,
      draggable: false,
      editable: false,
    });
  }

  walkingCircle.setCenter(currentUserLocation);
  walkingCircle.setRadius(searchRadius);
  map.fitBounds(walkingCircle.getBounds());
}

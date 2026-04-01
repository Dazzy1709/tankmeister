// scripts/googleMapsLoader.js
import { config } from './config.js';

export function loadGoogleMapsAPI() {
  const apiKey = config.googleMapsApiKey;
  
  console.log('Loading Google Maps...');
  console.log('API Key available:', apiKey ? 'Yes' : 'No');
  
  if (!apiKey) {
    console.error('Google Maps API key is missing!');
    console.error('Make sure you have VITE_GOOGLE_MAPS_API_KEY in your .env file');
    return;
  }
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&solution_channel=GMP_CCS_geolocation_v2&callback=initMapCallback`;
  script.async = true;
  script.defer = true;
  
  window.initMapCallback = () => {
    console.log('Google Maps API loaded successfully!');
    import('./map.js').then(module => {
      if (module.initMap) {
        module.initMap();
      } else {
        console.error('initMap function not found in map.js');
      }
    }).catch(error => {
      console.error('Error loading map.js:', error);
    });
  };
  
  script.onerror = () => {
    console.error('Failed to load Google Maps API script');
  };
  
  document.head.appendChild(script);
}
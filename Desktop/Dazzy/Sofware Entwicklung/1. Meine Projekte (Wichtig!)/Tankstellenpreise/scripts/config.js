// scripts/config.js
export const config = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  tankerkoenigApiKey: import.meta.env.VITE_TANKERKÖNIG_API_KEY
};

console.log('Config loaded. GOOGLE API Key exists:', !!config.googleMapsApiKey);
console.log('Config loaded. TANKERKOENIG API Key exists:', !!config.googleMapsApiKey);
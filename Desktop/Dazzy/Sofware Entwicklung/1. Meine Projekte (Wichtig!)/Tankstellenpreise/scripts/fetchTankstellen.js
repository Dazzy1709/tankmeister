import { TankstellenObject } from "./tankstellenObj.js";
import { config } from "./config.js";

export const fetchTankstellenData = async (lat, long, rad) => {

  const apiKey = config.tankerkoenigApiKey;
  const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${long}&rad=${rad}&sort=dist&type=all&apikey=${apiKey}`;

  try {
    const response = await fetch(url);

    if(!response.ok) {
      throw new Error(`Response Status ${response.status}`)
    }

    const result = await response.json();
    let tankStations = result.stations.map(data => ({
      ...TankstellenObject,
      ...data
    }));
    
    return tankStations;

  } catch (error) {
    console.log(error)
  }
};




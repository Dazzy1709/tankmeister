# tankmeister
A web application that uses the Tankerkoenig API and Google Maps JavaScript API to locate nearby gas stations, display real-time fuel prices, and provide route navigation based on the user’s location. 


# ⛽ Fuel Finder App

A lightweight web application built with vanilla JavaScript that helps users find nearby gas stations, compare real-time fuel prices, and navigate to their preferred location using integrated mapping services.

---

## 📌 Features

* 📍 Automatically detects the user's current location
* ⛽ Displays nearby gas stations in real-time
* 💰 Shows up-to-date fuel prices from the Tankerkoenig API
* 🗺️ Interactive map powered by Google Maps
* 🚗 Route navigation to selected gas stations
* ⚡ Fast and responsive interface using vanilla JavaScript

---

## 🛠️ Tech Stack

* **Frontend:** Vanilla JavaScript, HTML, CSS
* **APIs:** Tankerkoenig API, Google Maps JavaScript API
* **Geolocation:** Browser Geolocation API

---

## 📦 Installation

Clone the repository:

```bash id="a1b2c3"
git clone https://github.com/your-username/fuel-finder-app.git
cd fuel-finder-app
```

---

## 🔑 Setup

1. Obtain an API key from Google Maps Platform
2. Get an API key from Tankerkoenig
3. Add your API keys to the project:

```javascript id="d4e5f6"
// config.js
const GOOGLE_MAPS_API_KEY = "your_key_here";
const TANKERKOENIG_API_KEY = "your_key_here";
```

---

## ▶️ Usage

Open the project in your browser:

```bash id="g7h8i9"
open index.html
```

Or use a local development server for best results.

---

## 📷 Screenshots

*(Add screenshots or a demo GIF here to showcase the app interface and features)*

---

## 📁 Project Structure

```id="j1k2l3"
fuel-finder-app/
│── index.html
│── styles/
│── scripts/
│── config.js
│── README.md
```

---

## 🧠 How It Works

* The app retrieves the user's location using the browser's Geolocation API
* It fetches nearby gas station data from the Tankerkoenig API
* Results are displayed on an interactive Google Map
* Users can view fuel prices and select a station
* The app generates a route to the selected location via Google Maps

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Your Name
GitHub: https://github.com/your-username

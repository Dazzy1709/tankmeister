# ⛽ Tankmeister

Eine Webanwendung, die die Tankerkoenig API und die Google Maps JavaScript API nutzt, um nahegelegene Tankstellen zu finden, aktuelle Kraftstoffpreise anzuzeigen und eine Routenführung basierend auf dem Standort des Nutzers bereitzustellen.

---

## 📌 Funktionen

* 📍 Erkennt automatisch den aktuellen Standort des Nutzers
* ⛽ Zeigt Tankstellen in der Nähe in Echtzeit an
* 💰 Liefert aktuelle Kraftstoffpreise über die Tankerkoenig API
* 🗺️ Interaktive Karte basierend auf Google Maps
* 🚗 Routenplanung zu ausgewählten Tankstellen
* ⚡ Schnelle und performante Oberfläche mit Vanilla JavaScript

---

## 🛠️ Technologie-Stack

* **Frontend:** Vanilla JavaScript, HTML, CSS
* **APIs:** Tankerkoenig API, Google Maps JavaScript API
* **Geolocation:** Browser Geolocation API

---

## 📦 Installation

Repository klonen:

```bash
git clone https://github.com/Dazzy1709/tankmeister.git
cd tankmeister
```

---

## 🔑 Einrichtung

1. Einen API-Key bei der Google Maps Platform erstellen
2. Einen API-Key bei Tankerkoenig beantragen
3. API-Keys im Projekt hinterlegen:

```javascript
// config.js
const GOOGLE_MAPS_API_KEY = "DEIN_API_KEY";
const TANKERKOENIG_API_KEY = "DEIN_API_KEY";
```

---

## ▶️ Nutzung

Projekt im Browser öffnen:

```bash
open index.html
```

Alternativ empfiehlt sich die Nutzung eines lokalen Entwicklungsservers.

---

## 📷 Screenshots

*(Hier Screenshots oder ein Demo-GIF der Anwendung einfügen)*

---

## 📁 Projektstruktur

```
tankmeister/
│── index.html
│── styles/
│── scripts/
│── config.js
│── README.md
```

---

## 🧠 Funktionsweise

* Die Anwendung ermittelt den Standort des Nutzers über die Geolocation API des Browsers
* Anschließend werden Tankstellendaten über die Tankerkoenig API abgerufen
* Die Ergebnisse werden auf einer interaktiven Google Maps Karte dargestellt
* Nutzer können Preise vergleichen und eine Tankstelle auswählen
* Für die gewählte Tankstelle wird eine Route über Google Maps berechnet

---

## 🤝 Mitwirken

Beiträge sind willkommen!

1. Repository forken
2. Neuen Branch erstellen (`feature/dein-feature`)
3. Änderungen committen
4. Branch pushen
5. Pull Request erstellen

---

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

---

## 👨‍💻 Autor

Dein Name
GitHub: https://github.com/Dazzy1709

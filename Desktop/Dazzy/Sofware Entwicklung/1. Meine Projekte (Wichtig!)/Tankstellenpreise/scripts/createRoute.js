import { map } from "./map.js";

export let distanceToTankstelle;
let hours, mins, secs;
export let timeToTankstelle = {
  hours,
  mins,
  secs
};

// Route state management
export let isRouteActive = false;
export let currentRouteData = null;
let routeStartCallback = null;

let routeInfoPanel = null;
let currentPolylines = [];
let directionsSidebar = null;
let currentDirectionsMarkers = [];
let currentStepIndex = 0;
let nextStepOverlay = null;
let currentRoute = null;
let isCreatingRoute = false;
let pendingRouteRequest = null;

// Helper functions
function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}min ${seconds}s`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}

function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

// German translations
const germanText = {
  routeInfo: {
    title: "🚗 Routeninformationen",
    distance: "Entfernung",
    duration: "Dauer",
    showDirections: "📍 Routenbeschreibung anzeigen",
    cancelRoute: "❌ Route abbrechen",
    error: "⚠️ Routenfehler"
  },
  directions: {
    title: "🗺️ Routenbeschreibung",
    summary: "📊 Zusammenfassung",
    nextStep: "⬆️ Nächster Schritt",
    reached: "✅ Sie haben Ihr Ziel erreicht!",
    prevStep: "◀ Vorheriger Schritt",
    nextStepBtn: "Nächster Schritt ▶",
    noDirections: "Keine detaillierte Routenbeschreibung verfügbar"
  },
  confirmations: {
    startTitle: "Route starten",
    startMessage: "Möchten Sie die Navigation zum ausgewählten Ziel starten?",
    startConfirm: "Ja, Route starten",
    startCancel: "Nein, abbrechen",
    cancelTitle: "Route abbrechen",
    cancelMessage: "Möchten Sie die aktuelle Route wirklich abbrechen? Alle Routendaten gehen verloren.",
    cancelConfirm: "Ja, Route abbrechen",
    cancelKeep: "Nein, Route behalten"
  },
  errors: {
    noRoutes: "Keine Route gefunden",
    calculationError: "Route konnte nicht berechnet werden"
  }
};

function createConfirmationPopup(title, message, confirmText, cancelText, onConfirm, onCancel) {
  const existingPopup = document.getElementById('confirmation-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  const popup = document.createElement('div');
  popup.id = 'confirmation-popup';

  
  const popupContent = document.createElement('div');
  popupContent.style.cssText = `

  `;
  
  popupContent.innerHTML = `

    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600; background: linear-gradient(135deg, #fff 0%, #aaa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${title}</h3>
      <p style="margin: 0; color: #b0b0b0; line-height: 1.6; font-size: 15px;">${message}</p>
    </div>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="popup-cancel">${cancelText}</button>
      <button id="popup-confirm">${confirmText}</button>
    </div>
  `;
  
  popup.appendChild(popupContent);
  document.body.appendChild(popup);
  
  const cancelBtn = document.getElementById('popup-cancel');
  const confirmBtn = document.getElementById('popup-confirm');
  
  if (cancelBtn) {
    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = 'rgba(255, 255, 255, 0.15)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    });
    cancelBtn.addEventListener('click', () => {
      popup.remove();
      if (onCancel) onCancel();
    });
  }
  
  if (confirmBtn) {
    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.transform = 'translateY(-2px)';
      confirmBtn.style.boxShadow = '0 6px 20px rgba(66, 133, 244, 0.4)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
    });
    confirmBtn.addEventListener('click', () => {
      popup.remove();
      if (onConfirm) onConfirm();
    });
  }
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
      if (onCancel) onCancel();
    }
  });
  
  return popup;
}

function createRouteInfoPanel() {
  if (routeInfoPanel) return routeInfoPanel;
  
  const panel = document.createElement("div");
  panel.id = "route-info-panel";
    

  document.body.appendChild(panel);
  routeInfoPanel = panel;
  return panel;
}

function createDirectionsSidebar() {
  if (directionsSidebar) {
    directionsSidebar.remove();
    directionsSidebar = null;
  }
  
  const sidebar = document.createElement("div");
  sidebar.id = "directions-sidebar";
  
  const header = document.createElement("div");
  header.id = "directions-sidebar-header";

  header.innerHTML = `
    <strong>${germanText.directions.title}</strong>
    <button id="close-sidebar">✕</button>
  `;
  
  const content = document.createElement("div");
  content.id = "directions-content";
  content.style.padding = "20px";
  
  sidebar.appendChild(header);
  sidebar.appendChild(content);
  document.body.appendChild(sidebar);
  
  directionsSidebar = sidebar;
  
  document.getElementById("close-sidebar")?.addEventListener("click", () => {
    sidebar.style.transform = "translateX(100%)";
    clearStepHighlights();
  });
  
  return { sidebar, content };
}

function clearStepHighlights() {
  if (currentDirectionsMarkers.length > 0) {
    currentDirectionsMarkers.forEach(marker => marker.setMap(null));
    currentDirectionsMarkers = [];
  }
  currentStepIndex = 0;
}

function removeNextStepOverlay() {
  if (nextStepOverlay) {
    nextStepOverlay.remove();
    nextStepOverlay = null;
  }
}

function createNextStepOverlay(stepInstruction, stepDistance, stepIndex, totalSteps) {
  removeNextStepOverlay();
  
  const overlay = document.createElement("div");
  overlay.id = "next-step-overlay";
  
  overlay.innerHTML = `
    <div style="background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%); border-radius: 40px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">
      ${stepIndex + 1}
    </div>
    <div style="display: flex; flex-direction: column;">
      <div style="font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Nächste Anweisung (${stepIndex + 1}/${totalSteps})</div>
      <div style="font-weight: 600; font-size: 15px;">${stepInstruction || "Geradeaus weiterfahren"}</div>
    </div>
    ${stepDistance ? `<div style="background: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 40px; font-size: 13px; font-weight: 500;">
      📏 ${formatDistance(stepDistance)}
    </div>` : ''}
    <button id="close-next-step-overlay" style="
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 30px;
      width: 32px;
      height: 32px;
      color: white;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    ">✕</button>
  `;
  
  document.body.appendChild(overlay);
  nextStepOverlay = overlay;
  
  document.getElementById("close-next-step-overlay")?.addEventListener("click", (e) => {
    e.stopPropagation();
    removeNextStepOverlay();
  });
  
  setTimeout(() => {
    if (nextStepOverlay) {
      nextStepOverlay.style.opacity = "0";
      setTimeout(() => removeNextStepOverlay(), 300);
    }
  }, 8000);
}

function highlightStep(stepElement, index) {
  const allSteps = document.querySelectorAll('.direction-step');
  allSteps.forEach(step => {
    step.style.background = 'rgba(255, 255, 255, 0.05)';
    step.style.borderLeft = 'none';
  });
  
  if (stepElement) {
    stepElement.style.background = 'rgba(66, 133, 244, 0.2)';
    stepElement.style.borderLeft = '3px solid #4285f4';
  }
}

function updateNextStepDisplay(steps, currentIndex) {
  const nextStepInfo = document.getElementById('next-step-info');
  
  if (currentIndex < steps.length) {
    const nextStep = steps[currentIndex];
    
    if (nextStepInfo) {
      nextStepInfo.innerHTML = `
        <div class="next-step-card">
          <div style="font-size: 12px; opacity: 0.7; margin-bottom: 6px;">${germanText.directions.nextStep}</div>
          <div style="font-weight: 600; margin-bottom: 6px;">${nextStep.instruction || "Geradeaus weiterfahren"}</div>
          ${nextStep.distanceMeters ? `<div style="font-size: 11px; color: #888;">📏 ${formatDistance(nextStep.distanceMeters)}</div>` : ''}
        </div>
      `;
    }
    
    createNextStepOverlay(
      nextStep.instruction,
      nextStep.distanceMeters,
      currentIndex,
      steps.length
    );
  } else {
    if (nextStepInfo) {
      nextStepInfo.innerHTML = `
        <div class="next-step-card" style="background: rgba(76, 175, 80, 0.2); border-left-color: #4caf50;">
          <div style="font-weight: 600; color: #4caf50;">${germanText.directions.reached}</div>
        </div>
      `;
    }
    removeNextStepOverlay();
  }
}

function createNavigationControls(steps, content, sidebar) {
  const existingControls = document.getElementById('navigation-controls');
  if (existingControls) {
    existingControls.remove();
  }
  
  const navControls = document.createElement('div');
  navControls.id = 'navigation-controls';
  navControls.className = 'nav-controls';
  
  navControls.innerHTML = `
    <div id="next-step-info"></div>
    <div class="nav-buttons">
      <button id="prev-step" class="nav-btn nav-btn-prev">◀ ${germanText.directions.prevStep}</button>
      <button id="next-step" class="nav-btn nav-btn-next">${germanText.directions.nextStepBtn}</button>
    </div>
  `;
  
  content.insertBefore(navControls, content.firstChild);
  
  const prevButton = document.getElementById('prev-step');
  const nextButton = document.getElementById('next-step');
  
  const existingStepsContainer = document.getElementById('steps-container');
  if (existingStepsContainer) {
    existingStepsContainer.remove();
  }
  
  const stepsContainer = document.createElement('div');
  stepsContainer.id = 'steps-container';
  
  const stepElements = [];
  
  steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'direction-step';
    
    stepDiv.innerHTML = `
      <div style="display: flex; gap: 12px;">
        <div class="step-number">${index + 1}</div>
        <div style="flex: 1;">
          <div class="step-instruction">${step.instruction || "Geradeaus weiterfahren"}</div>
          <div class="step-meta">
            ${step.distanceMeters ? `<span>📏 ${formatDistance(step.distanceMeters)}</span>` : ''}
            ${step.durationMillis ? `<span>⏱️ ${formatDuration(step.durationMillis)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
    
    stepDiv.addEventListener('click', () => {
      currentStepIndex = index;
      highlightStep(stepDiv, index);
      updateNextStepDisplay(steps, currentStepIndex);
      
      if (step.startLocation) {
        map.panTo(step.startLocation);
        map.setZoom(16);
      }
    });
    
    stepsContainer.appendChild(stepDiv);
    stepElements.push(stepDiv);
  });
  
  content.appendChild(stepsContainer);
  
  const navigateStep = (delta) => {
    const newIndex = currentStepIndex + delta;
    if (newIndex >= 0 && newIndex < steps.length) {
      currentStepIndex = newIndex;
      highlightStep(stepElements[currentStepIndex], currentStepIndex);
      updateNextStepDisplay(steps, currentStepIndex);
      
      stepElements[currentStepIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      if (steps[currentStepIndex].startLocation) {
        map.panTo(steps[currentStepIndex].startLocation);
        map.setZoom(16);
      }
    }
  };
  
  if (prevButton) {
    const newPrevButton = prevButton.cloneNode(true);
    prevButton.parentNode.replaceChild(newPrevButton, prevButton);
    newPrevButton.addEventListener('click', () => navigateStep(-1));
  }
  
  if (nextButton) {
    const newNextButton = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    newNextButton.addEventListener('click', () => navigateStep(1));
  }
  
  if (steps.length > 0) {
    currentStepIndex = 0;
    highlightStep(stepElements[0], 0);
    updateNextStepDisplay(steps, 0);
  }
}

export function clearRoute(showConfirmation = true) {
  if (showConfirmation && isRouteActive) {
    createConfirmationPopup(
      germanText.confirmations.cancelTitle,
      germanText.confirmations.cancelMessage,
      germanText.confirmations.cancelConfirm,
      germanText.confirmations.cancelKeep,
      () => {
        executeClearRoute();
      },
      () => {
        console.log('Route cancellation aborted');
      }
    );
  } else {
    executeClearRoute();
  }
}

function executeClearRoute() {
  if (currentPolylines.length > 0) {
    currentPolylines.forEach(polyline => {
      if (polyline && polyline.setMap) {
        polyline.setMap(null);
      }
    });
    currentPolylines = [];
  }
  
  currentRoute = null;
  clearStepHighlights();
  removeNextStepOverlay();
  
  if (routeInfoPanel) {
    routeInfoPanel.style.display = "none";
    routeInfoPanel.innerHTML = "";
  }
  
  if (directionsSidebar) {
    directionsSidebar.remove();
    directionsSidebar = null;
  }
  
  hours = undefined;
  mins = undefined;
  secs = undefined;
  distanceToTankstelle = undefined;
  timeToTankstelle = { hours, mins, secs };
  
  const wasActive = isRouteActive;
  isRouteActive = false;
  currentRouteData = null;
  
  if (wasActive && routeStartCallback) {
    routeStartCallback(false, null);
  }
}

export function onRouteStart(callback) {
  routeStartCallback = callback;
}

export function getCurrentRouteData() {
  return currentRouteData;
}

export async function createMapRoute(map, originLatLng, destinationLatLng) {
  pendingRouteRequest = { map, originLatLng, destinationLatLng };
  
  createConfirmationPopup(
    germanText.confirmations.startTitle,
    germanText.confirmations.startMessage,
    germanText.confirmations.startConfirm,
    germanText.confirmations.startCancel,
    async () => {
      await executeCreateMapRoute(pendingRouteRequest.map, pendingRouteRequest.originLatLng, pendingRouteRequest.destinationLatLng);
      pendingRouteRequest = null;
    },
    () => {
      console.log('Route creation cancelled');
      pendingRouteRequest = null;
    }
  );
}

async function executeCreateMapRoute(map, originLatLng, destinationLatLng) {
  if (isCreatingRoute) {
    console.log("Route creation already in progress, please wait...");
    return null;
  }
  
  try {
    isCreatingRoute = true;
    executeClearRoute();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { Route } = await google.maps.importLibrary("routes");
    
    const request = {
      origin: originLatLng,
      destination: destinationLatLng,
      travelMode: google.maps.TravelMode.DRIVING,
      routingPreference: "TRAFFIC_AWARE",
      extraComputations: ["TRAFFIC_ON_POLYLINE"],
      fields: ["durationMillis", "distanceMeters", "path", "legs"]
    };

    const response = await Route.computeRoutes(request);
    
    if (!response.routes || response.routes.length === 0) {
      console.error("No routes found");
      return null;
    }
    
    const route = response.routes[0];
    currentRoute = route;
    
    const meter = route.distanceMeters;
    const totalSeconds = route.durationMillis / 1000;
    const routeData = {
      id: Date.now(),
      origin: originLatLng,
      destination: destinationLatLng,
      distance: {
        meters: meter,
        formatted: formatDistance(meter)
      },
      duration: {
        milliseconds: route.durationMillis,
        seconds: totalSeconds,
        formatted: formatDuration(route.durationMillis)
      },
      timestamp: new Date().toISOString(),
      steps: route.legs && route.legs[0] ? route.legs[0].steps : []
    };
    
    currentRouteData = routeData;
    
    const polylines = route.createPolylines();
    polylines.forEach((polyline) => {
      polyline.setMap(map);
      currentPolylines.push(polyline);
    });
    
    hours = Math.floor(totalSeconds / 3600);
    mins = Math.floor((totalSeconds % 3600) / 60);
    secs = Math.floor(totalSeconds % 60);
    timeToTankstelle = { hours, mins, secs };
    distanceToTankstelle = meter > 1000 ? (meter / 1000).toFixed(2) : meter;
    
    const panel = createRouteInfoPanel();
    panel.innerHTML = `
      <div class="route-panel-header">
        <span class="route-panel-title">${germanText.routeInfo.title}</span>
        <button id="close-route-panel" class="route-panel-close">✕</button>
      </div>
      <div class="route-stats">
        <div class="route-stat">
          <div class="route-stat-label">${germanText.routeInfo.distance}</div>
          <div class="route-stat-value">${formatDistance(meter)}</div>
        </div>
        <div class="route-stat">
          <div class="route-stat-label">${germanText.routeInfo.duration}</div>
          <div class="route-stat-value">${formatDuration(route.durationMillis)}</div>
        </div>
      </div>
      <div class="route-buttons">
        <button id="show-turn-by-turn" class="route-btn-primary">
          📍 ${germanText.routeInfo.showDirections}
        </button>
        <button id="cancel-route-button" class="route-btn-danger">
          ❌ ${germanText.routeInfo.cancelRoute}
        </button>
      </div>
    `;
    panel.style.display = "block";
    
    const closePanelBtn = document.getElementById("close-route-panel");
    if (closePanelBtn) {
      const newCloseBtn = closePanelBtn.cloneNode(true);
      closePanelBtn.parentNode.replaceChild(newCloseBtn, closePanelBtn);
      newCloseBtn.addEventListener("click", () => {
        clearRoute(true);
      });
    }
    
    const cancelBtn = document.getElementById("cancel-route-button");
    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      newCancelBtn.addEventListener("click", () => {
        clearRoute(true);
      });
    }
    
    const showDirectionsBtn = document.getElementById("show-turn-by-turn");
    if (showDirectionsBtn) {
      const newDirectionsBtn = showDirectionsBtn.cloneNode(true);
      showDirectionsBtn.parentNode.replaceChild(newDirectionsBtn, showDirectionsBtn);
      newDirectionsBtn.addEventListener("click", () => {
        if (currentRoute && currentRoute.legs && currentRoute.legs[0] && currentRoute.legs[0].steps) {
          const steps = currentRoute.legs[0].steps;
          const { sidebar, content } = createDirectionsSidebar();
          
          content.innerHTML = '';
          
          const summary = document.createElement('div');
          summary.className = 'summary-card';
          summary.innerHTML = `
            <strong style="display: block; margin-bottom: 8px;">${germanText.directions.summary}</strong>
            <div style="font-size: 13px; opacity: 0.8;">📏 ${formatDistance(meter)} • ⏱️ ${formatDuration(currentRoute.durationMillis)}</div>
          `;
          content.appendChild(summary);
          
          createNavigationControls(steps, content, sidebar);
          
          sidebar.style.transform = "translateX(0)";
        } else {
          console.warn("No step-by-step directions available");
          alert(germanText.directions.noDirections);
        }
      });
    }
    
    isRouteActive = true;
    
    if (routeStartCallback) {
      routeStartCallback(true, routeData);
    }
    
    if (route.viewport) {
      map.fitBounds(route.viewport);
    }
    
    return polylines;
    
  } catch (error) {
    console.error("Error calculating route:", error);
    
    const panel = createRouteInfoPanel();
    panel.innerHTML = `
      <div class="route-panel-header">
        <span class="route-panel-title" style="color: #dc3545;">${germanText.routeInfo.error}</span>
        <button id="close-route-panel" class="route-panel-close">✕</button>
      </div>
      <div style="padding: 20px; color: #ccc;">
        ${germanText.errors.calculationError}: ${error.message}
      </div>
      <div class="route-buttons">
        <button id="cancel-route-button" class="route-btn-danger">
          ❌ ${germanText.routeInfo.cancelRoute}
        </button>
      </div>
    `;
    panel.style.display = "block";
    
    const closeBtn = document.getElementById("close-route-panel");
    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener("click", () => {
        clearRoute(true);
      });
    }
    
    const cancelBtn = document.getElementById("cancel-route-button");
    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      newCancelBtn.addEventListener("click", () => {
        clearRoute(true);
      });
    }
    
    return null;
  } finally {
    isCreatingRoute = false;
  }
}
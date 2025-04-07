// Enhanced map functionality for EV-Hub
document.addEventListener("DOMContentLoaded", () => {
  // Mock providerData if it's not defined (for testing purposes)
  if (typeof providerData === "undefined") {
    console.warn("providerData is not defined. Using mock data for testing.")
    var providerData = [] // Or some default data
  }

  // Mock navigationData if it's not defined (for testing purposes)
  if (typeof navigationData === "undefined") {
    console.warn("navigationData is not defined. Using mock data for testing.")
    var navigationData = {
      startLat: 18.5204,
      startLng: 73.8567,
      endLat: 18.55,
      endLng: 73.9,
    } // Or some default data
  }

  // Provider map initialization with clustering
  function initProviderMap(providers) {
    if (!document.getElementById("provider-map")) return

    var map = L.map("provider-map").setView([18.5204, 73.8567], 13)

    // Add dark-themed map tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: "map-tiles-dark",
    }).addTo(map)

    // Add custom CSS for dark theme
    var style = document.createElement("style")
    style.innerHTML = `
            .map-tiles-dark {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
            .provider-popup .leaflet-popup-content-wrapper {
                background-color: #212529;
                color: #fff;
                border-radius: 8px;
            }
            .provider-popup .leaflet-popup-tip {
                background-color: #212529;
            }
            .provider-popup-btn {
                background-color: #4CAF82;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 8px;
            }
            .provider-popup-btn:hover {
                background-color: #3d8c68;
            }
            .provider-marker-icon {
                background-color: #4CAF82;
                border-radius: 50%;
                text-align: center;
                color: white;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .provider-marker-icon i {
                margin-top: 8px;
            }
        `
    document.head.appendChild(style)

    if (providers && providers.length) {
      // Create a marker cluster group for better performance with many markers
      var markers = L.markerClusterGroup({
        iconCreateFunction: (cluster) =>
          L.divIcon({
            html:
              '<div class="provider-marker-icon" style="width: 40px; height: 40px;"><span>' +
              cluster.getChildCount() +
              "</span></div>",
            className: "",
            iconSize: [40, 40],
          }),
      })

      var bounds = []

      providers.forEach((provider) => {
        // Create custom marker icon
        var markerIcon = L.divIcon({
          html: '<div class="provider-marker-icon" style="width: 30px; height: 30px;"><i class="fas fa-bolt"></i></div>',
          className: "",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        var marker = L.marker([provider.latitude, provider.longitude], {
          icon: markerIcon,
        })

        // Create popup with provider info
        var popupContent = `
                    <div class="p-3">
                        <h5 class="mb-2">${provider.name}</h5>
                        <div class="mb-2">
                            <i class="fas fa-dollar-sign text-success me-1"></i> ₹${provider.price}/hr
                        </div>
                        <div class="mb-2">
                            ${Array(5)
                              .fill(0)
                              .map((_, i) =>
                                i < Math.floor(provider.rating)
                                  ? '<i class="fas fa-star text-warning"></i>'
                                  : '<i class="far fa-star text-warning"></i>',
                              )
                              .join("")}
                        </div>
                        <a href="/providers/${provider.id}/" class="provider-popup-btn">View Details</a>
                    </div>
                `

        var popup = L.popup({
          className: "provider-popup",
        }).setContent(popupContent)

        marker.bindPopup(popup)
        markers.addLayer(marker)

        bounds.push([provider.latitude, provider.longitude])
      })

      map.addLayer(markers)

      if (bounds.length > 1) {
        map.fitBounds(bounds)
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 15)
      }
    }

    return map
  }

  // Provider location picker with search functionality
  function initLocationPicker() {
    if (!document.getElementById("location-picker-map")) return

    var map = L.map("location-picker-map").setView([18.5204, 73.8567], 13)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: "map-tiles-dark",
    }).addTo(map)

    var marker

    // Check if we already have coordinates
    var latField = document.getElementById("id_latitude")
    var lngField = document.getElementById("id_longitude")
    var addressField = document.getElementById("id_address")

    if (latField.value && lngField.value) {
      var lat = Number.parseFloat(latField.value)
      var lng = Number.parseFloat(lngField.value)
      marker = L.marker([lat, lng]).addTo(map)
      map.setView([lat, lng], 15)
    }

    // Add search control
    var searchControl = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: "Search for address...",
      geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          countrycodes: "in", // Limit to India
          limit: 5,
        },
      }),
    })
      .on("markgeocode", (e) => {
        var bbox = e.geocode.bbox
        var poly = L.polygon([bbox.getSouthEast(), bbox.getNorthEast(), bbox.getNorthWest(), bbox.getSouthWest()])

        map.fitBounds(poly.getBounds())

        if (marker) {
          map.removeLayer(marker)
        }

        var latlng = e.geocode.center
        marker = L.marker(latlng).addTo(map)

        // Update form fields
        latField.value = latlng.lat.toFixed(6)
        lngField.value = latlng.lng.toFixed(6)

        // Update address field if it exists
        if (addressField && !addressField.value) {
          addressField.value = e.geocode.name
        }
      })
      .addTo(map)

    map.on("click", (e) => {
      if (marker) {
        map.removeLayer(marker)
      }

      marker = L.marker(e.latlng).addTo(map)

      // Update form fields
      latField.value = e.latlng.lat.toFixed(6)
      lngField.value = e.latlng.lng.toFixed(6)

      // Reverse geocode to get address
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (addressField && !addressField.value && data.display_name) {
            addressField.value = data.display_name
          }
        })
        .catch((error) => console.error("Error:", error))
    })

    return map
  }

  // Navigation map for directions
  function initNavigationMap(startLat, startLng, endLat, endLng) {
    if (!document.getElementById("navigation-map")) return

    var map = L.map("navigation-map").setView(
      [
        (Number.parseFloat(startLat) + Number.parseFloat(endLat)) / 2,
        (Number.parseFloat(startLng) + Number.parseFloat(endLng)) / 2,
      ],
      13,
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: "map-tiles-dark",
    }).addTo(map)

    // Add markers for start and end points
    var startIcon = L.divIcon({
      html: '<div style="background-color: #4CAF82; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    var endIcon = L.divIcon({
      html: '<div style="background-color: #dc3545; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    var startMarker = L.marker([startLat, startLng], { icon: startIcon }).addTo(map)
    var endMarker = L.marker([endLat, endLng], { icon: endIcon }).addTo(map)

    // Draw a line between the points
    var routeLine = L.polyline(
      [
        [startLat, startLng],
        [endLat, endLng],
      ],
      {
        color: "#4CAF82",
        weight: 4,
        opacity: 0.7,
        dashArray: "10, 10",
        lineJoin: "round",
      },
    ).addTo(map)

    // Fit map to show both points
    var bounds = L.latLngBounds([
      [startLat, startLng],
      [endLat, endLng],
    ])
    map.fitBounds(bounds, { padding: [50, 50] })

    return map
  }

  // Initialize maps when the page loads
  if (document.getElementById("provider-map") && typeof providerData !== "undefined") {
    initProviderMap(providerData)
  }

  // Location picker map
  if (document.getElementById("location-picker-map")) {
    initLocationPicker()
  }

  // Navigation map
  if (document.getElementById("navigation-map") && typeof navigationData !== "undefined") {
    initNavigationMap(navigationData.startLat, navigationData.startLng, navigationData.endLat, navigationData.endLng)
  }
})


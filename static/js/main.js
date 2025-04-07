// Initialize tooltips
document.addEventListener("DOMContentLoaded", () => {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
})

// Provider map initialization
function initProviderMap(providers) {
  if (!document.getElementById("provider-map")) return

  var map = L.map("provider-map").setView([18.5204, 73.8567], 13)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  if (providers && providers.length) {
    var bounds = []

    providers.forEach((provider) => {
      var marker = L.marker([provider.latitude, provider.longitude])
        .addTo(map)
        .bindPopup(
          "<strong>" +
            provider.name +
            "</strong><br>" +
            "Price: ₹" +
            provider.price +
            "/hr<br>" +
            "Rating: " +
            provider.rating +
            "/5<br>" +
            '<a href="/providers/' +
            provider.id +
            '/" class="btn btn-sm btn-success mt-2">View Details</a>',
        )

      bounds.push([provider.latitude, provider.longitude])
    })

    if (bounds.length > 1) {
      map.fitBounds(bounds)
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15)
    }
  }

  return map
}

// Provider location picker
function initLocationPicker() {
  if (!document.getElementById("location-picker-map")) return

  var map = L.map("location-picker-map").setView([18.5204, 73.8567], 13)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  var marker

  // Check if we already have coordinates
  var latField = document.getElementById("id_latitude")
  var lngField = document.getElementById("id_longitude")

  if (latField.value && lngField.value) {
    var lat = Number.parseFloat(latField.value)
    var lng = Number.parseFloat(lngField.value)
    marker = L.marker([lat, lng]).addTo(map)
    map.setView([lat, lng], 15)
  }

  map.on("click", (e) => {
    if (marker) {
      map.removeLayer(marker)
    }

    marker = L.marker(e.latlng).addTo(map)

    // Update form fields
    latField.value = e.latlng.lat.toFixed(6)
    lngField.value = e.latlng.lng.toFixed(6)
  })

  return map
}

// Initialize maps when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Provider list map
  if (document.getElementById("provider-map") && typeof providerData !== "undefined") {
    initProviderMap(providerData)
  }

  // Location picker map
  if (document.getElementById("location-picker-map")) {
    initLocationPicker()
  }
})


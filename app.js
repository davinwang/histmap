// Initialize map with geolocation
navigator.geolocation.getCurrentPosition(position => {
    const map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 5);
    
    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    loadHistoricalEvents(map);
}, error => {
    console.warn('Geolocation failed, using default coordinates:', error);
    // Fallback to default coordinates
    const map = L.map('map').setView([30.0586, 114.3480], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    loadHistoricalEvents(map);
});

function loadHistoricalEvents(map) {

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Load historical events data
    fetch('historical_events.json')
        .then(response => response.json())
        .then(events => {
            events.forEach(event => {
                const marker = L.marker(event.coordinates)
                    .addTo(map)
                    .bindPopup(`<b>${event.name}</b><br>${event.date}`);

                // Add mouse interaction events
                marker.on('mouseover', function() {
                    console.log(`Marker mouseover: ${event.name}`);
                    this.openPopup();
                });
                marker.on('mouseout', function() {
                    console.log(`Marker mouseout: ${event.name}`);
                    this.closePopup();
                });
            });
        })
        .catch(error => console.error('数据加载失败:', error));
}
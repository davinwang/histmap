// Initialize map with geolocation
const loadingSpinner = document.querySelector('.loading-spinner');
loadingSpinner.style.display = 'block';

Promise.all([
    new Promise((resolve) => navigator.geolocation.getCurrentPosition(resolve,
        () => resolve({ coords: { latitude: 30.0586, longitude: 114.3480 } }))
    ),
    fetch('historical_events.json').then(r => r.json())
]).then(([position, events]) => {
    const map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 5);

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    loadHistoricalEvents(map, events);
    loadingSpinner.style.display = 'none';
}).catch(error => {
    console.error('初始化失败:', error);
    loadingSpinner.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', setupSlider);

function setupSlider() {
    const slider = document.querySelector('.slider');
    const thumbFrom = document.getElementById('yearFrom');
    const thumbTo = document.getElementById('yearTo');
    let isDragging = false;
    let currentThumb = null;

    function startDrag(e) {
        isDragging = true;
        currentThumb = e.target;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        const rect = slider.getBoundingClientRect();
        let newLeft = (e.clientX - rect.left) / rect.width * 100;
        newLeft = Math.max(0, Math.min(newLeft, 100));
        currentThumb.style.left = `${newLeft}%`;
    }

    function stopDrag() {
        isDragging = false;
        currentThumb = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }

    thumbFrom.addEventListener('mousedown', startDrag);
    thumbTo.addEventListener('mousedown', startDrag);
}

function loadHistoricalEvents(map) {

    // Load historical events data
    fetch('historical_events.json')
        .then(response => response.json())
        .then(events => {
            function formatDate(event) {
                let year = event.year;
                let dateStr = year < 0 ? `公元前${Math.abs(year)}年` : `${year}年`;

                if (event.month) {
                    dateStr += ` ${event.month}月`;
                    if (event.day) {
                        dateStr += `${event.day}日`;
                    }
                }
                return dateStr;
            }

            events.forEach(event => {
                const marker = L.marker(event.coordinates)
                    .addTo(map)
                    .bindPopup(`<b>${event.event}</b><br>${formatDate(event)}<br>人物：${event.figure}<br>描述：${event.description}<br><a href='${event.wikipedia}' target='_blank'>维基百科</a>`);

                // Add mouse interaction events
                marker.on('mouseover', function () {
                    console.log(`Marker mouseover: ${event.event}`);
                    this.openPopup();
                });
                marker.on('mouseout', function () {
                    console.log(`Marker mouseout: ${event.event}`);
                    this.closePopup();
                });
            });
        })
        .catch(error => console.error('数据加载失败:', error));
}
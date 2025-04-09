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
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    loadHistoricalEvents(map, events);
    loadingSpinner.style.display = 'none';
}).catch(error => {
    console.error('初始化失败:', error);
    loadingSpinner.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', setupSlider);

function formatYear(year) {
    return year < 0 ? `公元前${Math.abs(year)}年` : `公元${year}年`;
}

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
        
        // Update percentage display
        const currentYear = new Date().getFullYear();
        const minYear = -10000;
        const year = Math.round(minYear + (currentYear - minYear) * newLeft / 100);
        
        if (currentThumb === thumbFrom) {
            document.getElementById('yearFrom').textContent = formatYear(year);
        } else {
            document.getElementById('yearTo').textContent = formatYear(year);
        }
    }

    function stopDrag() {
        isDragging = false;
        currentThumb = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        
        // Update range display when dragging stops
        const currentYear = new Date().getFullYear();
        const minYear = -10000;
        const fromPercent = parseFloat(document.getElementById('yearFrom').style.left);
        const toPercent = parseFloat(document.getElementById('yearTo').style.left);
        const fromYear = Math.round(minYear + (currentYear - minYear) * fromPercent / 100);
        const toYear = Math.round(minYear + (currentYear - minYear) * toPercent / 100);
        document.getElementById('yearRange').textContent = `${formatYear(fromYear)} - ${formatYear(toYear)}`;
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
                let dateStr = formatYear(year);

                if (event.month) {
                    dateStr += `${event.month}月`;
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
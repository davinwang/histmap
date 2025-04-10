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

    // 初始化地图后添加图层控制
    const baseLayers = {
      'Esri': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
      }),
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }),
      'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
      })
    };
    
    baseLayers.Esri.addTo(map);
    
    L.control.layers(baseLayers).addTo(map);

    // 绑定下拉菜单事件
    document.getElementById('map-service').addEventListener('change', function(e) {
        const selectedLayer = e.target.value;
        Object.values(baseLayers).forEach(layer => {
          if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        baseLayers[selectedLayer].addTo(map);
      });
    
// 添加数据源切换事件监听
    document.getElementById('data-source').addEventListener('change', function() {
        const source = this.value;
        const center = map.getCenter();
        
        if (source === 'local') {
        // 加载本地JSON数据
        loadHistoricalEvents(map);
        } else if (source === 'mongodb') {
        // 调用MongoDB查询API
        fetchMongoDBEvents(center.lat, center.lng);
        } else if (source === 'elasticsearch') {
        // 调用Elasticsearch查询API
        fetchElasticsearchEvents(center.lat, center.lng);
        }
    });
    
    // 首次加载时自动触发本地数据加载
    document.getElementById('data-source').dispatchEvent(new Event('change'));
    // loadingSpinner.style.display = 'none';
}).catch(error => {
    console.error('初始化失败:', error);
    // loadingSpinner.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', setupSlider);

// 引入公共函数
const script = document.createElement('script');
script.src = 'common.js';
document.head.appendChild(script);



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


  
// MongoDB查询函数
function fetchMongoDBEvents(lat, lng) {
fetch(`/api/mongodb?lat=${lat}&lng=${lng}`)
    .then(response => response.json())
    .then(data => {
    updateMapWithEvents(data);
    });
}

// Elasticsearch查询函数
function fetchElasticsearchEvents(lat, lng) {
fetch(`/api/elasticsearch?lat=${lat}&lng=${lng}`)
    .then(response => response.json())
    .then(data => {
    updateMapWithEvents(data);
    });
}

function updateMapWithEvents(events, map = window.map) {
    // 清除现有标记
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // 添加新标记
    events.forEach(event => {
        const marker = L.marker(event.coordinates)
            .addTo(map)
            .bindPopup(`<b>${event.event}</b><br>${formatYear(event.year)}<br>人物：${event.figure}<br>描述：${event.description}<br><a href='${event.wikipedia}' target='_blank'>维基百科</a>`);

        marker.on('mouseover', function() {
            this.openPopup();
        });
        marker.on('mouseout', function() {
            this.closePopup();
        });
    });
}
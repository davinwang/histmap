
import { formatYear } from './common.js';

export function loadHistoricalEvents(map) {

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
export function fetchMongoDBEvents(lat, lng) {
fetch(`/api/mongodb?lat=${lat}&lng=${lng}`)
    .then(response => response.json())
    .then(data => {
    updateMapWithEvents(data);
    });
}

// Elasticsearch查询函数
export function fetchElasticsearchEvents(lat, lng) {
fetch(`/api/elasticsearch?lat=${lat}&lng=${lng}`)
    .then(response => response.json())
    .then(data => {
    updateMapWithEvents(data);
    });
}

export function updateMapWithEvents(events, map = window.map) {
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
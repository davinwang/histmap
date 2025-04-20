
import { formatYear, getDynastyColor } from './common.js';

export function loadHistoricalEvents(map, lat = null, lon = null, distance = null, yearFrom = null, yearTo = null) {

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

            events.filter(event => {
                if (yearFrom !== null && event.year < yearFrom) return false;
                if (yearTo !== null && event.year > yearTo) return false;
                return true;
            })
                .forEach(event => {
                    const marker = L.marker(event.coordinates, {
                        icon: L.divIcon({
                            html: `<div class="dynasty-marker" style="--dynasty-color: ${getDynastyColor(event.dynasty)}"></div>`,
                            className: 'dynasty-marker',
                            iconSize: [25, 41]
                        })
                    })
                        .addTo(map)
                        .bindPopup(`<b>${event.event}</b><br>${formatDate(event)}<br>人物：${event.figure}<br>描述：${event.description}<br><a href='${event.wikipedia}' target='_blank'>维基百科</a>`);

                    // Add mouse interaction events
                    marker.on('mouseover', function () {
                        console.log(`Marker mouseover: ${event.event}`);
                        this.openPopup();
                    });
                    // leave the marker open when the mouse is over it
                    // marker.on('mouseout', function () {
                    //     console.log(`Marker mouseout: ${event.event}`);
                    //     this.closePopup();
                    // });
                });
        })
        .catch(error => console.error('数据加载失败:', error));
}

// MongoDB查询函数
export function fetchMongoDBEvents(lat = null, lon = null, distance = null, yearFrom = null, yearTo = null) {
    fetch(`/api/mongodb?lat=${lat}&lon=${lon}&yearFrom=${yearFrom}&yearTo=${yearTo}`)
        .then(response => response.json())
        .then(data => {
            updateMapWithEvents(data);
        });
}

// Elasticsearch查询函数
export function fetchElasticsearchEvents(lat = null, lon = null, distance = null, yearFrom = null, yearTo = null) {
    fetch(`/api/elasticsearch?lat=${lat}&lon=${lon}&yearFrom=${yearFrom}&yearTo=${yearTo}`)
        .then(response => response.json())
        .then(data => {
            updateMapWithEvents(data);
        });
}

// 修复 window.map 不存在的问题，将默认值改为 null，由调用者确保传入有效的 map 对象
export function updateMapWithEvents(events, map = null) {
    // 清除现有标记
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // 添加新标记
    events
        .filter(event => {
            if (yearFrom !== null && event.year < yearFrom) return false;
            if (yearTo !== null && event.year > yearTo) return false;
            return true;
        })
        .forEach(event => {
            const marker = L.marker(event.coordinates)
                .addTo(map)
                .bindPopup(`<b>${event.event}</b><br>${formatYear(event.year)}<br>人物：${event.figure}<br>描述：${event.description}<br><a href='${event.wikipedia}' target='_blank'>维基百科</a>`);

            marker.on('mouseover', function () {
                this.openPopup();
            });
            marker.on('mouseout', function () {
                this.closePopup();
            });
        });
}
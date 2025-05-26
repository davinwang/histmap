
import { CURRENT_LANGUAGE, formatYear, getDynastyColor } from './common.js';

export function loadHistoricalEvents(map, lat = null, lon = null, distance = null, yearFrom = null, yearTo = null) {
    // Add event listener for language changes
    document.addEventListener('languageChanged', () => {
        loadHistoricalEvents(map, lat, lon, distance, yearFrom, yearTo);
    });

    // Clear existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Load historical events data
    const getCentury = year => {
      if (year === 0) return 0;
      const century = Math.floor((Math.abs(year) - 1) / 100) + 1;
      return year > 0 ? century : -century;
    };

    // 根据现有文件设置默认范围
    const minCentury = yearFrom !== null ? getCentury(yearFrom) : -9;
    const maxCentury = yearTo !== null ? getCentury(yearTo) : 20;
    const centuries = Array.from(
      {length: maxCentury - minCentury + 1},
      (_, i) => minCentury + i
    );

    Promise.all(centuries.map(c => 
      fetch(`historical_events.${c}.${CURRENT_LANGUAGE}.json`)
        .then(res => res.ok ? res.json() : [])
        .catch(error => {
          console.error('部分世纪数据加载失败:', error);
          return [];
        })
    ))
    .then(centuryEvents => {
      const events = centuryEvents.flat();
      function formatDate(hist_event) {
          let year = hist_event.year;
          let dateStr = formatYear(year);

          if (hist_event.month) {
              dateStr += `${hist_event.month}月`;
              if (hist_event.day) {
                  dateStr += `${hist_event.day}日`;
              }
          }
          return dateStr;
      }

      events.filter(hist_event => {
          if (yearFrom !== null && hist_event.year < yearFrom) return false;
          if (yearTo !== null && hist_event.year > yearTo) return false;
          return true;
      })
          .forEach(hist_event => {
              const marker = L.marker(hist_event.coordinates, {
                  icon: L.divIcon({
                      html: `<div class="dynasty-marker" style="--dynasty-color: ${getDynastyColor(hist_event.dynasty)}"></div>`,
                      className: 'dynasty-marker',
                      iconSize: [25, 41],
                      iconAnchor: [12.5, 41],
                      popupAnchor: [0, -41]
                  })
              })
                  .addTo(map)
                  .bindPopup(`<b>${hist_event.event}</b><br>${formatDate(hist_event)}<br>人物：${hist_event.figure}<br>描述：${hist_event.description}<br><a href='${hist_event.wikipedia}' target='_blank'>维基百科</a>`);

              // Add mouse interaction events
              marker.on('mouseover', function () {
                  console.log(`Marker mouseover: ${hist_event.event}`);
                  this.openPopup();
              });
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
export function updateMapWithEvents(hist_events, map = null) {
    // 清除现有标记
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // 添加新标记
    hist_events
        .filter(hist_event => {
            if (yearFrom !== null && hist_event.year < yearFrom) return false;
            if (yearTo !== null && hist_event.year > yearTo) return false;
            return true;
        })
        .forEach(hist_event => {
            const marker = L.marker(hist_event.coordinates)
                .addTo(map)
                .bindPopup(`<b>${hist_event.event}</b><br>${formatYear(hist_event.year)}<br>人物：${hist_event.figure}<br>描述：${hist_event.description}<br><a href='${hist_event.wikipedia}' target='_blank'>维基百科</a>`);

            marker.on('mouseover', function () {
                this.openPopup();
            });
            marker.on('mouseout', function () {
                this.closePopup();
            });
        });
}
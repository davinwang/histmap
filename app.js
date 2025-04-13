
import { setupSlider } from './slider.js';
import { loadHistoricalEvents, fetchMongoDBEvents, fetchElasticsearchEvents } from './load_events.js';

// Initialize map with geolocation
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
  document.getElementById('map-service').addEventListener('change', function (e) {
    const selectedLayer = e.target.value;
    Object.values(baseLayers).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    baseLayers[selectedLayer].addTo(map);
  });

  // 添加数据源切换事件监听
  document.getElementById('data-source').addEventListener('change', function () {
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

  // Listen for year range changes and filter events
  document.addEventListener('yearRangeChanged', (e) => {
    const { fromYear, toYear } = e.detail;
    const markers = document.querySelectorAll('.leaflet-marker-icon');
    markers.forEach(marker => {
      const year = parseInt(marker.dataset.year);
      if (year >= fromYear && year <= toYear) {
        marker.style.display = '';
      } else {
        marker.style.display = 'none';
      }
    });

    // Reload events when year range changes
    if (document.getElementById('data-source').value === 'local') {
      loadHistoricalEvents(map, null, null, null, fromYear, toYear);
    }
  });
}).catch(error => {
  console.error('初始化失败:', error);
});

document.addEventListener('DOMContentLoaded', setupSlider);


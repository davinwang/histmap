// 初始化地图
const map = L.map('map').setView([30.0586, 114.3480], 5);

// 添加OpenStreetMap底图
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 加载历史事件数据
fetch('historical_events.json')
    .then(response => response.json())
    .then(events => {
        events.forEach(event => {
            const marker = L.marker(event.coordinates)
                .addTo(map)
                .bindPopup(`<b>${event.name}</b><br>${event.date}`);

            // 添加鼠标交互事件
            marker.on('mouseover', function() {
                this.openPopup();
            });
            marker.on('mouseout', function() {
                this.closePopup();
            });
        });
    })
    .catch(error => console.error('数据加载失败:', error));
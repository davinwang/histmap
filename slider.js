import { formatYear, percentToYear, yearToPercent, getDynastyColor } from './common.js';


// 滑块功能模块
export function setupSlider() {
    // 添加朝代标签
    const slider = document.querySelector('.slider');
    fetch('historical_spans.json')
        .then(response => response.json())
        .then(historicalSpans => {
            historicalSpans.forEach(dynasty => {
                const startPercent = yearToPercent(dynasty.start_year);
                const endPercent = yearToPercent(dynasty.end_year);
                const width = endPercent - startPercent;

                const label = document.createElement('div');
                label.className = 'dynasty-label';
                label.style.left = `${startPercent}%`;
                label.style.width = `${width}%`;
                label.style.backgroundColor = getDynastyColor(dynasty.dynasty);
                label.textContent = dynasty.dynasty;

                slider.appendChild(label);
            });
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
                const year = percentToYear(newLeft);

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
                const fromPercent = parseFloat(document.getElementById('yearFrom').style.left);
                const toPercent = parseFloat(document.getElementById('yearTo').style.left);
                const fromYear = percentToYear(fromPercent);
                const toYear = percentToYear(toPercent);
                console.log('滑块释放事件触发', {
                    fromPercent,
                    toPercent,
                    fromYear,
                    toYear
                });
                document.getElementById('yearRange').textContent = `(${formatYear(fromYear)} - ${formatYear(toYear)})`;

                // Dispatch custom event with year range
                const event = new CustomEvent('yearRangeChanged', {
                    detail: { fromYear, toYear }
                });
                document.dispatchEvent(event);
            }

            thumbFrom.addEventListener('mousedown', startDrag);
            thumbTo.addEventListener('mousedown', startDrag);
        })
        .catch(error => console.error('数据加载失败:', error));
}
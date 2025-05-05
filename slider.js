import { formatYear, percentToYear, yearToPercent, getDynastyColor } from './common.js';


// 滑块功能模块
export function setupSlider() {
    // 添加朝代标签
    fetch('historical_spans.json')
        .then(response => response.json())
        .then(historicalSpans => {
            // 最多处理5组数据
            historicalSpans.slice(0, 5).forEach((civilization, index) => {
                const slider = document.getElementById(`slider${index}`);
                if (!slider) return;
                
                // 添加civilization名称标签
                const civLabel = document.createElement('div');
                civLabel.className = 'civilization-label';
                civLabel.textContent = civilization.civilization;
                slider.appendChild(civLabel);

                civilization.spans.forEach(dynasty => {
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

                // 添加滑块点击事件
                slider.addEventListener('click', (e) => {
                    const rect = slider.getBoundingClientRect();
                    const clickPercent = (e.clientX - rect.left) / rect.width * 100;

                    // 查找点击位置对应的朝代
                    const clickedDynasty = civilization.spans.find(dynasty => {
                        const start = yearToPercent(dynasty.start_year);
                        const end = yearToPercent(dynasty.end_year);
                        return clickPercent >= start && clickPercent <= end;
                    });

                    if (clickedDynasty) {
                        // 更新滑块位置
                        const startPercent = yearToPercent(clickedDynasty.start_year);
                        const endPercent = yearToPercent(clickedDynasty.end_year);

                        thumbFrom.style.left = `${startPercent}%`;
                        thumbTo.style.left = `${endPercent}%`;

                        // 更新显示文本
                        document.getElementById('yearFrom').textContent = formatYear(clickedDynasty.start_year);
                        document.getElementById('yearTo').textContent = formatYear(clickedDynasty.end_year);
                        document.getElementById('yearRange').textContent = `(${formatYear(clickedDynasty.start_year)} - ${formatYear(clickedDynasty.end_year)})`;

                        // 触发自定义事件
                        const event = new CustomEvent('yearRangeChanged', {
                            detail: {
                                fromYear: clickedDynasty.start_year,
                                toYear: clickedDynasty.end_year
                            }
                        });
                        document.dispatchEvent(event);
                    }
                });
            });

            // 添加滑块拖动功能
            const thumbFrom = document.getElementById('yearFrom');
            const thumbTo = document.getElementById('yearTo');
            let isDragging = false;
            let currentThumb = null;


            function startDrag(e) {
                isDragging = true;
                currentThumb = e.target;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                document.addEventListener('touchmove', drag);
                document.addEventListener('touchend', stopDrag);
            }

            function drag(e) {
                if (!isDragging) return;
                const container = document.querySelector('.slider-container');
                const rect = container.getBoundingClientRect();
                const clientX = e.clientX || e.touches[0].clientX;
                let newLeft = (clientX - rect.left) / rect.width * 100;
                newLeft = Math.max(0, Math.min(newLeft, 100));
                currentThumb.style.left = `${newLeft}%`;

                // Update percentage display
                const year = percentToYear(newLeft);

                if (currentThumb === thumbFrom) {
                    document.getElementById('yearFrom').textContent = formatYear(year);
                } else {
                    document.getElementById('yearTo').textContent = formatYear(year);
                }

                // Update year range display during dragging
                const fromPercent = parseFloat(thumbFrom.style.left);
                const toPercent = parseFloat(thumbTo.style.left);
                const fromYear = percentToYear(fromPercent);
                const toYear = percentToYear(toPercent);
                document.getElementById('yearRange').textContent = `(${formatYear(fromYear)} - ${formatYear(toYear)})`;
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
            thumbFrom.addEventListener('touchstart', startDrag);
            thumbTo.addEventListener('touchstart', startDrag);


        })
        .catch(error => console.error('数据加载失败:', error));
}
import { formatYear } from './common.js';

// 滑块功能模块
export function setupSlider() {
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
        console.log('滑块释放事件触发', {
            fromPercent,
            toPercent,
            fromYear,
            toYear
        });
        document.getElementById('yearRange').textContent = `(${formatYear(fromYear)} - ${formatYear(toYear)})`;
    }

    thumbFrom.addEventListener('mousedown', startDrag);
    thumbTo.addEventListener('mousedown', startDrag);
}
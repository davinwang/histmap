import { formatYear, percentToYear, yearToPercent, getDynastyColor } from './common.js';


// Function to set up the slider with data
function addDynastyTooltipEvents(label, dynasty) {
    // Mouseover event
    label.addEventListener('mouseover', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'dynasty-tooltip';
        tooltip.innerHTML = `
            <strong>${dynasty.dynasty}</strong><br>
            开始年份: ${formatYear(dynasty.start_year)}<br>
            结束年份: ${formatYear(dynasty.end_year)}<br>
            ${dynasty.description || '暂无描述'}<br>
        `;
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY - 90}px`;
        document.body.appendChild(tooltip);

        // Remove tooltip when mouse leaves the label
        label.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
    });

    // Touch events for mobile
    label.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const tooltip = document.createElement('div');
        tooltip.className = 'dynasty-tooltip';
        tooltip.innerHTML = `
            <strong>${dynasty.dynasty}</strong><br>
            开始年份: ${formatYear(dynasty.start_year)}<br>
            结束年份: ${formatYear(dynasty.end_year)}<br>
            ${dynasty.description || '暂无描述'}<br>
        `;
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${touch.clientX + 10}px`;
        tooltip.style.top = `${touch.clientY - 90}px`;
        document.body.appendChild(tooltip);

        // Add touch end event
        const removeTooltip = () => {
            tooltip.remove();
            document.removeEventListener('touchend', removeTooltip);
        };
        document.addEventListener('touchend', removeTooltip);
    });
}

export function setupSliderWithData(historicalSpans) {
    // Process all available civilizations
    historicalSpans.forEach((civilization, index) => {
        const sliderContainer = document.getElementById('sliders-container');
        const slider = document.createElement('div');
        slider.className = 'slider';
        slider.id = `slider${index}`;
        sliderContainer.insertBefore(slider, document.getElementById('yearFrom'));

        // Add navigation buttons if needed
        if (civilization.drillup) {
            const backBtn = document.createElement('button');
            backBtn.className = 'nav-btn back-btn';
            backBtn.innerHTML = '&lt;';
            backBtn.addEventListener('click', () => {
                fetch(civilization.drillup.replace('.json', `.${document.getElementById('language').value || 'zh'}.json`)).catch(() => fetch(civilization.drillup))
                    .then(response => response.json())
                    .then(data => refreshSliderContainer(data));
            });
            slider.appendChild(backBtn);
        }

        // Add civilization name label
        const civLabel = document.createElement('div');
        civLabel.className = 'civilization-label';
        civLabel.textContent = civilization.civilization;
        slider.appendChild(civLabel);

        if (civilization.drilldown) {
            const eyeBtn = document.createElement('button');
            eyeBtn.className = 'nav-btn eye-btn';
            eyeBtn.innerHTML = '👁';
            eyeBtn.addEventListener('click', () => {
                fetch(civilization.drilldown.replace('.json', `.${document.getElementById('language').value || 'zh'}.json`)).catch(() => fetch(civilization.drilldown))
                    .then(response => response.json())
                    .then(data => refreshSliderContainer(data));
            });
            slider.appendChild(eyeBtn);
        }

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

            // Add mouseover and touch events
            addDynastyTooltipEvents(label, dynasty);
            slider.appendChild(label);
        });

        // Add click and double-click events (same as original)
    });

    // Add slider drag functionality (same as original)
    const thumbFrom = document.getElementById('yearFrom');
    const thumbTo = document.getElementById('yearTo');
    let isDragging = false;
    let currentThumb = null;

    // Rest of drag functionality (same as original)
}

function addNavigationEvents(slider, civilization) {
    // Double-click for drilldown
    slider.addEventListener('dblclick', (e) => {
        if (civilization.drilldown) {
            fetch(civilization.drilldown.replace('.json', `.${document.getElementById('language').value || 'zh'}.json`)).catch(() => fetch(civilization.drilldown))
                .then(response => response.json())
                .then(data => {
                    // Clear existing sliders
                    document.getElementById('sliders-container').innerHTML =
                        '<div class="thumb" id="yearFrom" style="left: 0%;"></div>' +
                        '<div class="thumb" id="yearTo" style="left: 100%;"></div>';
                    // Recreate sliders with new data
                    setupSliderWithData(data);
                })
                .catch(error => console.error('Drilldown data loading failed:', error));
        }
    });

    // Right-click for drillup
    slider.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (civilization.drillup) {
            fetch(civilization.drillup.replace('.json', `.${document.getElementById('language').value || 'zh'}.json`)).catch(() => fetch(civilization.drillup))
                .then(response => response.json())
                .then(data => refreshSliderContainer(data)).catch(error => console.error('Drillup data loading failed:', error));
        }
    })
}

export function setupSlider() {
    // Add slider drag functionality (same as original)
    fetch(`historical_spans.${document.getElementById('language').value || 'zh'}.json`).catch(() => fetch('historical_spans.json'))
        .then(response => response.json())
        .then(historicalSpans => {
            // Process all available civilizations
            historicalSpans.forEach((civilization, index) => {
                const sliderContainer = document.getElementById('sliders-container');
                const slider = document.createElement('div');
                slider.className = 'slider';
                slider.id = `slider${index}`;
                sliderContainer.insertBefore(slider, document.getElementById('yearFrom'));

                // Add civilization name label
                const civLabel = document.createElement('div');
                civLabel.className = 'civilization-label';
                civLabel.textContent = civilization.civilization;
                slider.appendChild(civLabel);

                // Add eye button if drilldown available
                if (civilization.drilldown) {
                    const eyeBtn = document.createElement('button');
                    eyeBtn.className = 'nav-btn eye-btn';
                    eyeBtn.innerHTML = '👁';
                    eyeBtn.addEventListener('click', () => {
                        fetch(civilization.drilldown.replace('.json', `.${document.getElementById('language').value || 'zh'}.json`)).catch(() => fetch(civilization.drilldown))
                            .then(response => response.json())
                            .then(data => refreshSliderContainer(data));
                    });
                    slider.appendChild(eyeBtn);
                }

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

                    // Add mouseover event to each dynasty label
                    label.addEventListener('mouseover', (e) => {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'dynasty-tooltip';
                        tooltip.innerHTML = `
                            <strong>${dynasty.dynasty}</strong><br>
                            开始年份: ${formatYear(dynasty.start_year)}<br>
                            结束年份: ${formatYear(dynasty.end_year)}<br>
                            ${dynasty.description || '暂无描述'}<br>
                        `;
                        tooltip.style.position = 'absolute';
                        tooltip.style.left = `${e.clientX + 10}px`;
                        tooltip.style.top = `${e.clientY - 90}px`;
                        document.body.appendChild(tooltip);

                        // Remove tooltip when mouse leaves the label
                        label.addEventListener('mouseleave', () => {
                            tooltip.remove();
                        });
                    });

                    // Add touch events for mobile
                    label.addEventListener('touchstart', (e) => {
                        const touch = e.touches[0];
                        const tooltip = document.createElement('div');
                        tooltip.className = 'dynasty-tooltip';
                        tooltip.innerHTML = `
                            <strong>${dynasty.dynasty}</strong><br>
                            开始年份: ${formatYear(dynasty.start_year)}<br>
                            结束年份: ${formatYear(dynasty.end_year)}<br>
                            ${dynasty.description || '暂无描述'}<br>
                        `;
                        tooltip.style.position = 'absolute';
                        tooltip.style.left = `${touch.clientX + 10}px`;
                        tooltip.style.top = `${touch.clientY - 90}px`;
                        document.body.appendChild(tooltip);

                        // Add touch end event
                        const removeTooltip = () => {
                            tooltip.remove();
                            document.removeEventListener('touchend', removeTooltip);
                        };
                        document.addEventListener('touchend', removeTooltip);
                    });

                    slider.appendChild(label);
                });

                // Add navigation events
                addNavigationEvents(slider, civilization);

                // Add double-click events
                slider.addEventListener('dblclick', (e) => {
                    if (civilization.drilldown) {
                        fetch(civilization.drilldown.replace('.json', `.${document.getElementById('language').value || 'zh'}.json`)).catch(() => fetch(civilization.drilldown))
                            .then(response => response.json())
                            .then(data => {
                                // Clear existing sliders
                                document.getElementById('sliders-container').innerHTML =
                                    '<div class="thumb" id="yearFrom" style="left: 0%;"></div>' +
                                    '<div class="thumb" id="yearTo" style="left: 100%;"></div>';
                                // Recreate sliders with new data
                                setupSliderWithData(data);
                            })
                            .catch(error => console.error('Drilldown data loading failed:', error));
                    }
                });

                slider.addEventListener('click', (e) => {
                    const rect = slider.getBoundingClientRect();
                    const clickPercent = (e.clientX - rect.left) / rect.width * 100;

                    // Find the clicked dynasty
                    const clickedDynasty = civilization.spans.find(dynasty => {
                        const start = yearToPercent(dynasty.start_year);
                        const end = yearToPercent(dynasty.end_year);
                        return clickPercent >= start && clickPercent <= end;
                    });

                    if (clickedDynasty) {
                        // Update slider thumbs
                        const startPercent = yearToPercent(clickedDynasty.start_year);
                        const endPercent = yearToPercent(clickedDynasty.end_year);

                        thumbFrom.style.left = `${startPercent}%`;
                        thumbTo.style.left = `${endPercent}%`;

                        // Update year range display
                        // document.getElementById('yearFrom').textContent = formatYear(clickedDynasty.start_year);
                        // document.getElementById('yearTo').textContent = formatYear(clickedDynasty.end_year);
                        document.getElementById('yearRange').textContent = `(${formatYear(clickedDynasty.start_year)} - ${formatYear(clickedDynasty.end_year)})`;

                        // Dispatch custom event with year range
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

            // Add slider drag functionality (same as original)
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
                    // document.getElementById('yearFrom').textContent = formatYear(year);
                } else {
                    // document.getElementById('yearTo').textContent = formatYear(year);
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

function refreshSliderContainer(data) {
    const container = document.getElementById('sliders-container');
    container.innerHTML =
        '<div class="thumb" id="yearFrom"></div>' +
        '<div class="thumb" id="yearTo"></div>';
    setupSliderWithData(data);
}
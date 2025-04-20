export function formatYear(year) {
    return year < 0 ? `公元前${Math.abs(year)}年` : `公元${year}年`;
}

export function percentToYear(percent) {
    const currentYear = new Date().getFullYear();
    return Math.round(-5000 + (currentYear + 5000) * percent / 100);
}

export function yearToPercent(year) {
    const currentYear = new Date().getFullYear();
    return Math.round((year + 5000) / (currentYear + 5000) * 100);
}

// Generate color from dynasty name hash
export function getDynastyColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 60%)`;
}

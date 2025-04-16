export function formatYear(year) {
    return year < 0 ? `公元前${Math.abs(year)}年` : `公元${year}年`;
}

export function percentToYear(percent) {
    const currentYear = new Date().getFullYear();
    return Math.round(-10000 + (currentYear + 10000) * percent / 100);
}

export function yearToPercent(year) {
    const currentYear = new Date().getFullYear();
    return Math.round((year + 10000) / (currentYear + 10000) * 100);
}

var START_YEAR = -4000;

export function formatYear(year) {
    return year < 0 ? `公元前${Math.abs(year)}年` : `公元${year}年`;
}

export function percentToYear(percent) {
    const currentYear = new Date().getFullYear();
    return Math.round(START_YEAR + (currentYear - START_YEAR) * percent / 100);
}

export function yearToPercent(year) {
    const currentYear = new Date().getFullYear();
    return Math.round((year - START_YEAR) / (currentYear - START_YEAR) * 100);
}

// Generate color from dynasty name hash
/**
 * Generates a consistent color from dynasty name for visualization
 * Uses HSL color model with:
 * - Hue derived from name hash (0-360)
 * - Fixed saturation (70%)
 * - Darker lightness (40%) for better contrast with white text
 */
export function getDynastyColor(name) {
    let hash = 0;
    // Generate hash from name characters
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Convert hash to hue angle (0-360)
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 40%)`;
}

/**
 * Calculates geodetic distance and formats it per design requirements:
 * - Under 1km: returns rounded meters without decimals (e.g., { value: "450", unit: "m" })
 * - Over 1km: returns kilometers with max 1 decimal place (e.g., { value: "2.4", unit: "km" })
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): { value: string; unit: string } | null => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 1000);
        return { value: `${meters}`, unit: 'm' };
    }

    // Standardize to 1 decimal place. Remove trailing zero if it's a whole number (e.g. 2.0 -> 2)
    const formattedKm = parseFloat(distanceKm.toFixed(1)).toString();
    return { value: formattedKm, unit: 'km' };
};
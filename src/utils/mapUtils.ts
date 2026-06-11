const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_BASE_URL = "https://overpass-api.de/api/interpreter";

/**
 * Calculates the Haversine distance between two points in meters.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Fetches an address string from coordinates using Photon (Komoot).
 */
export const fetchAddressFromCoords = async (lng: number, lat: number): Promise<string> => {
    try {
        const response = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
        const data = await response.json();
        if (data.features?.length > 0) {
            const p = data.features[0].properties;
            return `${p.name || ''} ${p.street || ''}, ${p.city || ''}`.trim() || "Unknown Location";
        }
    } catch (e) {
        console.error("Reverse Geocoding Error:", e);
    }
    return "Unknown Location";
};

/**
 * Primary search using Overpass API.
 */
export const fetchPlacesOverpass = async (bbox: string) => {
    const query = `[out:json][timeout:10];(node["amenity"~"restaurant|cafe"](${bbox});way["amenity"~"restaurant|cafe"](${bbox}););out center 40;`;

    const response = await fetch(OVERPASS_BASE_URL, {
        method: 'POST',
        body: query
    });

    if (!response.ok) throw new Error("Overpass Error");

    const data = await response.json();
    return (data.elements || []).map((item: any) => ({
        id: `ov-${item.id}`,
        coordinate: [item.lon || item.center.lon, item.lat || item.center.lat],
        name: item.tags.name || "Unnamed Place",
    }));
};

/**
 * Fallback search using Nominatim API.
 */
export const fetchPlacesNominatim = async (viewbox: string) => {
    const url = `${NOMINATIM_BASE_URL}?format=json&q=restaurant&viewbox=${viewbox}&bounded=1&limit=20`;

    const response = await fetch(url, {
        headers: { 'User-Agent': 'MyMapApp/1.0' }
    });

    if (!response.ok) throw new Error("Nominatim Error");

    const data = await response.json();
    return data.map((item: any) => ({
        id: `nom-${item.place_id}`,
        coordinate: [parseFloat(item.lon), parseFloat(item.lat)],
        name: item.display_name.split(',')[0],
    }));
};

/**
 * Recursively finds the first [lon, lat] pair in a nested array
 */
const flattenToFirstPoint = (arr: any): number[] | null => {
    if (!Array.isArray(arr)) return null;
    // If the first element is a number, we've found our [lon, lat]
    if (typeof arr[0] === 'number') return arr;
    // Otherwise, keep digging deeper
    return flattenToFirstPoint(arr[0]);
};

export const getCenterCoordinate = (coord: any): { lon: number; lat: number } => {
    if (!coord || !Array.isArray(coord)) return { lon: 0, lat: 0 };

    // 1. Handle the triple-nesting: [[[lon, lat], ...]]
    // We want the array that contains the actual points
    let actualPoints = coord;
    while (Array.isArray(actualPoints[0]) && typeof actualPoints[0][0] !== 'number') {
        actualPoints = actualPoints[0];
    }

    // 2. If it's a Polygon/Array of points, calculate centroid
    if (Array.isArray(actualPoints[0]) && typeof actualPoints[0][0] === 'number') {
        let lon = 0;
        let lat = 0;
        actualPoints.forEach((p: number[]) => {
            lon += p[0] || 0;
            lat += p[1] || 0;
        });
        return {
            lon: lon / actualPoints.length,
            lat: lat / actualPoints.length
        };
    }

    // 3. If it's just a simple [lon, lat]
    if (typeof actualPoints[0] === 'number') {
        return { lon: actualPoints[0], lat: actualPoints[1] };
    }

    return { lon: 0, lat: 0 };
};
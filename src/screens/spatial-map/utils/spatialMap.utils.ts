import {ExpenseDetailsBasicResponse} from "@/src/api/dto/expense/expense";
import {PlaceSource} from "@/src/api/dto/constants";
import {
    HeatPoint,
    MapDateRange,
    PlaceAgg,
    ScopeMode,
} from "../types/spatialMap.types";

/**
 * Calculates distance between two coordinates in meters using the Haversine formula.
 */
export function getDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function expenseDayKey(expenseDate: string): string {
    return expenseDate.includes('T') ? expenseDate.split('T')[0] : expenseDate.slice(0, 10);
}

/**
 * Filters raw expenses by scope and inclusive date range.
 * dateRange null = no date bound (all mock dates).
 */
export function filterExpenses(
    expenses: ExpenseDetailsBasicResponse[],
    options: {
        scopeMode: ScopeMode;
        selectedTripId: number | string | null;
        dateRange: MapDateRange;
    }
): ExpenseDetailsBasicResponse[] {
    const {scopeMode, selectedTripId, dateRange} = options;
    const targetTripId = selectedTripId != null ? Number(selectedTripId) : null;

    return expenses.filter((exp) => {
        if (!exp.place || exp.place.geo?.latitude == null || exp.place.geo?.longitude == null) {
            return false;
        }

        if (scopeMode === "trip") {
            if (targetTripId == null) return false;
            if (exp.memory?.id == null) return false;
            if (Number(exp.memory.id) !== targetTripId) return false;
        } else if (exp.memory) {
            return false;
        }

        if (dateRange) {
            const day = expenseDayKey(exp.expense_date);
            if (day < dateRange.startDate || day > dateRange.endDate) return false;
        }

        return true;
    });
}

type PlaceWithGoogleId = {
    google_place_id?: string | null;
};

/** Resolves a Google Places ID string (ChIJ…) when the location is a Google place. */
export function resolveGooglePlaceId(
    place: {provider?: PlaceSource | string | null} & PlaceWithGoogleId
): string | null {
    if (place.provider !== PlaceSource.GOOGLE && place.provider !== "GOOGLE") {
        return null;
    }
    const id = place.google_place_id;
    if (typeof id === "string" && id.trim().length > 0) return id.trim();
    return null;
}

/**
 * Groups expenses by location place ID to produce aggregated place nodes (`PlaceAgg`).
 */
export function aggregateExpensesByPlace(
    expenses: ExpenseDetailsBasicResponse[]
): PlaceAgg[] {
    const placeMap = new Map<string | number, PlaceAgg>();

    expenses.forEach((exp) => {
        if (!exp.place) return;

        const placeId = exp.place.id || `${exp.place.geo.latitude},${exp.place.geo.longitude}`;
        const googlePlaceId = resolveGooglePlaceId(
            exp.place as typeof exp.place & PlaceWithGoogleId
        );

        const existing = placeMap.get(placeId);
        if (existing) {
            existing.totalAmount += exp.user_share ?? exp.total_amount;
            existing.expensesCount += 1;
            existing.expenses.push(exp);
            if (!existing.googlePlaceId && googlePlaceId) {
                existing.googlePlaceId = googlePlaceId;
            }
        } else {
            placeMap.set(placeId, {
                placeId,
                placeName: exp.place.name,
                latitude: exp.place.geo.latitude,
                longitude: exp.place.geo.longitude,
                address: exp.place.address,
                totalAmount: exp.user_share ?? exp.total_amount,
                expensesCount: 1,
                expenses: [exp],
                provider: exp.place.provider ?? null,
                providerId: exp.place.provider_id ?? null,
                googlePlaceId,
            });
        }
    });

    return Array.from(placeMap.values());
}

/**
 * Transforms aggregated place nodes into heat points for Heatmap view.
 */
export function generateHeatPoints(places: PlaceAgg[]): HeatPoint[] {
    if (places.length === 0) return [];
    const maxAmount = Math.max(...places.map((p) => p.totalAmount), 1);

    return places.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        weight: Math.min(Math.max(p.totalAmount / maxAmount, 0.1), 1),
    }));
}

/**
 * Calculates a simple convex hull bounding polygon for a set of coordinates.
 */
export function calculateConvexHull(
    points: { latitude: number; longitude: number }[]
) {
    if (points.length < 3) return points;

    const sorted = [...points].sort((a, b) =>
        a.longitude === b.longitude
            ? a.latitude - b.latitude
            : a.longitude - b.longitude
    );

    const crossProduct = (
        o: { latitude: number; longitude: number },
        a: { latitude: number; longitude: number },
        b: { latitude: number; longitude: number }
    ) =>
        (a.longitude - o.longitude) * (b.latitude - o.latitude) -
        (a.latitude - o.latitude) * (b.longitude - o.longitude);

    const lower: { latitude: number; longitude: number }[] = [];
    for (const p of sorted) {
        while (
            lower.length >= 2 &&
            crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
            ) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper: { latitude: number; longitude: number }[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (
            upper.length >= 2 &&
            crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
            ) {
            upper.pop();
        }
        upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

export function getConvexHull(points: { latitude: number; longitude: number }[]) {
    return calculateConvexHull(points);
}

export function formatTrailDay(isoDate: string): string {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
}

export const formatINR = (amount: number) =>
    `₹${Math.round(amount).toLocaleString('en-IN')}`;

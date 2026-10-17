import {
    PlaceAnalyticsBundle,
    PlaceAnalyticsBundleQueryParams,
    PlaceAnalyticsSection,
} from '@/src/api/dto/expense/place_analytics';
import {DUMMY_EXPENSES} from '../dummyExpenseMapData';
import {getMockPlaceAnalytics} from '../utils/mockPlaceAnalytics';
import type {MapDateRange, PlaceAgg} from '../types/spatialMap.types';

export type ListMapPlaceAnalyticsParams = PlaceAnalyticsBundleQueryParams & {
    place_ids: number[];
};

/**
 * Multi-place analytics for the map sheet.
 * Dummy today — swap body for `getMultiPlaceAnalyticsBundleApi(place_ids, params)` later.
 */
export async function listMapPlaceAnalytics(
    params: ListMapPlaceAnalyticsParams
): Promise<PlaceAnalyticsBundle> {
    const placeIds = params.place_ids ?? [];
    const idSet = new Set(placeIds.map(Number));

    const matchingExpenses = DUMMY_EXPENSES.filter(
        (e) => e.place?.id != null && idSet.has(Number(e.place.id))
    ).filter((e) => {
        const day = e.expense_date.includes('T')
            ? e.expense_date.split('T')[0]
            : e.expense_date.slice(0, 10);
        return day >= params.start_date && day <= params.end_date;
    });

    const dateRange: MapDateRange = {
        startDate: params.start_date,
        endDate: params.end_date,
    };

    const rangeTotal = matchingExpenses.reduce(
        (sum, e) => sum + (e.user_share ?? e.total_amount ?? 0),
        0
    );

    const synthetic: PlaceAgg = {
        placeId: placeIds[0] ?? 0,
        placeName: 'Viewport',
        latitude: 0,
        longitude: 0,
        totalAmount: rangeTotal,
        expensesCount: matchingExpenses.length,
        expenses: matchingExpenses,
    };

    const bundle = getMockPlaceAnalytics(synthetic, dateRange, rangeTotal);
    const include = new Set(params.include ?? []);

    const withIds: PlaceAnalyticsBundle = {
        ...bundle,
        place_ids: placeIds,
        place_id: placeIds.length === 1 ? placeIds[0] : null,
    };

    if (include.size === 0) return withIds;

    return {
        place_ids: withIds.place_ids,
        place_id: withIds.place_id,
        start_date: withIds.start_date,
        end_date: withIds.end_date,
        summary: include.has(PlaceAnalyticsSection.SUMMARY)
            ? withIds.summary
            : undefined,
        categories: include.has(PlaceAnalyticsSection.CATEGORIES)
            ? withIds.categories
            : undefined,
        cadence: include.has(PlaceAnalyticsSection.CADENCE)
            ? withIds.cadence
            : undefined,
        activity: include.has(PlaceAnalyticsSection.ACTIVITY)
            ? withIds.activity
            : undefined,
        series: include.has(PlaceAnalyticsSection.SERIES)
            ? withIds.series
            : undefined,
    };
}

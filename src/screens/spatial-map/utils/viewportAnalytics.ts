import type {Region} from 'react-native-maps';
import {
    PlaceAnalyticsBundle,
    PlaceAnalyticsSection,
    PlaceCategoryItem,
} from '@/src/api/dto/expense/place_analytics';
import {listMapPlaceAnalytics} from '../data/mapPlaceAnalytics';
import type {MapDateRange, PlaceAgg} from '../types/spatialMap.types';
import {getMockPlaceAnalytics} from './mockPlaceAnalytics';
import {getPlacesInViewport} from './viewportStats';

export type ViewportTopPlace = {
    place: PlaceAgg;
    sharedInr: number;
    visitCount: number;
    shareOfViewport: number;
};

export type ViewportAnalysisInsight = {
    badge: string;
    text: string;
};

export type ViewportAnalysisViewModel = {
    placeCount: number;
    sharedInr: number;
    shareOfRange: number;
    netInr: number;
    insight: ViewportAnalysisInsight | null;
    categories: PlaceCategoryItem[];
    topPlaces: ViewportTopPlace[];
    peakWeekdayLabel: string | null;
    lastVisitOn: string | null;
    source: 'local' | 'adapter' | 'empty';
};

const WEEKDAY = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

function defaultDateWindow(dateRange: MapDateRange): {start: string; end: string} {
    if (dateRange?.startDate && dateRange?.endDate) {
        return {start: dateRange.startDate, end: dateRange.endDate};
    }
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    const fmt = (d: Date) =>
        [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0'),
        ].join('-');
    return {start: fmt(start), end: fmt(end)};
}

function numericPlaceIds(places: PlaceAgg[]): number[] {
    return places
        .map((p) => p.placeId)
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id) && id > 0);
}

function buildTopPlaces(inView: PlaceAgg[]): ViewportTopPlace[] {
    const viewportShared = inView.reduce((s, p) => s + (p.totalAmount || 0), 0);
    return [...inView]
        .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
        .slice(0, 3)
        .map((place) => ({
            place,
            sharedInr: place.totalAmount || 0,
            visitCount: place.expensesCount || place.expenses?.length || 0,
            shareOfViewport:
                viewportShared > 0 ? (place.totalAmount || 0) / viewportShared : 0,
        }));
}

function buildInsight(
    categories: PlaceCategoryItem[],
    topPlaces: ViewportTopPlace[],
    shareOfRange: number
): ViewportAnalysisInsight | null {
    if (topPlaces.length === 0 && categories.length === 0) return null;

    const topCat = categories[0];
    const topPlace = topPlaces[0];

    if (topPlace && topPlace.shareOfViewport >= 0.4) {
        return {
            badge: 'Area snapshot',
            text: `${topPlace.place.placeName} is ${(topPlace.shareOfViewport * 100).toFixed(0)}% of spend in this view.`,
        };
    }

    if (topCat && topCat.share_of_place > 0) {
        return {
            badge: 'Area snapshot',
            text: `${topCat.category_name ?? 'Other'} leads here (${(topCat.share_of_place * 100).toFixed(0)}% of in-view spend)${
                shareOfRange > 0
                    ? ` · ${(shareOfRange * 100).toFixed(0)}% of your filtered range`
                    : ''
            }.`,
        };
    }

    return {
        badge: 'Area snapshot',
        text: `${topPlaces.length} top spot${topPlaces.length === 1 ? '' : 's'} in this view.`,
    };
}

function viewModelFromBundle(
    inView: PlaceAgg[],
    bundle: PlaceAnalyticsBundle,
    rangeTotalShared: number,
    source: 'local' | 'adapter'
): ViewportAnalysisViewModel {
    const sharedInr = bundle.summary?.shared_inr ?? 0;
    const netInr = bundle.summary?.net_inr ?? 0;
    const shareOfRange =
        rangeTotalShared > 0
            ? sharedInr / rangeTotalShared
            : (bundle.summary?.share_of_spend ?? 0);
    const categories = bundle.categories?.items ?? [];
    const topPlaces = buildTopPlaces(inView);
    const topWd = [...(bundle.cadence?.by_weekday ?? [])].sort(
        (a, b) => b.visit_count - a.visit_count
    )[0];

    return {
        placeCount: inView.length,
        sharedInr,
        shareOfRange,
        netInr,
        insight: buildInsight(categories, topPlaces, shareOfRange),
        categories,
        topPlaces,
        peakWeekdayLabel:
            topWd && topWd.visit_count > 0
                ? WEEKDAY[topWd.weekday] ?? null
                : null,
        lastVisitOn: bundle.cadence?.last_visit_on ?? null,
        source,
    };
}

export function buildViewportAnalyticsFromPlaces(
    places: PlaceAgg[],
    region: Region,
    rangeTotalShared: number,
    dateRange: MapDateRange
): ViewportAnalysisViewModel {
    const inView = getPlacesInViewport(places, region);
    if (inView.length === 0) {
        return {
            placeCount: 0,
            sharedInr: 0,
            shareOfRange: 0,
            netInr: 0,
            insight: null,
            categories: [],
            topPlaces: [],
            peakWeekdayLabel: null,
            lastVisitOn: null,
            source: 'empty',
        };
    }

    const expenses = inView.flatMap((p) => p.expenses ?? []);
    const sharedInr = inView.reduce((s, p) => s + (p.totalAmount || 0), 0);
    const synthetic: PlaceAgg = {
        placeId: 0,
        placeName: 'Viewport',
        latitude: region.latitude,
        longitude: region.longitude,
        totalAmount: sharedInr,
        expensesCount: expenses.length,
        expenses,
    };
    const bundle = getMockPlaceAnalytics(synthetic, dateRange, rangeTotalShared);
    return viewModelFromBundle(inView, bundle, rangeTotalShared, 'local');
}

/**
 * Resolve viewport analysis: prefer local expense rows; else dummy multi-place adapter.
 */
export async function resolveViewportAnalytics(options: {
    places: PlaceAgg[];
    region: Region;
    rangeTotalShared: number;
    dateRange: MapDateRange;
}): Promise<ViewportAnalysisViewModel> {
    const {places, region, rangeTotalShared, dateRange} = options;
    const inView = getPlacesInViewport(places, region);

    if (inView.length === 0) {
        return buildViewportAnalyticsFromPlaces(
            places,
            region,
            rangeTotalShared,
            dateRange
        );
    }

    const expenseCount = inView.reduce(
        (n, p) => n + (p.expenses?.length ?? 0),
        0
    );

    if (expenseCount > 0) {
        return buildViewportAnalyticsFromPlaces(
            places,
            region,
            rangeTotalShared,
            dateRange
        );
    }

    const placeIds = numericPlaceIds(inView);
    if (placeIds.length === 0) {
        return buildViewportAnalyticsFromPlaces(
            places,
            region,
            rangeTotalShared,
            dateRange
        );
    }

    const {start, end} = defaultDateWindow(dateRange);
    const bundle = await listMapPlaceAnalytics({
        place_ids: placeIds,
        start_date: start,
        end_date: end,
        include: [
            PlaceAnalyticsSection.SUMMARY,
            PlaceAnalyticsSection.CATEGORIES,
            PlaceAnalyticsSection.CADENCE,
            PlaceAnalyticsSection.ACTIVITY,
        ],
    });

    return viewModelFromBundle(inView, bundle, rangeTotalShared, 'adapter');
}

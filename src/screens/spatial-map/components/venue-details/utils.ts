import {Alert, Linking, Share} from 'react-native';
import {router} from 'expo-router';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import type {PlaceSeriesPoint} from '@/src/api/dto/expense/place_analytics';
import type {MapDateRange, PlaceAgg} from '../../types/spatialMap.types';
import {
    buildPlaceDeepLinkUrl,
    getPlaceShareTarget,
    hasGooglePlaceId,
} from '../../utils/placeDeepLink';

export {hasGooglePlaceId};

export function buildGoogleDirectionsUrl(
    googlePlaceId: string,
    latitude: number,
    longitude: number
): string {
    const destination = `${latitude},${longitude}`;
    return (
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${encodeURIComponent(destination)}` +
        `&destination_place_id=${encodeURIComponent(googlePlaceId.trim())}`
    );
}

/** Opens Google Maps directions (place id when known, else lat/lng). */
export async function openPlaceDirections(venue: PlaceAgg): Promise<boolean> {
    if (
        !Number.isFinite(venue.latitude) ||
        !Number.isFinite(venue.longitude)
    ) {
        return false;
    }
    const destination = `${venue.latitude},${venue.longitude}`;
    const url = hasGooglePlaceId(venue.googlePlaceId)
        ? buildGoogleDirectionsUrl(
              venue.googlePlaceId!,
              venue.latitude,
              venue.longitude
          )
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) return false;
        await Linking.openURL(url);
        return true;
    } catch {
        return false;
    }
}

export async function sharePlace(venue: PlaceAgg): Promise<void> {
    const lines = [venue.placeName];
    if (venue.address) lines.push(venue.address);

    const target = getPlaceShareTarget(venue);
    if (target) {
        // App deep link — opens this place on the regional map (GOOGLE / CUSTOM).
        lines.push(buildPlaceDeepLinkUrl(target));
    }

    try {
        await Share.share({
            message: lines.join('\n'),
            title: venue.placeName,
            url: target ? buildPlaceDeepLinkUrl(target) : undefined,
        });
    } catch {
        // User dismissed share sheet — ignore
    }
}

/** Opens Add Budget with this venue prefilled as a place scope. */
export function promptAddPlaceBudget(venue: PlaceAgg): void {
    const placeId = Number(venue.placeId);
    if (!Number.isFinite(placeId) || placeId <= 0) {
        Alert.alert(
            'Add budget',
            'This place needs to be saved before you can attach a budget.',
            [{text: 'OK'}],
        );
        return;
    }
    router.push({
        pathname: '/(authenticated)/expense/budget/add',
        params: {
            placeId: String(placeId),
            placeName: venue.placeName,
        },
    } as any);
}

export function formatRangeLabel(
    dateRange: MapDateRange,
    start: string,
    end: string
): string {
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split('-').map(Number);
        if (!y || !m || !d) return iso;
        return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };
    if (!dateRange) {
        if (start && end) {
            return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
        }
        return 'All time';
    }
    return `${fmt(dateRange.startDate)} – ${fmt(dateRange.endDate)}`;
}

/** Chart x-label — daily `14 Oct`, monthly `Oct`. */
export function seriesPeriodLabel(
    point: PlaceSeriesPoint,
    mode: 'daily' | 'monthly'
): string {
    const [y, m, d] = point.period_start.split('-').map(Number);
    if (!y || !m) return point.period_start;
    const date = new Date(y, m - 1, d || 1);
    if (Number.isNaN(date.getTime())) return point.period_start;

    if (mode === 'monthly') {
        return date.toLocaleDateString('en-IN', {month: 'short', year: '2-digit'});
    }

    return date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
}

export function getUniqueCategoryIcons(
    expenses: ExpenseDetailsBasicResponse[] = []
): string[] {
    const iconUrls = new Set<string>();
    expenses.forEach((e) => {
        if (e.category?.icon?.url) {
            iconUrls.add(e.category.icon.url);
        }
    });
    return Array.from(iconUrls);
}

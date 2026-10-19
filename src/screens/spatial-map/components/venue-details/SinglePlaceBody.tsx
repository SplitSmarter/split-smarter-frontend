import React, {useCallback, useMemo, useState} from 'react';
import {Alert, View} from 'react-native';
import {useRouter} from 'expo-router';
import {PlaceSource} from '@/src/api/dto/constants';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {useLocationStore} from '@/src/store/locationStore';
import {usePlaceDetails} from '@/src/hooks/usePlaceDetails';
import type {MapDateRange, PlaceAgg} from '../../types/spatialMap.types';
import {
    getMockPlaceAnalytics,
    getMockPlaceInsight,
    getMockPlaceSeries,
} from '../../utils/mockPlaceAnalytics';
import {
    ensureVenuePlaceSaved,
    resolveExistingUserPlaceId,
} from '../../utils/ensureVenuePlaceSaved';
import type {VenueTrendMode} from './types';
import {
    formatRangeLabel,
    hasGooglePlaceId,
    openPlaceDirections,
    promptAddPlaceBudget,
    sharePlace,
} from './utils';
import {SummaryHero} from './SummaryHero';
import {PlaceInsightCard} from './PlaceInsightCard';
import {QuickActionsRow} from './QuickActionsRow';
import {VenuePlacePhotos} from './VenuePlacePhotos';
import {TrendSection} from './TrendSection';
import {CategoriesSection} from './CategoriesSection';
import {CadenceSection} from './CadenceSection';
import {ActivityStream} from './ActivityStream';

interface SinglePlaceBodyProps {
    venue: PlaceAgg;
    dateRange: MapDateRange;
    rangeTotalShared: number;
    onClose: () => void;
}

export function SinglePlaceBody({
    venue,
    dateRange,
    rangeTotalShared,
    onClose,
}: SinglePlaceBodyProps) {
    const router = useRouter();
    const [trendMode, setTrendMode] = useState<VenueTrendMode>('daily');
    const [expenseLoading, setExpenseLoading] = useState(false);
    const directionsEnabled = hasGooglePlaceId(venue.googlePlaceId);

    const placeForDetails = useMemo(
        () => ({
            id: resolveExistingUserPlaceId(venue),
            provider:
                venue.provider === PlaceSource.GOOGLE || venue.provider === 'GOOGLE'
                    ? PlaceSource.GOOGLE
                    : PlaceSource.CUSTOM,
            provider_id: venue.providerId ?? null,
            place_id: venue.googlePlaceId?.trim() || null,
            name: venue.placeName,
            coordinate: [venue.longitude, venue.latitude] as [number, number],
            address: venue.address,
        }),
        [venue]
    );

    const {loading: photosLoading, displayData} = usePlaceDetails(
        placeForDetails,
        true
    );

    const photos = useMemo(() => {
        if (displayData.photos?.length) return displayData.photos;
        return venue.photos ?? [];
    }, [displayData.photos, venue.photos]);

    const analytics = useMemo(
        () => getMockPlaceAnalytics(venue, dateRange, rangeTotalShared),
        [venue, dateRange, rangeTotalShared]
    );
    const series = useMemo(
        () => getMockPlaceSeries(venue, trendMode),
        [venue, trendMode]
    );
    const insight = useMemo(() => getMockPlaceInsight(analytics), [analytics]);
    const rangeLabel = formatRangeLabel(dateRange, analytics.start_date, analytics.end_date);

    const closeThen = useCallback(
        (action: () => void) => {
            onClose();
            setTimeout(action, 200);
        },
        [onClose]
    );

    const handleAddExpense = useCallback(async () => {
        if (expenseLoading) return;
        setExpenseLoading(true);
        try {
            const saved = await ensureVenuePlaceSaved(venue);
            const draft = useExpenseDraftStore.getState();
            draft.setExpenseLocation({
                id: String(saved.id),
                name: saved.name,
            });
            draft.setExpenseLocationMode('place');
            useLocationStore
                .getState()
                .setTempLocationSelection('place', saved.id);
            closeThen(() => router.push('/(authenticated)/expense/add'));
        } catch (e) {
            console.error('Failed saving venue place for expense', e);
            Alert.alert(
                'Could not save place',
                e instanceof Error
                    ? e.message
                    : 'Save this location before adding an expense, then try again.'
            );
        } finally {
            setExpenseLoading(false);
        }
    }, [closeThen, expenseLoading, router, venue]);

    const handleAddBudget = useCallback(() => {
        promptAddPlaceBudget(venue);
    }, [venue]);

    const handleShare = useCallback(() => {
        void sharePlace(venue);
    }, [venue]);

    const handleDirections = useCallback(async () => {
        const opened = await openPlaceDirections(venue);
        if (!opened) {
            Alert.alert(
                'Directions unavailable',
                'This place has no Google Place ID, so Maps cannot be opened.'
            );
        }
    }, [venue]);

    return (
        <View className="gap-y-6">
            <SummaryHero analytics={analytics} rangeLabel={rangeLabel} />
            {insight ? <PlaceInsightCard insight={insight} /> : null}
            <QuickActionsRow
                onAddExpense={() => {
                    void handleAddExpense();
                }}
                onAddBudget={handleAddBudget}
                onShare={handleShare}
                onDirections={handleDirections}
                directionsEnabled={directionsEnabled}
                expenseLoading={expenseLoading}
            />
            <VenuePlacePhotos photos={photos} loading={photosLoading && photos.length === 0} />
            <TrendSection
                points={series.points}
                mode={trendMode}
                onModeChange={setTrendMode}
            />
            <CategoriesSection items={analytics.categories?.items ?? []} />
            <CadenceSection analytics={analytics} />
            <ActivityStream
                items={analytics.activity?.items ?? []}
                onClose={onClose}
            />
        </View>
    );
}

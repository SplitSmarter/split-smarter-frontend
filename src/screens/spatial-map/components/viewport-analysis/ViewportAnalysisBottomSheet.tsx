import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {Region} from 'react-native-maps';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {MapDateRange, PlaceAgg} from '../../types/spatialMap.types';
import {
    resolveViewportAnalytics,
    type ViewportAnalysisViewModel,
} from '../../utils/viewportAnalytics';
import {CategoriesSection} from '../venue-details/CategoriesSection';
import {VenueSheetHeader} from '../venue-details/VenueSheetHeader';
import {ViewportAnalysisHero} from './ViewportAnalysisHero';
import {ViewportCadenceSnapshot} from './ViewportCadenceSnapshot';
import {ViewportInsightCard} from './ViewportInsightCard';
import {ViewportTopPlaces} from './ViewportTopPlaces';

const SNAP_POINTS = ['62%', '90%'] as const;

interface ViewportAnalysisBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    places: PlaceAgg[];
    region: Region;
    rangeTotalShared: number;
    dateRange: MapDateRange;
    rangeLabel: string;
    onSelectPlace: (place: PlaceAgg) => void;
}

export function ViewportAnalysisBottomSheet({
    isVisible,
    onClose,
    places,
    region,
    rangeTotalShared,
    dateRange,
    rangeLabel,
    onSelectPlace,
}: ViewportAnalysisBottomSheetProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const sheetRef = React.useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [...SNAP_POINTS], []);

    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<ViewportAnalysisViewModel | null>(
        null
    );

    useEffect(() => {
        if (isVisible) {
            sheetRef.current?.present();
        } else {
            sheetRef.current?.dismiss();
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        let cancelled = false;
        setLoading(true);
        void (async () => {
            try {
                const result = await resolveViewportAnalytics({
                    places,
                    region,
                    rangeTotalShared,
                    dateRange,
                });
                if (!cancelled) setAnalysis(result);
            } catch {
                if (!cancelled) {
                    setAnalysis({
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
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isVisible, places, region, rangeTotalShared, dateRange]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={isDark ? 0.72 : 0.38}
            />
        ),
        [isDark]
    );

    const handleSelectTopPlace = useCallback(
        (placeId: string | number) => {
            const place =
                analysis?.topPlaces.find((t) => t.place.placeId === placeId)
                    ?.place ?? places.find((p) => p.placeId === placeId);
            if (!place) return;
            onClose();
            setTimeout(() => onSelectPlace(place), 220);
        },
        [analysis?.topPlaces, places, onClose, onSelectPlace]
    );

    const isEmpty = !loading && (!analysis || analysis.placeCount === 0);

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            enableContentPanningGesture
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: colors.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: colors.icon.lighter,
                width: 40,
                height: 5,
            }}
        >
            <View style={styles.container}>
                <VenueSheetHeader
                    title="Area analysis"
                    subtitle={rangeLabel}
                    showBack={false}
                    onBack={onClose}
                    onClose={onClose}
                />

                <View className="mx-6 h-px bg-border-input" />

                <BottomSheetScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                >
                    {loading ? (
                        <View className="items-center justify-center py-16">
                            <ActivityIndicator color={colors.icon.primary} />
                            <AppText
                                variant="body-xs"
                                className="mt-3 text-text-primary-lighter"
                            >
                                Analyzing places in view…
                            </AppText>
                        </View>
                    ) : isEmpty ? (
                        <View className="items-center justify-center rounded-[28px] border border-dashed border-border-input bg-bg-canvas px-6 py-14">
                            <Iconify
                                icon="heroicons:map"
                                size={36}
                                color={colors.icon.lighter}
                            />
                            <AppText
                                variant="body-base"
                                className="mt-3 text-center font-semibold text-text-primary"
                            >
                                No places in view
                            </AppText>
                            <AppText
                                variant="body-xs"
                                className="mt-1 text-center text-text-primary-lighter"
                            >
                                Pan the map to include places with spend, then
                                open analysis again.
                            </AppText>
                        </View>
                    ) : analysis ? (
                        <View className="gap-y-6">
                            <ViewportAnalysisHero analysis={analysis} />
                            {analysis.insight ? (
                                <ViewportInsightCard insight={analysis.insight} />
                            ) : null}
                            {analysis.categories.length > 0 ? (
                                <CategoriesSection items={analysis.categories} />
                            ) : null}
                            <ViewportTopPlaces
                                items={analysis.topPlaces}
                                onSelectPlace={handleSelectTopPlace}
                            />
                            <ViewportCadenceSnapshot
                                peakWeekdayLabel={analysis.peakWeekdayLabel}
                                lastVisitOn={analysis.lastVisitOn}
                            />
                        </View>
                    ) : null}
                </BottomSheetScrollView>
            </View>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 48,
    },
});

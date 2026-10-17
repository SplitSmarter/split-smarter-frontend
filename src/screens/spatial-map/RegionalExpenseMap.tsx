import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, View, StyleSheet} from 'react-native';
import MapView, {Heatmap, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {themeStore} from '@/src/store/themeStore';
import {expenseDetailsSheetStore} from '@/src/store/expenseDetailsSheetStore';
import {COLORS} from '@/src/constants/colors';
import {darkMapStyle} from '@/src/constants/darkMapStyle';
import {MyLocationFab} from '@/src/components/common/MyLocationFab';
import {BANGALORE_REGION, DUMMY_EXPENSES} from './dummyExpenseMapData';

import {useSpatialMap} from './hooks/useSpatialMap';
import {useRegionalMapPlacePick} from './hooks/useRegionalMapPlacePick';
import {useMapTabBarVisibility} from './hooks/useMapTabBarVisibility';
import {useDeferredDisplayView} from './hooks/useDeferredDisplayView';
import {useDeferredMapMount} from './hooks/useDeferredMapMount';
import {MapHeader} from './components/MapHeader';
import {DisplayViewOptionsBottomSheet} from './components/DisplayViewOptionsBottomSheet';
import {AnalysisFab} from './components/AnalysisFab';
import {ViewportAnalysisBottomSheet} from './components/viewport-analysis/ViewportAnalysisBottomSheet';
import {TrailIndexRangeSlider} from './components/TrailIndexRangeSlider';
import {TrailExpenseListBottomSheet} from './components/TrailExpenseListBottomSheet';
import {VenueDetailsBottomSheet} from './components/venue-details';
import {formatRangeLabel} from './components/venue-details/utils';
import {DateRangeBottomSheet} from '@/src/components/common/DateRangeBottomSheet';
import {DEFAULT_PLACE_IMAGE} from '@/src/screens/place/select-map/constants/selectMap.constants';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';

import {SpotsLayer} from './components/SpotsLayer';
import {TrailLayer, TrailTxn} from './components/TrailLayer';
import {
    MAP_FAB_GAP,
    MAP_FAB_SIZE,
    TAB_BAR_CLEARANCE,
} from './constants/mapConstants';
import {PlaceAgg} from './types/spatialMap.types';
import {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import type {PlaceDeepLinkParams} from './utils/placeDeepLink';
import {focusMapOnCoordinate} from './utils/focusMapOnCoordinate';

export type PendingPlaceLink = PlaceDeepLinkParams & {ts?: string};

interface RegionalExpenseMapProps {
    /** Deep-link target from share / camera test (`provider` + `id`). */
    pendingPlaceLink?: PendingPlaceLink | null;
    onPlaceLinkConsumed?: () => void;
}

export function RegionalExpenseMap({
    pendingPlaceLink = null,
    onPlaceLinkConsumed,
}: RegionalExpenseMapProps = {}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const insets = useSafeAreaInsets();
    const [showDisplayViewMenu, setShowDisplayViewMenu] = useState(false);
    const [showViewportAnalysis, setShowViewportAnalysis] = useState(false);
    const [showTrailList, setShowTrailList] = useState(false);
    const {notifyActivity, setOverlayOpen} = useMapTabBarVisibility();
    const consumedLinkKeyRef = useRef<string | null>(null);

    const {
        mapRef,
        scopeMode,
        selectedTripId,
        selectedMemoryTitle,
        memories,
        selectMemory,
        flyToMemory,
        clearMemory,
        displayView,
        setDisplayView,
        dateRange,
        dateRangeVisible,
        setDateRangeVisible,
        applyDateRange,
        clearDateRange,
        trailIndexMin,
        trailIndexMax,
        setTrailIndexRange,
        resetTrailIndexRange,
        sheet,
        setSheet,
        allVenues = [],
        allPlaces = [],
        spendCatalog = [],
        visibleTotal = 0,
        region,
        viewportStats,
        activeTrail = [],
        heatmapRadius,
        heatPoints,
        isZoomedIn,
        selectedTripHull,
        onRegionChangeComplete,
        isLocationLoading,
        handleMyLocationPress,
        openPlaceFromDeepLink,
    } = useSpatialMap();

    const {
        uiDisplayView,
        committedDisplayView,
        selectDisplayView,
    } = useDeferredDisplayView(displayView, setDisplayView);
    const mapMounted = useDeferredMapMount();

    useEffect(() => {
        if (!pendingPlaceLink?.provider || !pendingPlaceLink?.id) return;
        const key =
            pendingPlaceLink.ts ??
            `${pendingPlaceLink.provider}:${pendingPlaceLink.id}`;
        if (consumedLinkKeyRef.current === key) return;
        consumedLinkKeyRef.current = key;

        openPlaceFromDeepLink(pendingPlaceLink.provider, pendingPlaceLink.id);
        onPlaceLinkConsumed?.();
    }, [pendingPlaceLink, openPlaceFromDeepLink, onPlaceLinkConsumed]);

    const placesList: PlaceAgg[] = useMemo(() => allVenues || [], [allVenues]);

    const handlePickedPlace = useCallback(
        (place: PlaceAgg) => {
            notifyActivity();
            setSheet({kind: 'venue', venue: place});
        },
        [notifyActivity, setSheet]
    );

    const {
        tempMarker,
        clearTempMarker,
        searchQuery,
        searchResults,
        isSearching,
        handleSearchTextChange,
        handleSearchResultSelect,
        clearSearch,
        onPoiClick,
        onMapLongPress,
        location: pickLocation,
    } = useRegionalMapPlacePick({
        mapRef,
        visiblePlaces: placesList,
        spendCatalog,
        onPlaceSelected: handlePickedPlace,
    });

    const staticOrderedTrail = useMemo<TrailTxn[]>(() => {
        if (activeTrail && activeTrail.length > 0) return activeTrail;

        const trail: TrailTxn[] = [];

        placesList.forEach((place: PlaceAgg) => {
            if (place.expenses && place.expenses.length > 0) {
                place.expenses.forEach((txn: ExpenseDetailsBasicResponse) => {
                    trail.push({
                        id: txn.id ? String(txn.id) : `${place.placeId}-${txn.expense_date || Math.random()}`,
                        latitude: place.latitude,
                        longitude: place.longitude,
                        venueName: place.placeName,
                        at: txn.expense_date || new Date().toISOString(),
                    });
                });
            } else {
                trail.push({
                    id: String(place.placeId),
                    latitude: place.latitude,
                    longitude: place.longitude,
                    venueName: place.placeName,
                    at: new Date().toISOString(),
                });
            }
        });

        trail.sort(
            (a, b) =>
                new Date(a.at ?? 0).getTime() - new Date(b.at ?? 0).getTime()
        );

        return trail.map((txn, i) => ({...txn, index: i + 1}));
    }, [activeTrail, placesList]);

    useEffect(() => {
        if (displayView !== 'trail') return;
        resetTrailIndexRange(staticOrderedTrail.length);
    }, [displayView, staticOrderedTrail.length, resetTrailIndexRange]);

    useEffect(() => {
        setOverlayOpen(
            Boolean(
                sheet ||
                    showDisplayViewMenu ||
                    dateRangeVisible ||
                    showViewportAnalysis ||
                    showTrailList
            )
        );
    }, [
        sheet,
        showDisplayViewMenu,
        dateRangeVisible,
        showViewportAnalysis,
        showTrailList,
        setOverlayOpen,
    ]);

    useEffect(() => {
        if (uiDisplayView !== 'trail') {
            setShowTrailList(false);
        }
    }, [uiDisplayView]);

    const trailListCount = useMemo(
        () =>
            staticOrderedTrail.filter((t) => {
                const i = t.index ?? 0;
                return i >= trailIndexMin && i <= trailIndexMax;
            }).length,
        [staticOrderedTrail, trailIndexMin, trailIndexMax]
    );

    const trailAmountById = useMemo(() => {
        const map: Record<string, string> = {};
        for (const e of DUMMY_EXPENSES) {
            if (e.id == null) continue;
            map[String(e.id)] = formatExpenseMoney(e.total_amount, e.currency);
        }
        return map;
    }, []);

    const handleCloseVenueSheet = useCallback(() => {
        clearTempMarker();
        setSheet(null);
    }, [clearTempMarker, setSheet]);

    const dismissMapOverlays = useCallback(() => {
        handleCloseVenueSheet();
        clearSearch();
        setDateRangeVisible(false);
        setShowDisplayViewMenu(false);
        setShowViewportAnalysis(false);
        setShowTrailList(false);
    }, [clearSearch, handleCloseVenueSheet, setDateRangeVisible]);

    // Stable refs so focus-effect cleanup only runs on tab blur (not on every overlay change).
    const backNavRef = useRef({
        searchResultsLength: 0,
        searchQuery: '',
        sheetOpen: false,
        dateRangeVisible: false,
        showDisplayViewMenu: false,
        showViewportAnalysis: false,
        showTrailList: false,
        clearSearch,
        dismissMapOverlays,
        setDateRangeVisible,
        setShowDisplayViewMenu,
        setShowViewportAnalysis,
        setShowTrailList,
    });
    backNavRef.current = {
        searchResultsLength: searchResults.length,
        searchQuery,
        sheetOpen: Boolean(sheet),
        dateRangeVisible,
        showDisplayViewMenu,
        showViewportAnalysis,
        showTrailList,
        clearSearch,
        dismissMapOverlays,
        setDateRangeVisible,
        setShowDisplayViewMenu,
        setShowViewportAnalysis,
        setShowTrailList,
    };

    /**
     * Hardware back while this tab is focused:
     * search → (venue sheet handled in VenueDetailsBottomSheet) → date/display menus.
     * On blur, clear overlays so they don't stick after leaving the tab.
     */
    useFocusEffect(
        useCallback(() => {
            const onHardwareBack = () => {
                const s = backNavRef.current;
                if (s.searchResultsLength > 0 || s.searchQuery.trim().length > 0) {
                    s.clearSearch();
                    return true;
                }
                // Venue sheet registers its own handler while open (undrill / dismiss).
                if (s.sheetOpen) {
                    return false;
                }
                if (s.dateRangeVisible) {
                    s.setDateRangeVisible(false);
                    return true;
                }
                if (s.showDisplayViewMenu) {
                    s.setShowDisplayViewMenu(false);
                    return true;
                }
                if (s.showViewportAnalysis) {
                    s.setShowViewportAnalysis(false);
                    return true;
                }
                if (s.showTrailList) {
                    s.setShowTrailList(false);
                    return true;
                }
                return false;
            };

            const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
            return () => {
                sub.remove();
                backNavRef.current.dismissMapOverlays();
            };
        }, [])
    );

    const focusOnPlace = useCallback(
        (place: Pick<PlaceAgg, 'latitude' | 'longitude'>) => {
            focusMapOnCoordinate(mapRef, place.latitude, place.longitude);
        },
        [mapRef]
    );

    const openVenueSheet = useCallback(
        (place: PlaceAgg) => {
            clearTempMarker();
            notifyActivity();
            focusOnPlace(place);
            setSheet({kind: 'venue', venue: place});
        },
        [clearTempMarker, focusOnPlace, notifyActivity, setSheet]
    );

    const handleSelectPlace = useCallback(
        (place: PlaceAgg) => {
            openVenueSheet(place);
        },
        [openVenueSheet]
    );

    const handleSelectTrailTxn = useCallback((txn: TrailTxn) => {
        clearTempMarker();
        notifyActivity();
        focusMapOnCoordinate(mapRef, txn.latitude, txn.longitude);

        const expenseId = Number(txn.id);
        if (!Number.isNaN(expenseId) && expenseId > 0) {
            const seed =
                DUMMY_EXPENSES.find((e) => Number(e.id) === expenseId) ?? null;
            expenseDetailsSheetStore.getState().open(expenseId, {
                seed,
                useDummy: true,
            });
            return;
        }

        const foundPlace = placesList.find(
            (p: PlaceAgg) => p.placeName === txn.venueName
        );
        if (!foundPlace) return;
        setSheet({kind: 'venue', venue: foundPlace});
    }, [clearTempMarker, mapRef, notifyActivity, placesList, setSheet]);

    const handleMapPress = useCallback(() => {
        if (searchResults.length > 0) {
            clearSearch();
        }
    }, [clearSearch, searchResults.length]);

    const handleRegionChangeComplete = useCallback(
        (
            region: Parameters<typeof onRegionChangeComplete>[0],
            details?: {isGesture?: boolean}
        ) => {
            onRegionChangeComplete(region);
            if (details?.isGesture) {
                notifyActivity();
            }
        },
        [notifyActivity, onRegionChangeComplete]
    );

    const handleOpenDisplayViewMenu = useCallback(() => {
        notifyActivity();
        setShowDisplayViewMenu(true);
    }, [notifyActivity]);

    const onMyLocationPress = useCallback(() => {
        notifyActivity();
        void handleMyLocationPress();
    }, [notifyActivity, handleMyLocationPress]);

    const handleTrailIndexRange = useCallback(
        (min: number, max: number) => {
            notifyActivity();
            setTrailIndexRange(min, max);
        },
        [notifyActivity, setTrailIndexRange]
    );

    const handleOpenDateRange = useCallback(() => {
        notifyActivity();
        setDateRangeVisible(true);
    }, [notifyActivity, setDateRangeVisible]);

    // Always reserve tab-bar height so overlays never jump when tabs show/hide.
    const bottomChromeInset = insets.bottom + TAB_BAR_CLEARANCE;

    const myLocationFabBottom =
        insets.bottom +
        20 +
        TAB_BAR_CLEARANCE +
        (uiDisplayView === 'trail' ? 108 : 0);
    const analysisFabBottom = myLocationFabBottom + MAP_FAB_SIZE + MAP_FAB_GAP;

    const analysisRangeLabel = useMemo(
        () => formatRangeLabel(dateRange, '', ''),
        [dateRange]
    );

    const canvasBg = isDark ? COLORS.dark.bg.primary : COLORS.light.bg.primary;

    return (
        <View className="flex-1" style={{backgroundColor: canvasBg}}>
            {mapMounted ? (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={BANGALORE_REGION}
                    customMapStyle={isDark ? darkMapStyle : []}
                    toolbarEnabled={false}
                    showsCompass={false}
                    showsTraffic={false}
                    showsUserLocation
                    showsMyLocationButton={false}
                    rotateEnabled={false}
                    moveOnMarkerPress={false}
                    onPanDrag={notifyActivity}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    onPoiClick={onPoiClick}
                    onLongPress={onMapLongPress}
                    onPress={handleMapPress}
                >
                    {/* VIEW 1: HEATMAP — uses committed view so chip can flip before native work */}
                    {committedDisplayView === 'heatmap' && heatPoints.length > 0 && (
                        <>
                            <Heatmap
                                points={heatPoints}
                                radius={heatmapRadius}
                                opacity={0.7}
                                gradient={{
                                    colors: [
                                        COLORS.light.status.success,
                                        COLORS.light.status.warning,
                                        COLORS.light.accent.violet,
                                        COLORS.light.status.decrease,
                                    ],
                                    startPoints: [0.1, 0.4, 0.7, 1],
                                    colorMapSize: 256,
                                }}
                            />
                            {isZoomedIn &&
                                placesList.map((place) => (
                                    <Marker
                                        key={`heatmap-spot-${place.placeId}`}
                                        coordinate={{
                                            latitude: place.latitude,
                                            longitude: place.longitude,
                                        }}
                                        title={place.placeName}
                                        onPress={() => handleSelectPlace(place)}
                                        tracksViewChanges={false}
                                    />
                                ))}
                        </>
                    )}

                    {/* VIEW 2: SPOTS (PLACES) */}
                    {committedDisplayView === 'spots' && (
                        <>
                            {scopeMode === 'trip' && selectedTripHull.length > 0 && (
                                <Polygon
                                    coordinates={selectedTripHull}
                                    fillColor={`${COLORS.light.accent.sky}26`}
                                    strokeColor={COLORS.light.accent.sky}
                                    strokeWidth={2}
                                />
                            )}
                            <SpotsLayer
                                places={placesList}
                                onSelectPlace={handleSelectPlace}
                            />
                        </>
                    )}

                    {/* VIEW 3: TRAIL */}
                    {committedDisplayView === 'trail' && (
                        <TrailLayer
                            activeTrail={staticOrderedTrail}
                            indexMin={trailIndexMin}
                            indexMax={trailIndexMax}
                            onSelectTxn={handleSelectTrailTxn}
                        />
                    )}

                    {tempMarker ? (
                        <Marker
                            coordinate={tempMarker}
                            pinColor={COLORS.light.status.error}
                            tracksViewChanges={false}
                        />
                    ) : null}
                </MapView>
            ) : null}

            {!sheet ? (
                <MapHeader
                    insetsTop={insets.top}
                    searchQuery={searchQuery}
                    isSearching={isSearching}
                    searchResults={searchResults}
                    location={pickLocation}
                    onSearchTextChange={handleSearchTextChange}
                    onClearSearch={clearSearch}
                    onSelectResult={handleSearchResultSelect}
                    defaultImage={DEFAULT_PLACE_IMAGE}
                    dateRange={dateRange}
                    onOpenDateRange={handleOpenDateRange}
                    viewportTotal={viewportStats.totalSpent}
                    viewportPlaceCount={viewportStats.placeCount}
                    selectedMemoryTitle={
                        scopeMode === 'trip' ? selectedMemoryTitle : null
                    }
                    onPressMemoryChip={() => {
                        if (selectedTripId != null) {
                            flyToMemory(selectedTripId);
                        }
                    }}
                    displayView={uiDisplayView}
                    onSelectDisplayView={selectDisplayView}
                    onOpenMemories={handleOpenDisplayViewMenu}
                    onInteraction={notifyActivity}
                />
            ) : null}

            <AnalysisFab
                bottom={analysisFabBottom}
                onPress={() => {
                    notifyActivity();
                    setShowViewportAnalysis(true);
                }}
            />

            <MyLocationFab
                isLoading={isLocationLoading}
                isDark={isDark}
                onPress={onMyLocationPress}
                style={{bottom: myLocationFabBottom, right: 12}}
            />

            {uiDisplayView === 'trail' && (
                <TrailIndexRangeSlider
                    insetsBottom={bottomChromeInset}
                    mapMode={uiDisplayView}
                    count={staticOrderedTrail.length}
                    minIndex={trailIndexMin}
                    maxIndex={trailIndexMax}
                    onChangeRange={handleTrailIndexRange}
                    listCount={trailListCount}
                    onOpenList={() => {
                        notifyActivity();
                        setShowTrailList(true);
                    }}
                />
            )}

            <DisplayViewOptionsBottomSheet
                isVisible={showDisplayViewMenu}
                onClose={() => setShowDisplayViewMenu(false)}
                memories={memories}
                selectedMemoryId={selectedTripId}
                scopeMode={scopeMode}
                onSelectMemory={(id) => {
                    void selectMemory(id);
                }}
                onSelectAllSpend={clearMemory}
            />

            <DateRangeBottomSheet
                visible={dateRangeVisible}
                initialStartDate={dateRange?.startDate}
                initialEndDate={dateRange?.endDate}
                title="Map date range"
                confirmLabel="Apply"
                onClose={() => setDateRangeVisible(false)}
                onConfirm={applyDateRange}
                onClearFilter={clearDateRange}
            />

            <VenueDetailsBottomSheet
                sheet={sheet}
                onClose={handleCloseVenueSheet}
                onSelectVenue={openVenueSheet}
                dateRange={dateRange}
                rangeTotalShared={visibleTotal}
            />

            <ViewportAnalysisBottomSheet
                isVisible={showViewportAnalysis}
                onClose={() => setShowViewportAnalysis(false)}
                places={allPlaces}
                region={region ?? BANGALORE_REGION}
                rangeTotalShared={visibleTotal}
                dateRange={dateRange}
                rangeLabel={analysisRangeLabel}
                onSelectPlace={openVenueSheet}
            />

            <TrailExpenseListBottomSheet
                isVisible={showTrailList}
                onClose={() => setShowTrailList(false)}
                trail={staticOrderedTrail}
                indexMin={trailIndexMin}
                indexMax={trailIndexMax}
                totalCount={staticOrderedTrail.length}
                amountById={trailAmountById}
                onSelectTxn={handleSelectTrailTxn}
            />
        </View>
    );
}

export default RegionalExpenseMap;

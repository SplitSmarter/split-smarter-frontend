import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import MapView, {Circle, Heatmap, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {themeStore} from '@/src/store/themeStore';
import {darkMapStyle} from '@/src/constants/darkMapStyle';
import {MyLocationFab} from '@/src/components/common/MyLocationFab';
import {BANGALORE_REGION, HABIT_RADIUS_M, HOME_GEO, MEMORIES} from './dummyExpenseMapData';

import {useSpatialMap} from './hooks/useSpatialMap';
import {useMapTabBarVisibility} from './hooks/useMapTabBarVisibility';
import {MapHeader} from './components/MapHeader';
import {DisplayViewFab} from './components/DisplayViewFab';
import {DisplayViewOptionsBottomSheet} from './components/DisplayViewOptionsBottomSheet';
import {TrailDaySelector} from './components/TrailDaySelector';
import {LayerOptionsBottomSheet} from './components/LayerOptionsBottomSheet';
import {VenueDetailsBottomSheet} from './components/VenueDetailsBottomSheet';

import {SpotsLayer} from './components/SpotsLayer';
import {TrailLayer, TrailTxn} from './components/TrailLayer';
import {TrailTimeLegend} from './components/TrailTimeLegend';
import {
    MAP_FAB_GAP,
    MAP_FAB_SIZE,
    TAB_BAR_CLEARANCE,
} from './constants/mapConstants';
import {PlaceAgg} from './types/spatialMap.types';
import {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';

export function RegionalExpenseMap() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const insets = useSafeAreaInsets();
    const [showDisplayViewMenu, setShowDisplayViewMenu] = useState(false);
    const {notifyActivity, setOverlayOpen} = useMapTabBarVisibility();

    const {
        mapRef,
        scopeMode,
        handleSelectScopeMode,
        selectedTripId,
        displayView,
        setDisplayView,
        monthId,
        setMonthId,
        markerFilter,
        setMarkerFilter,
        trailDate,
        setTrailDate,
        showHabitRadius,
        setShowHabitRadius,
        sheet,
        setSheet,
        showLayerMenu,
        setShowLayerMenu,
        allVenues = [],
        visibleTotal,
        days,
        activeTrail = [],
        heatmapRadius,
        heatPoints,
        isZoomedIn,
        selectedTripHull,
        onRegionChangeComplete,
        isLocationLoading,
        handleMyLocationPress,
        flyToTrip,
    } = useSpatialMap();

    const placesList: PlaceAgg[] = useMemo(() => allVenues || [], [allVenues]);

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

        return trail;
    }, [activeTrail, placesList]);

    useEffect(() => {
        setOverlayOpen(Boolean(sheet || showLayerMenu || showDisplayViewMenu));
    }, [sheet, showLayerMenu, showDisplayViewMenu, setOverlayOpen]);

    const handleSelectPlace = useCallback((place: PlaceAgg) => {
        notifyActivity();
        setSheet({kind: 'venue', venue: place});
    }, [notifyActivity, setSheet]);

    const handleSelectTrailTxn = useCallback((txn: TrailTxn) => {
        const foundPlace = placesList.find(
            (p: PlaceAgg) => p.placeName === txn.venueName
        );

        if (!foundPlace) return;

        notifyActivity();
        setSheet({kind: 'venue', venue: foundPlace});
    }, [notifyActivity, placesList, setSheet]);

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

    const handleSelectTrailDate = useCallback(
        (date: string) => {
            notifyActivity();
            setTrailDate(date);
        },
        [notifyActivity, setTrailDate]
    );

    const handleSelectMonth = useCallback(
        (id: string) => {
            notifyActivity();
            setMonthId(id);
        },
        [notifyActivity, setMonthId]
    );

    // Always reserve tab-bar height so overlays never jump when tabs show/hide.
    const bottomChromeInset = insets.bottom + TAB_BAR_CLEARANCE;

    const displayViewFabBottom =
        insets.bottom + 20 + TAB_BAR_CLEARANCE + (displayView === 'trail' ? 76 : 0);

    const myLocationFabBottom = displayViewFabBottom + MAP_FAB_SIZE + MAP_FAB_GAP;

    return (
        <View className="flex-1 bg-background">
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
                onPanDrag={notifyActivity}
                onRegionChangeComplete={handleRegionChangeComplete}
            >
                {/* VIEW 1: HEATMAP */}
                {displayView === 'heatmap' && heatPoints.length > 0 && (
                    <>
                        <Heatmap
                            points={heatPoints}
                            radius={heatmapRadius}
                            opacity={0.7}
                            gradient={{
                                colors: ['#7CFFB2', '#F4C15D', '#FF7A45', '#E14B4B'],
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
                            ))
                        }
                    </>
                )}

                {/* VIEW 2: SPOTS (PLACES) */}
                {displayView === 'spots' && (
                    <>
                        {scopeMode === 'trip' && selectedTripHull.length > 0 && (
                            <Polygon
                                coordinates={selectedTripHull}
                                fillColor="rgba(74, 144, 226, 0.15)"
                                strokeColor="#4A90E2"
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
                {displayView === 'trail' && (
                    <TrailLayer
                        activeTrail={staticOrderedTrail}
                        onSelectTxn={handleSelectTrailTxn}
                    />
                )}

                {/* HABIT OVERLAY */}
                {showHabitRadius && scopeMode === 'general' && (
                    <Circle
                        center={HOME_GEO}
                        radius={HABIT_RADIUS_M}
                        strokeColor="rgba(45,138,91,0.6)"
                        fillColor="rgba(45,138,91,0.1)"
                        strokeWidth={2}
                    />
                )}
            </MapView>

            {/* TRAIL LEGEND */}
            {displayView === 'trail' && staticOrderedTrail.length > 0 && <TrailTimeLegend/>}

            <MapHeader
                insetsTop={insets.top}
                scopeMode={scopeMode}
                onSelectScopeMode={handleSelectScopeMode}
                memories={MEMORIES}
                selectedMemoryId={selectedTripId}
                onSelectMemory={flyToTrip}
                visibleTotal={visibleTotal}
                onOpenLayerMenu={() => setShowLayerMenu(true)}
                onInteraction={notifyActivity}
            />

            <MyLocationFab
                isLoading={isLocationLoading}
                isDark={isDark}
                onPress={onMyLocationPress}
                style={{bottom: myLocationFabBottom, right: 12}}
            />

            <DisplayViewFab
                insetsBottom={insets.bottom}
                elevated={displayView === 'trail'}
                displayView={displayView}
                onPress={handleOpenDisplayViewMenu}
            />

            {/* TRAIL DAY SELECTOR */}
            {displayView === 'trail' && (
                <TrailDaySelector
                    insetsBottom={bottomChromeInset}
                    mapMode={displayView}
                    days={days}
                    trailDate={trailDate}
                    onSelectTrailDate={handleSelectTrailDate}
                    monthId={monthId}
                    onSelectMonth={handleSelectMonth}
                />
            )}

            <DisplayViewOptionsBottomSheet
                isVisible={showDisplayViewMenu}
                onClose={() => setShowDisplayViewMenu(false)}
                displayView={displayView}
                onSelectDisplayView={setDisplayView}
            />

            <LayerOptionsBottomSheet
                isVisible={showLayerMenu}
                onClose={() => setShowLayerMenu(false)}
                markerFilter={markerFilter}
                onSelectFilter={setMarkerFilter}
                showHabitRadius={showHabitRadius}
                onToggleHabitRadius={() => setShowHabitRadius((v) => !v)}
            />

            <VenueDetailsBottomSheet
                sheet={sheet}
                onClose={() => setSheet(null)}
                onSelectVenue={(place) => setSheet({kind: 'venue', venue: place})}
            />
        </View>
    );
}

export default RegionalExpenseMap;

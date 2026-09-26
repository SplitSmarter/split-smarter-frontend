import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import MapView, {Circle, Heatmap, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {themeStore} from '@/src/store/themeStore';
import {darkMapStyle} from '@/src/screens/place/SelectMapScreen.styles';
import {BANGALORE_REGION, HABIT_RADIUS_M, HOME_GEO, MEMORIES} from '@/src/test/features/spatial-map/dummyExpenseMapData';

import {useSpatialMap} from './hooks/useSpatialMap';
import {MapHeader} from './components/MapHeader';
import {RecenterButton} from './components/RecenterButton';
import {TrailDaySelector} from './components/TrailDaySelector';
import {LayerOptionsBottomSheet} from './components/LayerOptionsBottomSheet';
import {VenueDetailsBottomSheet} from './components/VenueDetailsBottomSheet';

import {SpotsLayer} from './components/SpotsLayer';
import {TrailLayer, TrailTxn} from './components/TrailLayer';
import {TrailTimeLegend} from '@/src/test/features/spatial-map/components/TrailTimeLegend';
import {PlaceAgg} from '@/src/test/features/spatial-map/types/spatialMap.types';
import {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';

export function RegionalExpenseMap() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const insets = useSafeAreaInsets();

    const {
        mapRef,
        scopeMode,
        handleSelectScopeMode,
        selectedTripId, // or selectedMemoryId from custom hook
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
        allVenues = [], // Contains array of PlaceAgg
        visibleTotal,
        days,
        activeTrail = [],
        heatmapRadius,
        heatPoints,
        isZoomedIn,
        selectedTripHull,
        onRegionChangeComplete,
        recenter,
        flyToTrip,
    } = useSpatialMap();

    // Standardize places list
    const placesList: PlaceAgg[] = useMemo(() => allVenues || [], [allVenues]);

    // Construct static ordered trail using `placesList` (PlaceAgg[])
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

    const handleSelectPlace = useCallback((place: PlaceAgg) => {
        setSheet({kind: 'venue', venue: place});
    }, [setSheet]);

    const handleSelectTrailTxn = useCallback((txn: TrailTxn) => {
        const foundPlace = placesList.find(
            (p: PlaceAgg) => p.placeName === txn.venueName
        );

        if (!foundPlace) return;

        setSheet({kind: 'venue', venue: foundPlace});
    }, [placesList, setSheet]);

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
                showsUserLocation={false}
                rotateEnabled={false}
                onRegionChangeComplete={onRegionChangeComplete}
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
                displayView={displayView}
                onSelectDisplayView={setDisplayView}
                visibleTotal={visibleTotal}
                onOpenLayerMenu={() => setShowLayerMenu(true)}
            />

            <RecenterButton insetsTop={insets.top + 80} onPress={recenter}/>

            {/* TRAIL DAY SELECTOR */}
            {displayView === 'trail' && (
                <TrailDaySelector
                    insetsBottom={insets.bottom}
                    mapMode={displayView}
                    days={days}
                    trailDate={trailDate}
                    onSelectTrailDate={setTrailDate}
                    monthId={monthId}
                    onSelectMonth={setMonthId}
                />
            )}

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
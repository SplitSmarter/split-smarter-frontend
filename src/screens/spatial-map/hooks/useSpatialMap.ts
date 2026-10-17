import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert} from 'react-native';
import MapView, {Region} from 'react-native-maps';
import {useCurrentLocation} from '@/src/hooks/useCurrentLocation';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import type {MemoryBasicDetails} from '@/src/api/dto/user/memory';
import {BANGALORE_REGION} from '../dummyExpenseMapData';
import {listMapExpenses, listMapMemories} from '../data/mapExpenseData';
import {MY_LOCATION_REGION_DELTA} from '../constants/mapConstants';
import {
    DisplayView,
    HeatPoint,
    MapDateRange,
    PlaceAgg,
    ScopeMode,
    SheetState,
} from '../types/spatialMap.types';
import {focusMapOnCoordinate} from '../utils/focusMapOnCoordinate';

import {TrailTxn} from '../components/TrailLayer';
import {
    aggregateExpensesByPlace,
    calculateConvexHull,
    filterExpenses,
    generateHeatPoints,
} from '../utils/spatialMap.utils';
import {findPlaceByDeepLink} from '../utils/placeDeepLink';
import {getViewportStats} from '../utils/viewportStats';

export function useSpatialMap() {
    const mapRef = useRef<MapView>(null);
    const {isLoading: isLocationLoading, refreshLocation} = useCurrentLocation();

    useEffect(() => {
        refreshLocation(false);
    }, [refreshLocation]);

    const [scopeMode, setScopeMode] = useState<ScopeMode>('general');
    const [selectedMemoryId, setSelectedMemoryId] = useState<number | null>(null);
    const [displayView, setDisplayView] = useState<DisplayView>('spots');
    const [dateRange, setDateRange] = useState<MapDateRange>(null);
    const [dateRangeVisible, setDateRangeVisible] = useState(false);
    const [trailIndexMin, setTrailIndexMin] = useState(1);
    const [trailIndexMax, setTrailIndexMax] = useState(1);
    const [sheet, setSheet] = useState<SheetState>(null);

    const resetTrailIndexRange = useCallback((count: number) => {
        const hi = Math.max(1, count);
        setTrailIndexMin(1);
        setTrailIndexMax(hi);
    }, []);

    const setTrailIndexRange = useCallback((min: number, max: number) => {
        const lo = Math.min(min, max);
        const hi = Math.max(min, max);
        setTrailIndexMin(lo);
        setTrailIndexMax(hi);
    }, []);

    const [memories, setMemories] = useState<MemoryBasicDetails[]>([]);
    const [expenses, setExpenses] = useState<ExpenseDetailsBasicResponse[]>([]);
    const [region, setRegion] = useState<Region>(BANGALORE_REGION);

    const isZoomedIn = useMemo(
        () => region.latitudeDelta < 0.05,
        [region.latitudeDelta]
    );

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const list = await listMapMemories();
            if (!cancelled) setMemories(list);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const reloadExpenses = useCallback(async () => {
        const params = {
            start_date: dateRange?.startDate,
            end_date: dateRange?.endDate,
            memory_id:
                scopeMode === 'trip' && selectedMemoryId != null
                    ? [selectedMemoryId]
                    : undefined,
            limit: 100,
        };
        const rows = await listMapExpenses(params);
        setExpenses(rows);
    }, [dateRange, scopeMode, selectedMemoryId]);

    useEffect(() => {
        void reloadExpenses();
    }, [reloadExpenses]);

    const filteredExpenses = useMemo(() => {
        return filterExpenses(expenses, {
            scopeMode,
            selectedTripId:
                selectedMemoryId != null ? String(selectedMemoryId) : null,
            dateRange,
        });
    }, [expenses, scopeMode, selectedMemoryId, dateRange]);

    const allPlaces = useMemo<PlaceAgg[]>(
        () => aggregateExpensesByPlace(filteredExpenses),
        [filteredExpenses]
    );

    const spendCatalog = useMemo<PlaceAgg[]>(
        () => aggregateExpensesByPlace(expenses),
        [expenses]
    );

    const visibleTotal = useMemo(() => {
        return filteredExpenses.reduce(
            (sum, e) => sum + (e.user_share ?? e.total_amount),
            0
        );
    }, [filteredExpenses]);

    const viewportStats = useMemo(
        () => getViewportStats(allPlaces, region),
        [allPlaces, region]
    );

    const selectedMemoryTitle = useMemo(() => {
        if (selectedMemoryId == null) return null;
        return memories.find((m) => m.id === selectedMemoryId)?.title ?? null;
    }, [memories, selectedMemoryId]);

    const heatPoints = useMemo<HeatPoint[]>(
        () => generateHeatPoints(allPlaces),
        [allPlaces]
    );

    const heatmapRadius = useMemo(() => {
        if (region.latitudeDelta > 0.5) return 20;
        if (region.latitudeDelta > 0.1) return 30;
        return 45;
    }, [region.latitudeDelta]);

    const activeTrail = useMemo<TrailTxn[]>(() => {
        if (displayView !== 'trail') return [];

        const txns = [...filteredExpenses].sort(
            (a, b) =>
                new Date(a.expense_date).getTime() -
                new Date(b.expense_date).getTime()
        );

        return txns
            .filter((e) => e.place != null)
            .map((e, i) => ({
                id: `${e.id}`,
                latitude: e.place!.geo.latitude,
                longitude: e.place!.geo.longitude,
                venueName: e.place!.name,
                at: e.expense_date,
                index: i + 1,
            }));
    }, [displayView, filteredExpenses]);

    const selectedMemoryHull = useMemo(() => {
        if (scopeMode !== 'trip' || allPlaces.length === 0) return [];
        return calculateConvexHull(
            allPlaces.map((v) => ({
                latitude: v.latitude,
                longitude: v.longitude,
            }))
        );
    }, [scopeMode, allPlaces]);

    const flyToMemoryExpenses = useCallback(
        (memoryExpenses: ExpenseDetailsBasicResponse[]) => {
            const withPlace = memoryExpenses.filter(
                (e): e is typeof e & {place: NonNullable<typeof e.place>} =>
                    e.place != null && e.place.geo != null
            );
            if (withPlace.length === 0) return;

            let minLat = withPlace[0].place.geo.latitude;
            let maxLat = withPlace[0].place.geo.latitude;
            let minLng = withPlace[0].place.geo.longitude;
            let maxLng = withPlace[0].place.geo.longitude;

            withPlace.forEach((e) => {
                minLat = Math.min(minLat, e.place.geo.latitude);
                maxLat = Math.max(maxLat, e.place.geo.latitude);
                minLng = Math.min(minLng, e.place.geo.longitude);
                maxLng = Math.max(maxLng, e.place.geo.longitude);
            });

            const regionPadding = 0.05;
            mapRef.current?.animateToRegion(
                {
                    latitude: (minLat + maxLat) / 2,
                    longitude: (minLng + maxLng) / 2,
                    latitudeDelta: Math.max(maxLat - minLat + regionPadding, 0.08),
                    longitudeDelta: Math.max(
                        maxLng - minLng + regionPadding,
                        0.08
                    ),
                },
                750
            );
        },
        []
    );

    const selectMemory = useCallback(
        async (memoryIdInput: string | number) => {
            const numId = Number(memoryIdInput);
            setScopeMode('trip');
            setSelectedMemoryId(numId);
            const memory = memories.find((m) => Number(m.id) === numId);
            const memoryStart = memory?.start_at?.slice(0, 10);
            const memoryEnd = memory?.end_at?.slice(0, 10);
            if (memoryStart && memoryEnd) {
                setDateRange({startDate: memoryStart, endDate: memoryEnd});
            }

            // Fly using the full memory place set (ignore prior date filter),
            // so the camera always lands on the trip area.
            const rows = await listMapExpenses({
                memory_id: [numId],
                start_date: memoryStart,
                end_date: memoryEnd,
                limit: 100,
            });
            setExpenses(rows);
            flyToMemoryExpenses(rows);
        },
        [flyToMemoryExpenses, memories]
    );

    const clearMemory = useCallback(() => {
        setScopeMode('general');
        setSelectedMemoryId(null);
    }, []);

    const flyToMemory = useCallback(
        (memoryIdInput: string | number) => {
            void selectMemory(memoryIdInput);
        },
        [selectMemory]
    );

    const handleSelectScopeMode = useCallback(
        (mode: ScopeMode) => {
            if (mode === 'trip') {
                const defaultId = memories[0]?.id ?? null;
                if (defaultId != null) {
                    void selectMemory(defaultId);
                } else {
                    setScopeMode('trip');
                    setSelectedMemoryId(null);
                }
            } else {
                clearMemory();
            }
        },
        [clearMemory, memories, selectMemory]
    );

    const onRegionChangeComplete = useCallback((newRegion: Region) => {
        setRegion(newRegion);
    }, []);

    const handleMyLocationPress = useCallback(async () => {
        const targetCoords = await refreshLocation(true);
        if (!targetCoords) return;

        mapRef.current?.animateToRegion(
            {
                latitude: targetCoords.latitude,
                longitude: targetCoords.longitude,
                latitudeDelta: MY_LOCATION_REGION_DELTA,
                longitudeDelta: MY_LOCATION_REGION_DELTA,
            },
            400
        );
    }, [refreshLocation]);

    const applyDateRange = useCallback((result: DateRangeResult) => {
        setDateRange({startDate: result.startDate, endDate: result.endDate});
        setDateRangeVisible(false);
    }, []);

    const clearDateRange = useCallback(() => {
        setDateRange(null);
    }, []);

    const openPlaceFromDeepLink = useCallback(
        (provider: string, id: string): boolean => {
            setScopeMode('general');
            setSelectedMemoryId(null);
            setDateRange(null);
            setDisplayView('spots');

            const catalog = aggregateExpensesByPlace(expenses);
            const place = findPlaceByDeepLink(catalog, provider, id);
            if (!place) {
                Alert.alert(
                    'Place not found',
                    'This location link does not match a place on your map.'
                );
                return false;
            }

            focusMapOnCoordinate(
                mapRef,
                place.latitude,
                place.longitude,
                500
            );
            setTimeout(() => {
                setSheet({kind: 'venue', venue: place});
            }, 280);
            return true;
        },
        [expenses]
    );

    return {
        mapRef,
        scopeMode,
        handleSelectScopeMode,
        selectedTripId: selectedMemoryId != null ? String(selectedMemoryId) : null,
        selectedMemoryId,
        selectedMemoryTitle,
        memories,
        selectMemory,
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
        allVenues: allPlaces,
        allPlaces,
        spendCatalog,
        visibleTotal,
        region,
        viewportStats,
        activeTrail,
        heatmapRadius,
        heatPoints,
        isZoomedIn,
        selectedTripHull: selectedMemoryHull,
        selectedMemoryHull,
        onRegionChangeComplete,
        isLocationLoading,
        handleMyLocationPress,
        flyToTrip: flyToMemory,
        flyToMemory,
        openPlaceFromDeepLink,
    };
}

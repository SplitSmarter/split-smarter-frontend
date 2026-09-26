import {useCallback, useMemo, useRef, useState} from "react";
import MapView, {Region} from "react-native-maps";
import {
    BANGALORE_REGION,
    DUMMY_EXPENSES,
    MEMORIES,
} from "@/src/test/features/spatial-map/dummyExpenseMapData";
import {
    DayOption,
    DisplayView,
    HeatPoint,
    MarkerFilter,
    PlaceAgg,
    ScopeMode,
    SheetState,
} from "@/src/test/features/spatial-map/types/spatialMap.types";

import {TrailTxn} from "../components/TrailLayer";
import {
    aggregateExpensesByPlace,
    calculateConvexHull,
    filterExpenses,
    generateHeatPoints,
} from "@/src/test/features/spatial-map/utils/spatialMap.utils";

export function useSpatialMap() {
    const mapRef = useRef<MapView>(null);

    // Filter & Mode state
    const [scopeMode, setScopeMode] = useState<ScopeMode>("general");
    const [selectedMemoryId, setSelectedMemoryId] = useState<number | null>(null);
    const [displayView, setDisplayView] = useState<DisplayView>("spots");
    const [monthId, setMonthId] = useState<string>("all");
    const [markerFilter, setMarkerFilter] = useState<MarkerFilter>("all");
    const [trailDate, setTrailDate] = useState<string>("all");
    const [showHabitRadius, setShowHabitRadius] = useState<boolean>(true);
    const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
    const [sheet, setSheet] = useState<SheetState>(null);

    // Map region/zoom tracking state
    const [region, setRegion] = useState<Region>(BANGALORE_REGION);

    const isZoomedIn = useMemo(() => {
        return region.latitudeDelta < 0.05;
    }, [region.latitudeDelta]);

    // 1. Filter expenses matching criteria
    const filteredExpenses = useMemo(() => {
        console.log("[useSpatialMap Debug] ----------------------------------------");
        console.log("[useSpatialMap Debug] Raw Inputs:", {
            scopeMode,
            selectedMemoryId,
            monthId,
            markerFilter,
            dummyExpensesCount: DUMMY_EXPENSES?.length ?? 0,
        });

        const result = filterExpenses(DUMMY_EXPENSES, {
            scopeMode,
            selectedTripId: selectedMemoryId != null ? String(selectedMemoryId) : null,
            monthId,
            markerFilter,
        });

        console.log(`[useSpatialMap Debug] filterExpenses Output: ${result.length} items remaining out of ${DUMMY_EXPENSES?.length ?? 0}`);
        if (result.length > 0) {
            console.log("[useSpatialMap Debug] First filtered expense sample:", {
                id: result[0].id,
                hasPlace: Boolean(result[0].place),
                placeName: result[0].place?.name,
                geo: result[0].place?.geo,
            });
        }
        return result;
    }, [scopeMode, selectedMemoryId, monthId, markerFilter]);

    // 2. Aggregate filtered expenses into places (`allPlaces`)
    const allPlaces = useMemo<PlaceAgg[]>(() => {
        const places = aggregateExpensesByPlace(filteredExpenses);
        console.log(`[useSpatialMap Debug] aggregateExpensesByPlace Output: ${places.length} places aggregated from ${filteredExpenses.length} expenses.`);

        places.forEach((p, index) => {
            if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number' || isNaN(p.latitude) || isNaN(p.longitude)) {
                console.warn(`[useSpatialMap Debug] WARNING: Place at index ${index} (${p.placeName}) has invalid coordinates:`, p);
            }
        });

        return places;
    }, [filteredExpenses]);

    // 3. Compute total visible expenditure
    const visibleTotal = useMemo(() => {
        return filteredExpenses.reduce(
            (sum, e) => sum + (e.user_contribution ?? e.total_amount),
            0
        );
    }, [filteredExpenses]);

    // 4. Calculate Heat Points & Dynamic Heatmap Radius
    const heatPoints = useMemo<HeatPoint[]>(() => {
        return generateHeatPoints(allPlaces);
    }, [allPlaces]);

    const heatmapRadius = useMemo(() => {
        if (region.latitudeDelta > 0.5) return 20;
        if (region.latitudeDelta > 0.1) return 30;
        return 45;
    }, [region.latitudeDelta]);

    // 5. Generate distinct day options for Trail view selector
    const days = useMemo<DayOption[]>(() => {
        const datesSet = new Set<string>();
        filteredExpenses.forEach((e) => {
            if (e.expense_date) {
                datesSet.add(e.expense_date.split("T")[0]);
            }
        });

        const sortedDates = Array.from(datesSet).sort();
        const dayOptions: DayOption[] = sortedDates.map((dateStr) => {
            const dateObj = new Date(dateStr);
            const label = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            const count = filteredExpenses.filter((e) =>
                e.expense_date.startsWith(dateStr)
            ).length;

            return {id: dateStr, date: dateStr, label, count};
        });

        return [{id: "all", date: "all", label: "All Days", count: filteredExpenses.length}, ...dayOptions];
    }, [filteredExpenses]);

    // 6. Generate active trail data ordered chronologically
    const activeTrail = useMemo<TrailTxn[]>(() => {
        if (displayView !== "trail") return [];

        let txns = [...filteredExpenses];
        if (trailDate !== "all") {
            txns = txns.filter((e) => e.expense_date.startsWith(trailDate));
        }

        txns.sort(
            (a, b) =>
                new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime()
        );

        return txns
            .filter((e) => e.place != null)
            .map((e) => ({
                id: `${e.id}`,
                latitude: e.place!.geo.latitude,
                longitude: e.place!.geo.longitude,
                venueName: e.place!.name,
                at: e.expense_date,
            }));
    }, [displayView, filteredExpenses, trailDate]);

    // 7. Calculate Convex Hull Bounding Polygon for active memory
    const selectedMemoryHull = useMemo(() => {
        if (scopeMode !== "trip" || allPlaces.length === 0) return [];
        return calculateConvexHull(
            allPlaces.map((v) => ({latitude: v.latitude, longitude: v.longitude}))
        );
    }, [scopeMode, allPlaces]);

    // Helper to safely resolve initial memory ID
    const getFirstMemoryId = useCallback((): number | null => {
        if (Array.isArray(MEMORIES)) {
            const id = MEMORIES[0]?.id;
            return id != null ? Number(id) : null;
        }
        const memoryKeys = Object.keys(MEMORIES);
        if (memoryKeys.length > 0) {
            const firstItem = MEMORIES[memoryKeys[0]];
            return firstItem?.id != null ? Number(firstItem.id) : null;
        }
        return null;
    }, []);

    // Helper to camera zoom/fly to memory
    const flyToMemory = useCallback((memoryIdInput: string | number) => {
        const numId = Number(memoryIdInput);
        setSelectedMemoryId(numId);

        // Filter expenses matching selected memory ID
        const memoryExpenses = DUMMY_EXPENSES.filter((e): e is typeof e & { place: NonNullable<typeof e.place> } => {
            const expMemoryId = e.memory?.id;
            return expMemoryId === numId && e.place != null && e.place.geo != null;
        });

        console.log(`[useSpatialMap Debug] flyToMemory(${numId}) matching expenses:`, memoryExpenses.length);

        if (memoryExpenses.length === 0) return;

        let minLat = memoryExpenses[0].place.geo.latitude;
        let maxLat = memoryExpenses[0].place.geo.latitude;
        let minLng = memoryExpenses[0].place.geo.longitude;
        let maxLng = memoryExpenses[0].place.geo.longitude;

        memoryExpenses.forEach((e) => {
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
                longitudeDelta: Math.max(maxLng - minLng + regionPadding, 0.08),
            },
            750
        );
    }, []);

    // --- Handlers & Camera Controls ---

    const handleSelectScopeMode = useCallback((mode: ScopeMode) => {
        setScopeMode(mode);
        setTrailDate("all");
        if (mode === "trip") {
            const defaultId = getFirstMemoryId();
            if (defaultId != null) {
                flyToMemory(defaultId);
            }
        } else {
            setSelectedMemoryId(null);
        }
    }, [getFirstMemoryId, flyToMemory]);

    const onRegionChangeComplete = useCallback((newRegion: Region) => {
        setRegion(newRegion);
    }, []);

    const recenter = useCallback(() => {
        mapRef.current?.animateToRegion(BANGALORE_REGION, 500);
    }, []);

    return {
        mapRef,
        scopeMode,
        handleSelectScopeMode,
        selectedTripId: selectedMemoryId != null ? String(selectedMemoryId) : null,
        selectedMemoryId,
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
        allVenues: allPlaces,
        allPlaces,
        visibleTotal,
        days,
        activeTrail,
        heatmapRadius,
        heatPoints,
        isZoomedIn,
        selectedTripHull: selectedMemoryHull,
        selectedMemoryHull,
        onRegionChangeComplete,
        recenter,
        flyToTrip: flyToMemory,
        flyToMemory,
    };
}
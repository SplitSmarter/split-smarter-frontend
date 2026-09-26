import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Pressable,
    ScrollView,
    StyleSheet,
    Modal,
} from 'react-native';
import MapView, {
    Marker,
    Circle,
    Polyline,
    Polygon,
    Heatmap,
    PROVIDER_GOOGLE,
    Region,
} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppBottomSheet} from '@/src/components/common/AppBottomSheet';
import {themeStore} from '@/src/store/themeStore';
import {darkMapStyle} from '@/src/screens/place/SelectMapScreen.styles';
import {
    BANGALORE_REGION,
    CATEGORY_META,
    DUMMY_TXNS,
    HABIT_RADIUS_M,
    HOME,
    MONTH_FILTERS,
    TRIPS,
    ExpenseTxn,
} from '@/src/screens/test/spatial-map/dummyExpenseMapData';
import {
    VenueAgg,
    MapCluster,
    aggregateVenues,
    clusterVenues,
    filterTxns,
    formatINR,
    isCoordInRegion,
    trailDays,
    tripSpend,
    visitCountsFrom,
} from '@/src/screens/test/spatial-map/spatialMapUtils';

type MapMode = 'spots' | 'heatmap' | 'trail' | 'trips';
type MarkerFilter = 'all' | 'frequent' | 'unique';
type SheetTarget =
    | { kind: 'venue'; venue: VenueAgg }
    | { kind: 'cluster'; cluster: MapCluster };

const TRAIL_COLOR = '#F4C15D';
const DEBOUNCE_MS = 150;

function getConvexHull(points: { latitude: number; longitude: number }[]) {
    if (points.length < 3) return points;
    const sorted = [...points].sort((a, b) =>
        a.longitude === b.longitude ? a.latitude - b.latitude : a.longitude - b.longitude,
    );
    const crossProduct = (
        o: { latitude: number; longitude: number },
        a: { latitude: number; longitude: number },
        b: { latitude: number; longitude: number },
    ) => (a.longitude - o.longitude) * (b.latitude - o.latitude) - (a.latitude - o.latitude) * (b.longitude - o.longitude);

    const lower: { latitude: number; longitude: number }[] = [];
    for (const p of sorted) {
        while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }
    const upper: { latitude: number; longitude: number }[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

export function RegionalExpenseMap() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);

    // Active View Mode Switch (Isolates renders to prevent visual clutter)
    const [mapMode, setMapMode] = useState<MapMode>('spots');

    // Camera & Computation States
    const [currentRegion, setCurrentRegion] = useState<Region>(BANGALORE_REGION);
    const [computedRegion, setComputedRegion] = useState<Region>(BANGALORE_REGION);
    const [hasUnsearchedMovement, setHasUnsearchedMovement] = useState(false);

    // Filters
    const [monthId, setMonthId] = useState<string>('all');
    const [markerFilter, setMarkerFilter] = useState<MarkerFilter>('all');
    const [trailDate, setTrailDate] = useState<string | null>('2026-09-18');
    const [showHabitRadius, setShowHabitRadius] = useState(false);
    const [sheet, setSheet] = useState<SheetTarget | null>(null);
    const [tripId, setTripId] = useState<string | null>(null);
    const [showLayerMenu, setShowLayerMenu] = useState(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Data Aggregation
    const visitCounts = useMemo(() => visitCountsFrom(DUMMY_TXNS), []);
    const scopedTxns = useMemo(
        () => filterTxns(DUMMY_TXNS, monthId, markerFilter, visitCounts),
        [monthId, markerFilter, visitCounts],
    );

    const visibleTxns = useMemo(
        () => scopedTxns.filter((t) => isCoordInRegion(t.latitude, t.longitude, computedRegion)),
        [scopedTxns, computedRegion],
    );

    const visibleVenues = useMemo(() => aggregateVenues(visibleTxns), [visibleTxns]);
    const clusters = useMemo(() => clusterVenues(visibleVenues, computedRegion), [visibleVenues, computedRegion]);
    const isMicroView = computedRegion.latitudeDelta < 0.035;

    const visibleTotal = useMemo(() => visibleTxns.reduce((s, t) => s + t.amount, 0), [visibleTxns]);
    const days = useMemo(() => trailDays(scopedTxns), [scopedTxns]);
    const activeTrail = useMemo(() => {
        const raw = days.find((d) => d.date === trailDate)?.txns ?? [];
        return raw.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    }, [days, trailDate]);

    // Heatmap Points
    const heatPoints = useMemo(
        () =>
            visibleTxns.map((t) => ({
                latitude: t.latitude,
                longitude: t.longitude,
                weight: Math.max(1, t.amount / 300),
            })),
        [visibleTxns],
    );

    // Trip Memory Convex Hull
    const selectedTrip = TRIPS.find((t) => t.id === tripId) ?? null;
    const selectedTripStats = selectedTrip ? tripSpend(DUMMY_TXNS, selectedTrip.id) : null;
    const selectedTripHull = useMemo(() => {
        if (!selectedTripStats) return [];
        return getConvexHull(selectedTripStats.list.map((t) => ({latitude: t.latitude, longitude: t.longitude})));
    }, [selectedTripStats]);

    // Region Change Handlers
    const onRegionChange = useCallback((next: Region) => {
        setCurrentRegion(next);
    }, []);

    const onRegionChangeComplete = useCallback((next: Region) => {
        setCurrentRegion(next);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            const latDiff = Math.abs(next.latitude - computedRegion.latitude);
            const lngDiff = Math.abs(next.longitude - computedRegion.longitude);
            if (latDiff > next.latitudeDelta * 0.3 || lngDiff > next.longitudeDelta * 0.3) {
                setHasUnsearchedMovement(true);
            } else {
                setComputedRegion(next);
            }
        }, DEBOUNCE_MS);
    }, [computedRegion]);

    const executeRecalculation = useCallback(() => {
        setComputedRegion(currentRegion);
        setHasUnsearchedMovement(false);
    }, [currentRegion]);

    const recenter = useCallback(() => {
        mapRef.current?.animateToRegion(BANGALORE_REGION, 600);
        setComputedRegion(BANGALORE_REGION);
        setHasUnsearchedMovement(false);
    }, []);

    const flyToTrip = useCallback((id: string) => {
        const trip = TRIPS.find((t) => t.id === id);
        if (!trip) return;
        const regionToSet = {
            latitude: trip.latitude,
            longitude: trip.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
        };
        mapRef.current?.animateToRegion(regionToSet, 700);
        setTripId(id);
        setComputedRegion(regionToSet);
        setHasUnsearchedMovement(false);
    }, []);

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
                onRegionChange={onRegionChange}
                onRegionChangeComplete={onRegionChangeComplete}
            >
                {/* MODE 1: HEATMAP LAYER ONLY */}
                {mapMode === 'heatmap' && heatPoints.length > 0 && (
                    <Heatmap
                        points={heatPoints}
                        radius={50}
                        opacity={0.7}
                        gradient={{
                            colors: ['#7CFFB2', '#F4C15D', '#FF7A45', '#E14B4B'],
                            startPoints: [0.1, 0.4, 0.7, 1],
                            colorMapSize: 256,
                        }}
                    />
                )}

                {/* MODE 2: SPOTS VIEW (PINS & CLUSTERS) */}
                {mapMode === 'spots' &&
                    (isMicroView
                        ? visibleVenues.map((venue) => (
                            <OptimizedMarker
                                key={venue.venueId}
                                coordinate={{latitude: venue.latitude, longitude: venue.longitude}}
                                onPress={() => setSheet({kind: 'venue', venue})}
                            >
                                <CategoryPin venue={venue}/>
                            </OptimizedMarker>
                        ))
                        : clusters.map((cluster) => (
                            <OptimizedMarker
                                key={cluster.id}
                                coordinate={{latitude: cluster.latitude, longitude: cluster.longitude}}
                                onPress={() => {
                                    if (cluster.venues.length === 1) {
                                        setSheet({kind: 'venue', venue: cluster.venues[0]});
                                    } else {
                                        setSheet({kind: 'cluster', cluster});
                                    }
                                }}
                            >
                                <ClusterPin cluster={cluster}/>
                            </OptimizedMarker>
                        )))}

                {/* MODE 3: DAILY TRAIL VIEW */}
                {/* MODE 3: DAILY TRAIL VIEW */}
                {mapMode === 'trail' && activeTrail.length > 0 && (
                    <>
                        {/* Polyline Path */}
                        {activeTrail.length > 1 && (
                            <Polyline
                                coordinates={activeTrail.map((t) => ({
                                    latitude: t.latitude,
                                    longitude: t.longitude,
                                }))}
                                strokeColor={TRAIL_COLOR}
                                strokeWidth={3.5}
                                lineDashPattern={[6, 3]}
                            />
                        )}

                        {/* Sequential Sequence Markers */}
                        {activeTrail.map((txn, idx) => (
                            <Marker
                                key={`trail-pin-${txn.id}`}
                                coordinate={{latitude: txn.latitude, longitude: txn.longitude}}
                                anchor={{x: 0.5, y: 0.5}}
                                tracksViewChanges={false}
                                onPress={() => {
                                    const venue = visibleVenues.find((v) => v.venueName === txn.venueName);
                                    if (venue) setSheet({kind: 'venue', venue});
                                }}
                            >
                                <NumberedTrailBadge
                                    step={idx + 1}
                                    total={activeTrail.length}
                                    timestamp={txn.at}
                                    venueName={txn.venueName}
                                    isFirst={idx === 0}
                                    isLast={idx === activeTrail.length - 1}
                                />
                            </Marker>
                        ))}
                    </>
                )}

                {/* MODE 4: TRIPS & CONVEX HULL */}
                {mapMode === 'trips' && (
                    <>
                        {selectedTripHull.length >= 3 && (
                            <Polygon
                                coordinates={selectedTripHull}
                                fillColor="rgba(244, 193, 93, 0.2)"
                                strokeColor="#F4C15D"
                                strokeWidth={2}
                            />
                        )}
                        {TRIPS.map((trip) => (
                            <Marker
                                key={trip.id}
                                coordinate={{latitude: trip.latitude, longitude: trip.longitude}}
                                onPress={() => flyToTrip(trip.id)}
                                tracksViewChanges={false}
                            >
                                <View className="rounded-2xl bg-[#1A1A1A] px-3 py-1.5 border border-[#F4C15D]">
                                    <AppText variant="body-xs" className="text-[#F4C15D] font-bold">
                                        ✈ {trip.city}
                                    </AppText>
                                </View>
                            </Marker>
                        ))}
                    </>
                )}

                {/* OPTIONAL: HABIT RADIUS */}
                {showHabitRadius && (
                    <Circle
                        center={HOME}
                        radius={HABIT_RADIUS_M}
                        strokeColor="rgba(45,138,91,0.6)"
                        fillColor="rgba(45,138,91,0.1)"
                        strokeWidth={2}
                    />
                )}
            </MapView>

            {/* TOP HEADER & MODE SWITCHER */}
            <View style={{paddingTop: insets.top + 8}} pointerEvents="box-none"
                  className="absolute left-0 right-0 top-0 items-center px-3">
                {/* Manual Recalculate Trigger */}
                {hasUnsearchedMovement && (
                    <Pressable
                        onPress={executeRecalculation}
                        className="mb-2 rounded-full bg-[#2D8A5B] px-4 py-2 flex-row items-center shadow-lg border border-white/20"
                    >
                        <Iconify icon="heroicons:arrow-path" size={14} color="#FFFFFF" className="mr-1.5"/>
                        <AppText variant="body-xs" className="text-white font-bold">
                            Search Area
                        </AppText>
                    </Pressable>
                )}

                {/* Compact Viewport Summary Card */}
                <View
                    className="rounded-2xl bg-black/80 px-4 py-2.5 self-stretch flex-row justify-between items-center border border-white/10">
                    <View>
                        <AppText variant="caption-xs" className="text-white/60">
                            Visible Total
                        </AppText>
                        <AppText variant="body-base" className="text-white font-bold">
                            {formatINR(visibleTotal)} ({visibleTxns.length})
                        </AppText>
                    </View>
                    <Pressable
                        onPress={() => setShowLayerMenu(true)}
                        className="bg-white/10 p-2 rounded-xl flex-row items-center"
                    >
                        <Iconify icon="heroicons:adjustments-horizontal" size={18} color="#FFFFFF"/>
                    </Pressable>
                </View>

                {/* Clean Layer Mode Switcher Bar */}
                <View
                    className="flex-row bg-black/85 rounded-full p-1 mt-2 self-stretch justify-between border border-white/10">
                    {(
                        [
                            {id: 'spots', label: '📍 Spots'},
                            {id: 'heatmap', label: '🔥 Heatmap'},
                            {id: 'trail', label: '🛣️ Trail'},
                            {id: 'trips', label: '✈️ Trips'},
                        ] as const
                    ).map((m) => (
                        <Pressable
                            key={m.id}
                            onPress={() => setMapMode(m.id)}
                            className={`flex-1 py-1.5 items-center rounded-full ${
                                mapMode === m.id ? 'bg-[#2D8A5B]' : 'bg-transparent'
                            }`}
                        >
                            <AppText
                                variant="caption-xs"
                                className={`font-semibold ${mapMode === m.id ? 'text-white' : 'text-white/60'}`}
                            >
                                {m.label}
                            </AppText>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* FLOATING RECENTER FAB */}
            <View className="absolute right-3" style={{top: insets.top + 128}}>
                <Pressable
                    onPress={recenter}
                    className="w-11 h-11 rounded-full bg-black/80 items-center justify-center border border-white/20 shadow-lg"
                >
                    <Iconify icon="heroicons:map-pin" size={20} color="#2D8A5B"/>
                </Pressable>
            </View>

            {/* BOTTOM CONTEXT & FILTER TRAY */}
            <View className="absolute left-0 right-0" style={{bottom: insets.bottom + 8}} pointerEvents="box-none">
                {/* Trail Day Selector (Shown only in Trail Mode) */}
                {mapMode === 'trail' && days.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipRow}
                        className="mb-2"
                    >
                        {days.map((d) => (
                            <Chip
                                key={d.date}
                                active={trailDate === d.date}
                                label={formatTrailDay(d.date)}
                                onPress={() => setTrailDate(d.date)}
                            />
                        ))}
                    </ScrollView>
                )}

                {/* Month Time-Period Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                >
                    {MONTH_FILTERS.map((m) => (
                        <Chip key={m.id} active={monthId === m.id} label={m.label} onPress={() => setMonthId(m.id)}/>
                    ))}
                </ScrollView>
            </View>

            {/* LAYER OPTIONS BOTTOM SHEET */}
            <AppBottomSheet
                isVisible={showLayerMenu}
                onClose={() => setShowLayerMenu(false)}
                snapPoints={['38%']}
            >
                <AppText variant="h3" className="text-text-primary font-bold mb-4">
                    Map Preferences
                </AppText>

                <AppText variant="body-xs" className="text-text-secondary font-bold uppercase mb-2">
                    Filter Spots
                </AppText>
                <View className="flex-row gap-x-2 mb-5">
                    {(
                        [
                            {id: 'all', label: 'All Spots'},
                            {id: 'frequent', label: 'Frequent Hubs'},
                            {id: 'unique', label: 'Uncharted'},
                        ] as const
                    ).map((f) => (
                        <Pressable
                            key={f.id}
                            onPress={() => setMarkerFilter(f.id)}
                            className={`px-3 py-2 rounded-xl border ${
                                markerFilter === f.id ? 'bg-[#2D8A5B] border-[#2D8A5B]' : 'border-foreground/20'
                            }`}
                        >
                            <AppText
                                variant="body-xs"
                                className={markerFilter === f.id ? 'text-white font-bold' : 'text-text-primary'}
                            >
                                {f.label}
                            </AppText>
                        </Pressable>
                    ))}
                </View>

                <AppText variant="body-xs" className="text-text-secondary font-bold uppercase mb-2">
                    Overlays
                </AppText>
                <Pressable
                    onPress={() => setShowHabitRadius((v) => !v)}
                    className="flex-row items-center justify-between py-3 border-t border-foreground/10"
                >
                    <AppText variant="body-base" className="text-text-primary">
                        Show Habit Radius (2.5 km)
                    </AppText>
                    <View
                        className={`w-6 h-6 rounded-md items-center justify-center ${
                            showHabitRadius ? 'bg-[#2D8A5B]' : 'bg-foreground/10'
                        }`}
                    >
                        {showHabitRadius && <Iconify icon="heroicons:check" size={16} color="#FFFFFF"/>}
                    </View>
                </Pressable>
            </AppBottomSheet>

            {/* DETAILS SHEET */}
            <AppBottomSheet
                isVisible={!!sheet}
                onClose={() => setSheet(null)}
                snapPoints={['48%', '78%']}
            >
                {sheet?.kind === 'venue' && <VenueSheet venue={sheet.venue}/>}
                {sheet?.kind === 'cluster' && (
                    <View>
                        <AppText variant="h3" className="text-text-primary font-bold mb-1">
                            {sheet.cluster.label}
                        </AppText>
                        <AppText variant="body-small" className="text-text-secondary mb-4">
                            {formatINR(sheet.cluster.amount)} · {sheet.cluster.venues.length} places
                        </AppText>
                        {sheet.cluster.venues.map((v) => (
                            <Pressable
                                key={v.venueId}
                                onPress={() => setSheet({kind: 'venue', venue: v})}
                                className="flex-row items-center justify-between py-3 border-b border-foreground/10"
                            >
                                <View className="flex-1 pr-3">
                                    <AppText variant="body-base" className="text-text-primary font-semibold">
                                        {CATEGORY_META[v.category].icon} {v.venueName}
                                    </AppText>
                                    <AppText variant="body-xs" className="text-text-secondary">
                                        {v.visits} visit{v.visits === 1 ? '' : 's'} · {v.neighborhood}
                                    </AppText>
                                </View>
                                <AppText variant="body-base" className="font-bold text-text-primary">
                                    {formatINR(v.amount)}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                )}
            </AppBottomSheet>

            {/* TRIP MEMORY MODAL */}
            <Modal visible={!!selectedTrip} transparent animationType="fade" onRequestClose={() => setTripId(null)}>
                <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={() => setTripId(null)}>
                    {selectedTrip && selectedTripStats && (
                        <Pressable className="rounded-3xl bg-[#1C1914] p-5 border border-[#F4C15D]/40" onPress={() => {
                        }}>
                            <AppText variant="body-xs" className="text-[#F4C15D]">
                                Trip memory
                            </AppText>
                            <AppText variant="h2" className="text-white font-bold mt-1">
                                {selectedTrip.headline}
                            </AppText>
                            <AppText variant="body-small" className="text-white/80 mt-2">
                                {formatINR(selectedTripStats.amount)} spent across {selectedTripStats.days} day
                                {selectedTripStats.days === 1 ? '' : 's'}
                            </AppText>
                            <Pressable
                                onPress={() => setTripId(null)}
                                className="mt-5 self-end rounded-full bg-[#F4C15D] px-4 py-2"
                            >
                                <AppText variant="body-small" className="text-black font-bold">
                                    Close
                                </AppText>
                            </Pressable>
                        </Pressable>
                    )}
                </Pressable>
            </Modal>
        </View>
    );
}

// Marker component with view-tracking isolation
function OptimizedMarker({
                             coordinate,
                             onPress,
                             children,
                         }: {
    coordinate: { latitude: number; longitude: number };
    onPress: () => void;
    children: React.ReactNode;
}) {
    const [tracksView, setTracksView] = useState(true);

    useEffect(() => {
        setTracksView(true);
        const timer = setTimeout(() => setTracksView(false), 200);
        return () => clearTimeout(timer);
    }, [coordinate]);

    return (
        <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={tracksView} anchor={{x: 0.5, y: 0.5}}>
            {children}
        </Marker>
    );
}

function CategoryPin({venue}: { venue: VenueAgg }) {
    const meta = CATEGORY_META[venue.category];
    return (
        <View
            style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: meta.color,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
            }}
        >
            <AppText style={{fontSize: 13}}>{meta.icon}</AppText>
        </View>
    );
}

interface NumberedTrailBadgeProps {
    step: number;
    total: number;
    timestamp: string;
    venueName: string;
    isFirst: boolean;
    isLast: boolean;
}

function NumberedTrailBadge({
                                step,
                                timestamp,
                                venueName,
                                isFirst,
                                isLast,
                            }: NumberedTrailBadgeProps) {
    const timeFormatted = new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    // Badge styling reflecting Start / In-Transit / End status
    const badgeBg = isFirst ? '#2D8A5B' : isLast ? '#E14B4B' : '#1A1A1A';
    const borderColor = isFirst ? '#7CFFB2' : isLast ? '#FF7A45' : '#F4C15D';

    return (
        <View className="items-center">
            {/* Main Sequence Number Badge */}
            <View
                style={{
                    backgroundColor: badgeBg,
                    borderColor: borderColor,
                }}
                className="flex-row items-center rounded-full border-2 px-2.5 py-1 shadow-md"
            >
                {/* Step Number Circle */}
                <View className="w-5 h-5 rounded-full bg-white/20 items-center justify-center mr-1.5">
                    <AppText style={{fontSize: 10}} className="text-white font-extrabold">
                        {step}
                    </AppText>
                </View>

                {/* Status Indicator / Time */}
                <View>
                    <AppText style={{fontSize: 10}} className="text-white font-bold leading-tight">
                        {isFirst ? 'START' : isLast ? 'END' : timeFormatted}
                    </AppText>
                </View>

                {/* Direction indicator arrow for intermediate stops */}
                {!isLast && (
                    <Iconify
                        icon="heroicons:arrow-right"
                        size={12}
                        color={borderColor}
                        className="ml-1"
                    />
                )}
            </View>

            {/* Optional Small Venue Callout Label below step pin */}
            <View className="mt-1 bg-black/80 px-2 py-0.5 rounded-md border border-white/10">
                <AppText style={{fontSize: 9}} className="text-white/90 font-medium" numberOfLines={1}>
                    {venueName}
                </AppText>
            </View>
        </View>
    );
}

function ClusterPin({cluster}: { cluster: MapCluster }) {
    return (
        <View className="rounded-2xl bg-[#2D8A5B] px-2.5 py-1 items-center shadow-md border border-white/20">
            <AppText variant="body-xs" className="text-white font-bold">
                {cluster.label}
            </AppText>
            <AppText variant="caption-xs" className="text-white/90">
                {formatINR(cluster.amount)}
            </AppText>
        </View>
    );
}

function Chip({label, active, onPress}: { label: string; active: boolean; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            className={`px-3 py-1.5 rounded-full mr-2 ${active ? 'bg-[#2D8A5B]' : 'bg-black/75'}`}
        >
            <AppText variant="body-xs" className="text-white font-semibold">
                {label}
            </AppText>
        </Pressable>
    );
}

function VenueSheet({venue}: { venue: VenueAgg }) {
    const meta = CATEGORY_META[venue.category];
    return (
        <View>
            <AppText variant="h3" className="text-text-primary font-bold">
                {meta.icon} {venue.venueName}
            </AppText>
            <AppText variant="body-small" className="text-text-secondary mt-1 mb-4">
                {venue.neighborhood} · {meta.label} · {venue.visits} visit{venue.visits === 1 ? '' : 's'}
            </AppText>
            <AppText variant="h4" className="text-text-primary font-bold mb-3">
                {formatINR(venue.amount)}
            </AppText>
            {venue.txns
                .slice()
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((txn) => (
                    <TxnRow key={txn.id} txn={txn}/>
                ))}
        </View>
    );
}

function TxnRow({txn}: { txn: ExpenseTxn }) {
    const when = new Date(txn.at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
    return (
        <View className="py-3 border-b border-foreground/10">
            <View className="flex-row justify-between">
                <AppText variant="body-small" className="text-text-primary font-semibold">
                    {when}
                </AppText>
                <AppText variant="body-small" className="text-text-primary font-bold">
                    {formatINR(txn.amount)}
                </AppText>
            </View>
        </View>
    );
}

function formatTrailDay(isoDate: string) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
}

const styles = StyleSheet.create({
    chipRow: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignItems: 'center',
    },
});

export default RegionalExpenseMap;
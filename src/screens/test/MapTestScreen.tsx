import React, {useCallback, useMemo, useRef, useState} from 'react';
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
    dayKey,
    filterTxns,
    formatINR,
    isCoordInRegion,
    neighborhoodTotals,
    trailDays,
    tripSpend,
    visitCountsFrom,
    weekdayHourPeak,
} from '@/src/screens/test/spatial-map/spatialMapUtils';

type MarkerMode = 'all' | 'frequent' | 'unique';
type SheetTarget =
    | {kind: 'venue'; venue: VenueAgg}
    | {kind: 'cluster'; cluster: MapCluster};

const TRAIL_COLOR = '#F4C15D';

export function RegionalExpenseMap() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState<Region>(BANGALORE_REGION);
    const [monthId, setMonthId] = useState<string>('all');
    const [markerMode, setMarkerMode] = useState<MarkerMode>('all');
    const [trailDate, setTrailDate] = useState<string | null>('2026-09-18');
    const [showHabit, setShowHabit] = useState(true);
    const [sheet, setSheet] = useState<SheetTarget | null>(null);
    const [tripId, setTripId] = useState<string | null>(null);

    const visitCounts = useMemo(() => visitCountsFrom(DUMMY_TXNS), []);
    const scopedTxns = useMemo(
        () => filterTxns(DUMMY_TXNS, monthId, markerMode, visitCounts),
        [monthId, markerMode, visitCounts],
    );

    const visibleTxns = useMemo(
        () => scopedTxns.filter((t) => isCoordInRegion(t.latitude, t.longitude, region)),
        [scopedTxns, region],
    );

    const visibleVenues = useMemo(() => aggregateVenues(visibleTxns), [visibleTxns]);
    const clusters = useMemo(() => clusterVenues(visibleVenues, region), [visibleVenues, region]);
    const showVenuePins = region.latitudeDelta < 0.035;

    const visibleTotal = useMemo(
        () => visibleTxns.reduce((s, t) => s + t.amount, 0),
        [visibleTxns],
    );

    const peak = useMemo(() => weekdayHourPeak(visibleTxns), [visibleTxns]);
    const zones = useMemo(() => neighborhoodTotals(visibleTxns).slice(0, 3), [visibleTxns]);
    const topMerchants = visibleVenues.slice(0, 3);
    const days = useMemo(() => trailDays(scopedTxns), [scopedTxns]);
    const activeTrail = days.find((d) => d.date === trailDate)?.txns ?? [];

    const heatPoints = useMemo(
        () =>
            scopedTxns
                .filter((t) => isCoordInRegion(t.latitude, t.longitude, region))
                .map((t) => ({
                    latitude: t.latitude,
                    longitude: t.longitude,
                    weight: Math.max(1, t.amount / 400),
                })),
        [scopedTxns, region],
    );

    const selectedTrip = TRIPS.find((t) => t.id === tripId) ?? null;
    const selectedTripStats = selectedTrip ? tripSpend(DUMMY_TXNS, selectedTrip.id) : null;

    const onRegionChangeComplete = useCallback((next: Region) => setRegion(next), []);

    const recenter = useCallback(() => {
        mapRef.current?.animateToRegion(BANGALORE_REGION, 650);
    }, []);

    const flyToTrip = useCallback((id: string) => {
        const trip = TRIPS.find((t) => t.id === id);
        if (!trip) return;
        mapRef.current?.animateToRegion(
            {
                latitude: trip.latitude,
                longitude: trip.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
            },
            800,
        );
        setTripId(id);
    }, []);

    const openCluster = (cluster: MapCluster) => {
        if (cluster.venues.length === 1) {
            setSheet({kind: 'venue', venue: cluster.venues[0]});
            return;
        }
        if (region.latitudeDelta > 0.04) {
            mapRef.current?.animateToRegion(
                {
                    latitude: cluster.latitude,
                    longitude: cluster.longitude,
                    latitudeDelta: 0.025,
                    longitudeDelta: 0.025,
                },
                400,
            );
        }
        setSheet({kind: 'cluster', cluster});
    };

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
                {heatPoints.length > 0 && (
                    <Heatmap
                        points={heatPoints}
                        radius={40}
                        opacity={0.55}
                        gradient={{
                            colors: ['#7CFFB2', '#F4C15D', '#FF7A45', '#E14B4B'],
                            startPoints: [0.1, 0.4, 0.7, 1],
                            colorMapSize: 256,
                        }}
                    />
                )}

                {showHabit && (
                    <Circle
                        center={HOME}
                        radius={HABIT_RADIUS_M}
                        strokeColor="rgba(45,138,91,0.55)"
                        fillColor="rgba(45,138,91,0.10)"
                        strokeWidth={2}
                    />
                )}

                {!showVenuePins &&
                    clusters.map((cluster) => (
                        <Circle
                            key={`blob-${cluster.id}`}
                            center={{latitude: cluster.latitude, longitude: cluster.longitude}}
                            radius={Math.min(1800, 500 + cluster.amount / 8)}
                            strokeColor="rgba(224,122,61,0.0)"
                            fillColor="rgba(224,122,61,0.18)"
                        />
                    ))}

                {activeTrail.length > 1 && (
                    <Polyline
                        coordinates={activeTrail.map((t) => ({
                            latitude: t.latitude,
                            longitude: t.longitude,
                        }))}
                        strokeColor={TRAIL_COLOR}
                        strokeWidth={4}
                        lineDashPattern={[1, 0]}
                    />
                )}

                {showVenuePins
                    ? visibleVenues.map((venue) => (
                          <Marker
                              key={venue.venueId}
                              coordinate={{latitude: venue.latitude, longitude: venue.longitude}}
                              onPress={() => setSheet({kind: 'venue', venue})}
                              tracksViewChanges={false}
                              anchor={{x: 0.5, y: 0.5}}
                          >
                              <CategoryPin venue={venue} pulse={venue.visits >= 3} />
                          </Marker>
                      ))
                    : clusters.map((cluster) => (
                          <Marker
                              key={cluster.id}
                              coordinate={{latitude: cluster.latitude, longitude: cluster.longitude}}
                              onPress={() => openCluster(cluster)}
                              tracksViewChanges={false}
                              anchor={{x: 0.5, y: 1}}
                          >
                              <ClusterPin cluster={cluster} />
                          </Marker>
                      ))}

                {TRIPS.map((trip) => {
                    if (!isCoordInRegion(trip.latitude, trip.longitude, region) && region.latitudeDelta < 8) {
                        return null;
                    }
                    return (
                        <Marker
                            key={trip.id}
                            coordinate={{latitude: trip.latitude, longitude: trip.longitude}}
                            onPress={() => setTripId(trip.id)}
                            tracksViewChanges={false}
                        >
                            <View className="rounded-2xl bg-[#1A1A1A] px-2.5 py-1.5 border border-[#F4C15D]">
                                <AppText variant="body-xs" className="text-[#F4C15D] font-bold">
                                    ✈ {trip.city}
                                </AppText>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={{paddingTop: insets.top + 8}} pointerEvents="box-none" className="absolute left-0 right-0 top-0">
                <View className="mx-3 rounded-2xl bg-black/70 px-4 py-3">
                    <AppText variant="body-xs" className="text-white/70">
                        Visible map area
                    </AppText>
                    <AppText variant="h4" className="text-white font-bold mt-0.5">
                        {formatINR(visibleTotal)} across {visibleTxns.length} transaction
                        {visibleTxns.length === 1 ? '' : 's'}
                    </AppText>
                    {peak && (
                        <AppText variant="body-xs" className="text-[#F4C15D] mt-1">
                            {peak.copy}
                        </AppText>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-2"
                    contentContainerStyle={styles.chipRow}
                >
                    {(['all', 'frequent', 'unique'] as MarkerMode[]).map((mode) => (
                        <Chip
                            key={mode}
                            active={markerMode === mode}
                            label={mode === 'all' ? 'All spots' : mode === 'frequent' ? 'Hubs' : 'Uncharted'}
                            onPress={() => setMarkerMode(mode)}
                        />
                    ))}
                    <Chip active={showHabit} label="Habit radius" onPress={() => setShowHabit((v) => !v)} />
                    {TRIPS.map((trip) => (
                        <Chip
                            key={trip.id}
                            active={tripId === trip.id}
                            label={`${trip.city} trip`}
                            onPress={() => flyToTrip(trip.id)}
                        />
                    ))}
                </ScrollView>
            </View>

            <View className="absolute right-3" style={{top: insets.top + 118}}>
                <Pressable
                    onPress={recenter}
                    className="w-12 h-12 rounded-full bg-bg-primary-lighter dark:bg-bg-overlay items-center justify-center shadow-lg shadow-black/30 elevation-6"
                >
                    <Iconify icon="heroicons:map-pin" size={22} color="#2D8A5B" />
                </Pressable>
            </View>

            {zones.length >= 2 && (
                <View className="absolute left-3 right-16 rounded-2xl bg-black/65 px-3 py-2.5" style={{top: insets.top + 118}}>
                    <AppText variant="body-xs" className="text-white/70 mb-1">
                        Zone comparison
                    </AppText>
                    {zones.map((z, i) => (
                        <View key={z.name} className="flex-row justify-between items-center">
                            <AppText variant="body-xs" className="text-white">
                                {i === 0 ? '▲' : i === 1 ? '◆' : '·'} {z.name}
                            </AppText>
                            <AppText variant="body-xs" className="text-white font-bold">
                                {formatINR(z.amount)}
                            </AppText>
                        </View>
                    ))}
                </View>
            )}

            <View className="absolute left-0 right-0" style={{bottom: insets.bottom + 8}} pointerEvents="box-none">
                {topMerchants.length > 0 && (
                    <View className="mx-3 mb-2 rounded-2xl bg-black/70 px-3 py-2.5">
                        <AppText variant="body-xs" className="text-white/70 mb-1">
                            Top in this view
                        </AppText>
                        {topMerchants.map((m, i) => (
                            <Pressable
                                key={m.venueId}
                                onPress={() => setSheet({kind: 'venue', venue: m})}
                                className="flex-row items-center justify-between py-0.5"
                            >
                                <AppText variant="body-xs" className="text-white flex-1 pr-2">
                                    {i + 1}. {CATEGORY_META[m.category].icon} {m.venueName}
                                </AppText>
                                <AppText variant="body-xs" className="text-[#F4C15D] font-bold">
                                    {formatINR(m.amount)}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                )}

                {days.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipRow}
                    >
                        <Chip
                            active={trailDate === null}
                            label="Hide trail"
                            onPress={() => setTrailDate(null)}
                        />
                        {days.map((d) => (
                            <Chip
                                key={d.date}
                                active={trailDate === d.date}
                                label={`Trail ${formatTrailDay(d.date)}`}
                                onPress={() => setTrailDate(d.date)}
                            />
                        ))}
                    </ScrollView>
                )}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                    className="mt-1"
                >
                    {MONTH_FILTERS.map((m) => (
                        <Chip key={m.id} active={monthId === m.id} label={m.label} onPress={() => setMonthId(m.id)} />
                    ))}
                </ScrollView>
            </View>

            <AppBottomSheet
                isVisible={!!sheet}
                onClose={() => setSheet(null)}
                snapPoints={['48%', '78%']}
            >
                {sheet?.kind === 'venue' && <VenueSheet venue={sheet.venue} />}
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

            <Modal visible={!!selectedTrip} transparent animationType="fade" onRequestClose={() => setTripId(null)}>
                <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={() => setTripId(null)}>
                    {selectedTrip && selectedTripStats && (
                        <Pressable className="rounded-3xl bg-[#1C1914] p-5 border border-[#F4C15D]/40" onPress={() => {}}>
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
                            <AppText variant="body-small" className="text-[#F4C15D] mt-1">
                                Top spot: {selectedTrip.topSpot}
                            </AppText>
                            <View className="mt-4 gap-y-2">
                                {selectedTripStats.list.slice(0, 5).map((txn) => (
                                    <View key={txn.id} className="flex-row justify-between">
                                        <AppText variant="body-xs" className="text-white/85 flex-1 pr-2">
                                            {CATEGORY_META[txn.category].icon} {txn.venueName}
                                        </AppText>
                                        <AppText variant="body-xs" className="text-white font-bold">
                                            {formatINR(txn.amount)}
                                        </AppText>
                                    </View>
                                ))}
                            </View>
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

function CategoryPin({venue, pulse}: {venue: VenueAgg; pulse: boolean}) {
    const meta = CATEGORY_META[venue.category];
    const size = pulse ? 40 : venue.visits === 1 ? 30 : 34;
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: meta.color,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: pulse ? 3 : 2,
                borderColor: pulse ? '#F4C15D' : '#FFFFFF',
            }}
        >
            <AppText style={{fontSize: pulse ? 16 : 13}}>{meta.icon}</AppText>
        </View>
    );
}

function ClusterPin({cluster}: {cluster: MapCluster}) {
    return (
        <View className="rounded-2xl bg-[#2D8A5B] px-2.5 py-1.5 items-center shadow-md">
            <AppText variant="body-xs" className="text-white font-bold">
                {cluster.label}
            </AppText>
            <AppText variant="caption-xs" className="text-white/90">
                {formatINR(cluster.amount)}
            </AppText>
        </View>
    );
}

function Chip({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
    return (
        <Pressable
            onPress={onPress}
            className={`px-3 py-1.5 rounded-full mr-2 ${active ? 'bg-[#2D8A5B]' : 'bg-black/65'}`}
        >
            <AppText variant="body-xs" className="text-white font-semibold">
                {label}
            </AppText>
        </Pressable>
    );
}

function VenueSheet({venue}: {venue: VenueAgg}) {
    const meta = CATEGORY_META[venue.category];
    return (
        <View>
            <AppText variant="h3" className="text-text-primary font-bold">
                {meta.icon} {venue.venueName}
            </AppText>
            <AppText variant="body-small" className="text-text-secondary mt-1 mb-4">
                {venue.neighborhood} · {meta.label} · {venue.visits} visit{venue.visits === 1 ? '' : 's'}
                {venue.visits >= 3 ? ' · Frequent hub' : venue.visits === 1 ? ' · Uncharted' : ''}
            </AppText>
            <AppText variant="h4" className="text-text-primary font-bold mb-3">
                {formatINR(venue.amount)}
            </AppText>
            {venue.txns
                .slice()
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((txn) => (
                    <TxnRow key={txn.id} txn={txn} />
                ))}
        </View>
    );
}

function TxnRow({txn}: {txn: ExpenseTxn}) {
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
            <View className="flex-row mt-1 gap-x-2">
                {txn.receipt && (
                    <AppText variant="caption-xs" className="text-text-secondary">
                        Receipt
                    </AppText>
                )}
                {txn.split && (
                    <AppText variant="caption-xs" className="text-[#2D8A5B]">
                        Split bill
                    </AppText>
                )}
                {txn.note && (
                    <AppText variant="caption-xs" className="text-text-secondary">
                        {txn.note}
                    </AppText>
                )}
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

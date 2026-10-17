// src/screens/spatial-map/components/TrailLayer.tsx
import React, {useState, useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {Marker, Polyline} from 'react-native-maps';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';

export interface TrailTxn {
    id: string | number;
    latitude: number;
    longitude: number;
    venueName: string;
    at?: string;
    /** 1-based chronological index for badges + range filtering. */
    index?: number;
}

interface TrailLayerProps {
    activeTrail: TrailTxn[];
    /** Inclusive 1-based index range of stops to show. */
    indexMin?: number;
    indexMax?: number;
    onSelectTxn: (txn: TrailTxn) => void;
}

/** Daypart trail strokes — palette-adjacent accents (edit in COLORS to retheme). */
export const TIME_SLOT_COLORS = {
    morning: COLORS.light.accent.sky,
    afternoon: COLORS.light.status.warning,
    evening: COLORS.light.status.decrease,
    night: COLORS.light.icon.darker,
};

/**
 * Extract local hour safely across Hermes / JS engines without UTC offset shifts.
 */
function getHourFromTimestamp(timestamp?: string): number {
    if (!timestamp) return 9;

    const timeMatch = timestamp.match(/(?:T|\s)(\d{1,2}):(\d{2})/);
    if (timeMatch) {
        return parseInt(timeMatch[1], 10);
    }

    const hour = new Date(timestamp).getHours();
    return Number.isNaN(hour) ? 9 : hour;
}

export function getTimeSlotColor(timestamp?: string): string {
    const hour = getHourFromTimestamp(timestamp);

    if (hour >= 5 && hour < 12) return TIME_SLOT_COLORS.morning;
    if (hour >= 12 && hour < 17) return TIME_SLOT_COLORS.afternoon;
    if (hour >= 17 && hour < 21) return TIME_SLOT_COLORS.evening;
    return TIME_SLOT_COLORS.night;
}

function getMidpoint(
    p1: {latitude: number; longitude: number},
    p2: {latitude: number; longitude: number}
) {
    return {
        latitude: (p1.latitude + p2.latitude) / 2,
        longitude: (p1.longitude + p2.longitude) / 2,
    };
}

function NumberedMarker({
    txn,
    displayIndex,
    onSelectTxn,
}: {
    txn: TrailTxn;
    displayIndex: number;
    onSelectTxn: (txn: TrailTxn) => void;
}) {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);
    const hexColor = useMemo(() => getTimeSlotColor(txn.at), [txn.at]);

    useEffect(() => {
        const timer = setTimeout(() => setTracksViewChanges(false), 200);
        return () => clearTimeout(timer);
    }, [txn.id, displayIndex]);

    return (
        <Marker
            coordinate={{latitude: txn.latitude, longitude: txn.longitude}}
            title={`${displayIndex}. ${txn.venueName}`}
            tracksViewChanges={tracksViewChanges}
            anchor={{x: 0.5, y: 0.5}}
            onPress={() => onSelectTxn(txn)}
        >
            <View style={styles.markerContainer}>
                <View style={[styles.badgeContainer, {backgroundColor: hexColor}]}>
                    <AppText style={styles.badgeText}>{displayIndex}</AppText>
                </View>
            </View>
        </Marker>
    );
}

export function TrailLayer({
    activeTrail = [],
    indexMin = 1,
    indexMax,
    onSelectTxn,
}: TrailLayerProps) {
    const indexedTrail = useMemo(
        () =>
            activeTrail.map((txn, i) => ({
                ...txn,
                index: txn.index ?? i + 1,
            })),
        [activeTrail]
    );

    const visibleTrail = useMemo(() => {
        const hi = indexMax ?? indexedTrail.length;
        return indexedTrail.filter(
            (txn) => txn.index >= indexMin && txn.index <= hi
        );
    }, [indexedTrail, indexMin, indexMax]);

    const polylineSegments = useMemo(() => {
        if (visibleTrail.length < 2) return [];

        const segments = [];
        for (let i = 0; i < visibleTrail.length - 1; i++) {
            const start = visibleTrail[i];
            const end = visibleTrail[i + 1];

            if (
                start.latitude === end.latitude &&
                start.longitude === end.longitude
            ) {
                continue;
            }

            const startCoord = {
                latitude: start.latitude,
                longitude: start.longitude,
            };
            const endCoord = {
                latitude: end.latitude,
                longitude: end.longitude,
            };
            const midCoord = getMidpoint(startCoord, endCoord);

            segments.push({
                id: `trail-seg-${start.index}-${end.index}-a`,
                coords: [startCoord, midCoord],
                color: getTimeSlotColor(start.at),
            });

            segments.push({
                id: `trail-seg-${start.index}-${end.index}-b`,
                coords: [midCoord, endCoord],
                color: getTimeSlotColor(end.at),
            });
        }
        return segments;
    }, [visibleTrail]);

    if (visibleTrail.length === 0) return null;

    return (
        <>
            {polylineSegments.map((seg) => (
                <Polyline
                    key={seg.id}
                    coordinates={seg.coords}
                    strokeColor={seg.color}
                    strokeWidth={3.5}
                    lineDashPattern={[6, 3]}
                />
            ))}

            {visibleTrail.map((txn) => (
                <NumberedMarker
                    key={`static-trail-pin-${txn.id}-${txn.index}`}
                    txn={txn}
                    displayIndex={txn.index}
                    onSelectTxn={onSelectTxn}
                />
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    markerContainer: {
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    badgeContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.light.text.contrast,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.light.brand.primary,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.light.text.contrast,
        textAlign: 'center',
    },
});

// src/screens/spatial-map/components/TrailLayer.tsx
import React, {useState, useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {Marker, Polyline} from 'react-native-maps';
import {AppText} from '@/src/components/common/AppText';

export interface TrailTxn {
    id: string | number;
    latitude: number;
    longitude: number;
    venueName: string;
    at?: string;
}

interface TrailLayerProps {
    activeTrail: TrailTxn[];
    onSelectTxn: (txn: TrailTxn) => void;
}

export const TIME_SLOT_COLORS = {
    morning: '#4A90E2',
    afternoon: '#F5A623',
    evening: '#E14B4B',
    night: '#8B572A',
};

/**
 * Extract local hour safely across Hermes / JS engines without UTC offset shifts.
 */
function getHourFromTimestamp(timestamp?: string): number {
    if (!timestamp) {
        console.log('[TrailLayer Debug] getHourFromTimestamp: Missing timestamp -> default hour 9');
        return 9;
    }

    // 1. Try direct string parsing if time is formatted as HH:mm or THH:mm
    const timeMatch = timestamp.match(/(?:T|\s)(\d{1,2}):(\d{2})/);
    if (timeMatch) {
        const parsedHour = parseInt(timeMatch[1], 10);
        console.log(`[TrailLayer Debug] Regex parsed time '${timestamp}' -> hour: ${parsedHour}`);
        return parsedHour;
    }

    // 2. Fall back to Date parsing
    const date = new Date(timestamp);
    const hour = date.getHours();

    console.log(`[TrailLayer Debug] Date object parsed '${timestamp}' -> getHours(): ${hour}`);

    if (isNaN(hour)) {
        console.warn(`[TrailLayer Debug] Invalid Date from '${timestamp}' -> fallback hour 9`);
        return 9;
    }

    return hour;
}

export function getTimeSlotColor(timestamp?: string): string {
    const hour = getHourFromTimestamp(timestamp);
    let slot = 'morning';
    let color = TIME_SLOT_COLORS.morning;

    if (hour >= 5 && hour < 12) {
        slot = 'morning';
        color = TIME_SLOT_COLORS.morning;
    } else if (hour >= 12 && hour < 17) {
        slot = 'afternoon';
        color = TIME_SLOT_COLORS.afternoon;
    } else if (hour >= 17 && hour < 21) {
        slot = 'evening';
        color = TIME_SLOT_COLORS.evening;
    } else {
        slot = 'night';
        color = TIME_SLOT_COLORS.night;
    }

    console.log(`[TrailLayer Debug] getTimeSlotColor -> Raw: "${timestamp}" | Hour: ${hour} | Slot: ${slot} | Color: ${color}`);
    return color;
}

function getMidpoint(p1: { latitude: number; longitude: number }, p2: { latitude: number; longitude: number }) {
    return {
        latitude: (p1.latitude + p2.latitude) / 2,
        longitude: (p1.longitude + p2.longitude) / 2,
    };
}

function NumberedMarker({txn, idx, onSelectTxn}: { txn: TrailTxn; idx: number; onSelectTxn: (txn: TrailTxn) => void }) {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);
    const hexColor = useMemo(() => getTimeSlotColor(txn.at), [txn.at]);

    useEffect(() => {
        const timer = setTimeout(() => setTracksViewChanges(false), 200);
        return () => clearTimeout(timer);
    }, [txn.id, idx]);

    return (
        <Marker
            coordinate={{latitude: txn.latitude, longitude: txn.longitude}}
            title={`${idx + 1}. ${txn.venueName}`}
            tracksViewChanges={tracksViewChanges}
            anchor={{x: 0.5, y: 0.5}}
            onPress={() => onSelectTxn(txn)}
        >
            <View style={styles.markerContainer}>
                <View style={[styles.badgeContainer, {backgroundColor: hexColor}]}>
                    <AppText style={styles.badgeText}>{idx + 1}</AppText>
                </View>
            </View>
        </Marker>
    );
}

export function TrailLayer({activeTrail = [], onSelectTxn}: TrailLayerProps) {
    useEffect(() => {
        console.log('[TrailLayer Debug] ----------------------------------------');
        console.log(`[TrailLayer Debug] Active Trail length: ${activeTrail?.length ?? 0}`);
        if (activeTrail && activeTrail.length > 0) {
            console.log('[TrailLayer Debug] Trail Items Payload:', JSON.stringify(activeTrail.map(t => ({
                id: t.id,
                venueName: t.venueName,
                at: t.at
            })), null, 2));
        }
    }, [activeTrail]);

    const polylineSegments = useMemo(() => {
        if (!activeTrail || activeTrail.length < 2) return [];

        const segments = [];
        for (let i = 0; i < activeTrail.length - 1; i++) {
            const start = activeTrail[i];
            const end = activeTrail[i + 1];

            // Prevent rendering zero-distance polyline segments if locations match
            if (start.latitude === end.latitude && start.longitude === end.longitude) {
                continue;
            }

            const startCoord = {latitude: start.latitude, longitude: start.longitude};
            const endCoord = {latitude: end.latitude, longitude: end.longitude};
            const midCoord = getMidpoint(startCoord, endCoord);

            segments.push({
                id: `trail-seg-${i}-a`,
                coords: [startCoord, midCoord],
                color: getTimeSlotColor(start.at),
            });

            segments.push({
                id: `trail-seg-${i}-b`,
                coords: [midCoord, endCoord],
                color: getTimeSlotColor(end.at),
            });
        }
        return segments;
    }, [activeTrail]);

    if (!activeTrail || activeTrail.length === 0) return null;

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

            {activeTrail.map((txn, idx) => (
                <NumberedMarker
                    key={`static-trail-pin-${txn.id}-${idx}`}
                    txn={txn}
                    idx={idx}
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
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
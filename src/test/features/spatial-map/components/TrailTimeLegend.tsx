// src/screens/spatial-map/components/TrailTimeLegend.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { TIME_SLOT_COLORS } from '@/src/test/features/spatial-map/components/TrailLayer';

const LEGEND_ITEMS = [
    { label: 'Morning (5 - 12)', color: TIME_SLOT_COLORS.morning },
    { label: 'Afternoon (12 - 17)', color: TIME_SLOT_COLORS.afternoon },
    { label: 'Evening (17 - 21)', color: TIME_SLOT_COLORS.evening },
    { label: 'Night (21 - 5)', color: TIME_SLOT_COLORS.night },
];

export function TrailTimeLegend() {
    return (
        <View style={styles.container}>
            {LEGEND_ITEMS.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <AppText style={styles.legendText}>{item.label}</AppText>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 110,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(26, 26, 26, 0.92)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
        marginHorizontal: 4,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    legendText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
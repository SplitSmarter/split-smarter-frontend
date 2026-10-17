import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {AppText} from '@/src/components/common/AppText';
import type {PlaceAnalyticsBundle} from '@/src/api/dto/expense/place_analytics';
import {PLATINUM_HEADER} from '@/src/constants/colors';
import {formatINR} from '../../utils/spatialMap.utils';

/** Explicit white tones — NativeWind opacity utilities are unreliable on metallic chrome. */
const HERO = {
    label: 'rgba(255, 255, 255, 0.72)',
    muted: 'rgba(255, 255, 255, 0.55)',
    value: '#FFFFFF',
    chipBorder: 'rgba(255, 255, 255, 0.22)',
    chipBg: 'rgba(255, 255, 255, 0.12)',
    cellBorder: 'rgba(255, 255, 255, 0.14)',
    cellBg: 'rgba(255, 255, 255, 0.10)',
} as const;

interface SummaryHeroProps {
    analytics: PlaceAnalyticsBundle;
    rangeLabel: string;
}

export function SummaryHero({analytics, rangeLabel}: SummaryHeroProps) {
    const s = analytics.summary;
    if (!s) return null;

    const gradient = [PLATINUM_HEADER.light, PLATINUM_HEADER.mid, PLATINUM_HEADER.dark] as const;

    return (
        <LinearGradient
            colors={[...gradient]}
            start={{x: 0.05, y: 0}}
            end={{x: 0.95, y: 1}}
            style={styles.hero}
        >
            <View className="flex-row items-start justify-between gap-x-3">
                <Text style={[styles.label, styles.labelFlex]}>Your total share</Text>
                <View
                    className="rounded-full px-2.5 py-1"
                    style={{backgroundColor: HERO.chipBg, borderWidth: 1, borderColor: HERO.chipBorder}}
                >
                    <Text style={styles.chipText}>{rangeLabel}</Text>
                </View>
            </View>

            <AppText
                variant="h2"
                className="mt-2 font-extrabold tracking-tight"
                style={{color: HERO.value}}
            >
                {formatINR(s.shared_inr)}
            </AppText>

            {s.share_of_spend > 0 ? (
                <Text style={styles.shareLine}>
                    {(s.share_of_spend * 100).toFixed(1)}% of range spend
                </Text>
            ) : null}

            <View className="mt-5 flex-row gap-2">
                {[
                    {label: 'Paid', value: formatINR(s.paid_inr)},
                    {label: 'Visits', value: String(s.visit_count)},
                    {label: 'Avg', value: formatINR(s.avg_per_visit_inr)},
                ].map((stat) => (
                    <View
                        key={stat.label}
                        className="flex-1 rounded-2xl px-2.5 py-2.5"
                        style={{
                            backgroundColor: HERO.cellBg,
                            borderWidth: 1,
                            borderColor: HERO.cellBorder,
                        }}
                    >
                        <Text style={styles.statLabel}>{stat.label}</Text>
                        <Text style={styles.statValue} numberOfLines={1}>
                            {stat.value}
                        </Text>
                    </View>
                ))}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    hero: {
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingVertical: 22,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        color: HERO.label,
    },
    labelFlex: {
        flex: 1,
    },
    chipText: {
        fontSize: 10,
        fontWeight: '600',
        color: HERO.value,
    },
    shareLine: {
        marginTop: 6,
        fontSize: 11,
        fontWeight: '500',
        color: HERO.muted,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: HERO.muted,
    },
    statValue: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '700',
        color: HERO.value,
    },
});

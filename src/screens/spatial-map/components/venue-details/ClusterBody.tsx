import React, {useMemo, useState} from 'react';
import {View, Pressable, TextInput, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {MapDateRange, PlaceAgg} from '../../types/spatialMap.types';
import {formatINR} from '../../utils/spatialMap.utils';
import {CLUSTER_DIST_COLORS} from './constants';
import {formatRangeLabel, getUniqueCategoryIcons} from './utils';
import {CategoryIconList} from './CategoryIconList';
import {ClusterQuickActionsRow} from './QuickActionsRow';
import {SectionLabel} from './SectionLabel';
import {SurfaceCard} from './SurfaceCard';

interface ClusterBodyProps {
    venues: PlaceAgg[];
    dateRange: MapDateRange;
    onSelectVenue: (venue: PlaceAgg) => void;
}

export function ClusterBody({venues, dateRange, onSelectVenue}: ClusterBodyProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const [query, setQuery] = useState('');

    const totalSpend = useMemo(
        () => venues.reduce((sum, v) => sum + (v.totalAmount || 0), 0),
        [venues]
    );

    const sorted = useMemo(
        () => [...venues].sort((a, b) => b.totalAmount - a.totalAmount),
        [venues]
    );

    const top = sorted[0];
    const mostFrequent = useMemo(
        () => [...venues].sort((a, b) => b.expensesCount - a.expensesCount)[0],
        [venues]
    );

    const rangeLabel = formatRangeLabel(dateRange, '', '');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter(
            (v) =>
                v.placeName.toLowerCase().includes(q) ||
                (v.address ?? '').toLowerCase().includes(q)
        );
    }, [sorted, query]);

    const gradient = [PLATINUM_HEADER.light, PLATINUM_HEADER.mid, PLATINUM_HEADER.dark] as const;

    return (
        <View className="gap-y-6">
            <LinearGradient
                colors={[...gradient]}
                start={{x: 0.05, y: 0}}
                end={{x: 0.95, y: 1}}
                style={styles.hero}
            >
                <View className="flex-row items-center justify-between">
                    <AppText
                        variant="caption-xs"
                        className="font-semibold uppercase tracking-[1.4px] text-white/65"
                    >
                        Combined spend
                    </AppText>
                    <AppText variant="caption-xs" className="font-medium text-white/55">
                        {rangeLabel}
                    </AppText>
                </View>
                <AppText variant="h2" className="mt-2 font-extrabold tracking-tight text-white">
                    {formatINR(totalSpend)}
                </AppText>

                {top ? (
                    <View className="mt-3 flex-row items-center gap-x-1.5">
                        <Iconify icon="heroicons:trophy" size={13} color="#FBBF24" />
                        <AppText
                            variant="caption-xs"
                            className="flex-1 font-medium text-white/80"
                            numberOfLines={1}
                        >
                            Top · {top.placeName} ({formatINR(top.totalAmount)})
                        </AppText>
                    </View>
                ) : null}

                <View className="mt-5 gap-y-2">
                    <View className="flex-row justify-between">
                        <AppText variant="caption-xs" className="text-white/50">
                            Distribution
                        </AppText>
                        <AppText variant="caption-xs" className="text-white/50">
                            {venues.length} places
                        </AppText>
                    </View>
                    <View className="h-2.5 flex-row overflow-hidden rounded-full bg-white/10">
                        {sorted.map((v, i) => {
                            const pct = totalSpend > 0 ? (v.totalAmount / totalSpend) * 100 : 0;
                            if (pct < 0.5) return null;
                            return (
                                <View
                                    key={v.placeId}
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor:
                                            CLUSTER_DIST_COLORS[i % CLUSTER_DIST_COLORS.length],
                                        marginLeft: i > 0 ? 1.5 : 0,
                                    }}
                                />
                            );
                        })}
                    </View>
                </View>
            </LinearGradient>

            <ClusterQuickActionsRow />

            <View>
                <SectionLabel
                    trailing={
                        <View className="min-w-[140px] flex-1 flex-row items-center rounded-full border border-border-input bg-bg-canvas px-3 py-2">
                            <Iconify
                                icon="heroicons:magnifying-glass"
                                size={14}
                                color={colors.icon.lighter}
                            />
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search"
                                placeholderTextColor={colors.text.placeholder}
                                className="ml-2 flex-1 py-0 text-xs text-text-primary"
                            />
                        </View>
                    }
                >
                    Venues
                </SectionLabel>

                <SurfaceCard>
                    {filtered.map((v, index) => {
                        const pct =
                            totalSpend > 0
                                ? Math.round((v.totalAmount / totalSpend) * 100)
                                : 0;
                        const isTop = top?.placeId === v.placeId;
                        const isFrequent = mostFrequent?.placeId === v.placeId && !isTop;
                        const tag = isTop
                            ? 'Top spend'
                            : isFrequent
                              ? 'Most visits'
                              : null;
                        const icons = getUniqueCategoryIcons(v.expenses);
                        const isLast = index === filtered.length - 1;

                        return (
                            <Pressable
                                key={v.placeId}
                                onPress={() => onSelectVenue(v)}
                                className={`flex-row items-center px-4 py-4 active:opacity-80 ${
                                    isLast ? '' : 'border-b border-border-input'
                                }`}
                            >
                                <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-bg-primary">
                                    {icons.length > 0 ? (
                                        <CategoryIconList icons={icons} size={20} />
                                    ) : (
                                        <Iconify
                                            icon="heroicons:map-pin"
                                            size={18}
                                            color={colors.icon.primary}
                                        />
                                    )}
                                </View>
                                <View className="min-w-0 flex-1 pr-3">
                                    <AppText
                                        variant="body-base"
                                        className="font-semibold text-text-primary"
                                        numberOfLines={1}
                                    >
                                        {v.placeName}
                                    </AppText>
                                    <AppText
                                        variant="body-small"
                                        className="mt-0.5 text-text-primary-lighter"
                                        numberOfLines={1}
                                    >
                                        {v.expensesCount} visit
                                        {v.expensesCount === 1 ? '' : 's'}
                                        {tag ? ` · ${tag}` : ''}
                                    </AppText>
                                </View>
                                <View className="items-end">
                                    <AppText
                                        variant="body-base"
                                        className="font-bold text-text-primary"
                                    >
                                        {formatINR(v.totalAmount)}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-0.5 text-text-primary-lighter"
                                    >
                                        {pct}%
                                    </AppText>
                                </View>
                            </Pressable>
                        );
                    })}
                </SurfaceCard>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingVertical: 22,
    },
});

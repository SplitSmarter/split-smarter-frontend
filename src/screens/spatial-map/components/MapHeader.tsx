import React from 'react';
import {
    View,
    Pressable,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppInput} from '@/src/components/common/AppInput';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import type {LocationDetails} from '@/src/api/dto/user/place';
import {calculateDistance} from '@/src/utils/place/distance';
import {DisplayView, MapDateRange} from '../types/spatialMap.types';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {DisplayViewFab} from './DisplayViewFab';
import {TrailTimeLegend} from './TrailTimeLegend';

interface MapHeaderProps {
    insetsTop: number;
    searchQuery: string;
    isSearching: boolean;
    searchResults: LocationDetails[];
    location: {latitude: number; longitude: number} | null;
    onSearchTextChange: (text: string) => void;
    onClearSearch: () => void;
    onSelectResult: (item: LocationDetails) => void;
    defaultImage: string;
    dateRange: MapDateRange;
    onOpenDateRange: () => void;
    viewportTotal: number;
    viewportPlaceCount: number;
    selectedMemoryTitle?: string | null;
    /** Tap the memory chip to re-center on that trip’s places. */
    onPressMemoryChip?: () => void;
    displayView: DisplayView;
    onSelectDisplayView: (view: DisplayView) => void;
    onOpenMemories: () => void;
    onInteraction?: () => void;
}

function formatRangeLabel(dateRange: MapDateRange): string {
    if (!dateRange) return 'All time';
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };
    return `${fmt(dateRange.startDate)} – ${fmt(dateRange.endDate)}`;
}

export function MapHeader({
    insetsTop,
    searchQuery,
    isSearching,
    searchResults,
    location,
    onSearchTextChange,
    onClearSearch,
    onSelectResult,
    defaultImage,
    dateRange,
    onOpenDateRange,
    viewportTotal,
    viewportPlaceCount,
    selectedMemoryTitle,
    onPressMemoryChip,
    displayView,
    onSelectDisplayView,
    onOpenMemories,
    onInteraction,
}: MapHeaderProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const iconPrimary = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    return (
        <View
            style={{paddingTop: insetsTop + 8}}
            className="absolute top-0 left-0 right-0 z-10 px-4"
            pointerEvents="box-none"
        >
            <View className="rounded-3xl border border-border-input bg-bg-canvas/95 px-3 pb-3 pt-2.5 shadow-sm shadow-black/10">
                <View className="flex-row items-center gap-2">
                    <View className="min-w-0 flex-1">
                        <AppInput
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChangeText={(text) => {
                                onInteraction?.();
                                onSearchTextChange(text);
                            }}
                            renderLeftIcon={(color) => (
                                <Iconify
                                    icon="heroicons:magnifying-glass"
                                    size={20}
                                    color={color}
                                />
                            )}
                            renderRightIcon={(color) => {
                                if (isSearching) {
                                    return (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.accent.sky}
                                        />
                                    );
                                }
                                if (searchQuery.length > 0) {
                                    return (
                                        <Pressable
                                            onPress={() => {
                                                onInteraction?.();
                                                onClearSearch();
                                            }}
                                        >
                                            <Iconify
                                                icon="heroicons:x-mark"
                                                size={20}
                                                color={color}
                                            />
                                        </Pressable>
                                    );
                                }
                                return null;
                            }}
                        />
                    </View>

                    <Pressable
                        onPress={() => {
                            onInteraction?.();
                            onOpenDateRange();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Select date range"
                        className="h-12 min-w-[72px] items-center justify-center rounded-2xl border border-border-input bg-bg-primary px-2.5 active:opacity-75"
                    >
                        <Iconify
                            icon="heroicons:calendar-days"
                            size={18}
                            color={iconPrimary}
                        />
                        <AppText
                            variant="caption-xs"
                            className="mt-0.5 text-center font-semibold text-text-primary-lighter"
                            numberOfLines={1}
                        >
                            {formatRangeLabel(dateRange)}
                        </AppText>
                    </Pressable>
                </View>

                <View className="mt-2.5 flex-row items-center justify-between px-0.5">
                    <View className="min-w-0 flex-1 flex-row items-baseline gap-x-2">
                        <AppText
                            variant="body-base"
                            className="font-bold text-text-primary"
                        >
                            ₹{viewportTotal.toLocaleString('en-IN')}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="font-medium text-text-primary-lighter"
                        >
                            in view
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="text-text-primary-lighter"
                        >
                            ·
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="font-medium text-text-primary-lighter"
                        >
                            {viewportPlaceCount}{' '}
                            {viewportPlaceCount === 1 ? 'place' : 'places'}
                        </AppText>
                    </View>
                    {selectedMemoryTitle ? (
                        <Pressable
                            onPress={() => {
                                onInteraction?.();
                                onPressMemoryChip?.();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Show ${selectedMemoryTitle} on map`}
                            className="ml-2 max-w-[40%] rounded-full bg-accent-sky-bg px-2.5 py-1 active:opacity-80"
                        >
                            <AppText
                                variant="caption-xs"
                                className="font-semibold text-accent-sky"
                                numberOfLines={1}
                            >
                                {selectedMemoryTitle}
                            </AppText>
                        </Pressable>
                    ) : null}
                </View>

            </View>

            <View className="mt-2">
                <DisplayViewFab
                    displayView={displayView}
                    onSelectDisplayView={(view) => {
                        onInteraction?.();
                        onSelectDisplayView(view);
                    }}
                    onOpenMemories={() => {
                        onInteraction?.();
                        onOpenMemories();
                    }}
                    leading={
                        displayView === 'trail' ? <TrailTimeLegend /> : null
                    }
                />
            </View>

            {searchResults.length > 0 ? (
                <View className="mt-2 max-h-[340px] overflow-hidden rounded-[24px] border border-border-input bg-bg-primary-lighter shadow-lg shadow-black/15 elevation-8 dark:bg-bg-canvas">
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) =>
                            item.provider_id?.toString() || index.toString()
                        }
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{paddingVertical: 4}}
                        renderItem={({item}) => {
                            const distanceData = location
                                ? calculateDistance(
                                      location.latitude,
                                      location.longitude,
                                      item.geo.latitude,
                                      item.geo.longitude
                                  )
                                : null;

                            const imageUrl =
                                item.photos && item.photos.length > 0
                                    ? item.photos[0].url
                                    : defaultImage;

                            const imageId =
                                item.photos && item.photos.length > 0
                                    ? String(item.photos[0].id)
                                    : `fallback_${item.provider_id || item.name.replace(/\s+/g, '')}`;

                            return (
                                <Pressable
                                    onPress={() => {
                                        onInteraction?.();
                                        onSelectResult(item);
                                    }}
                                    className="border-b border-black/[0.06] px-4 py-3 active:bg-bg-primary-darker dark:border-white/[0.06] dark:active:bg-bg-primary-darker"
                                >
                                    <View className="w-full flex-row items-center justify-between">
                                        <View className="h-[56px] w-[56px] overflow-hidden rounded-[16px] bg-bg-primary-darker">
                                            <AppImageV2
                                                id={imageId}
                                                url={imageUrl}
                                                style={{width: '100%', height: '100%'}}
                                                contentFit="cover"
                                                fallbackComponent={
                                                    <EntityFallbackIcon
                                                        kind="place"
                                                        size={24}
                                                        color={colors.icon.lighter}
                                                    />
                                                }
                                            />
                                        </View>

                                        <View className="min-w-0 flex-1 justify-center px-3">
                                            <AppText
                                                variant="body-base"
                                                numberOfLines={1}
                                                className="mb-0.5 font-semibold tracking-tight text-text-primary"
                                            >
                                                {item.name}
                                            </AppText>
                                            {item.address ? (
                                                <AppText
                                                    variant="caption-xs"
                                                    numberOfLines={1}
                                                    className="text-text-primary/70 dark:text-text-primary/60"
                                                >
                                                    {item.address}
                                                </AppText>
                                            ) : null}
                                        </View>

                                        <View className="min-w-[50px] items-center justify-center pl-1">
                                            <Iconify
                                                icon="heroicons:map-pin-solid"
                                                size={22}
                                                color={colors.status.error}
                                            />
                                            {distanceData ? (
                                                <AppText
                                                    variant="caption-xs"
                                                    className="mt-0.5 text-center font-medium text-text-primary"
                                                    numberOfLines={1}
                                                >
                                                    {distanceData.value}{' '}
                                                    {distanceData.unit}
                                                </AppText>
                                            ) : null}
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        }}
                    />
                </View>
            ) : null}
        </View>
    );
}

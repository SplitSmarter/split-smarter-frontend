import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {formatINR} from '../../utils/spatialMap.utils';
import type {ViewportTopPlace} from '../../utils/viewportAnalytics';
import {SectionLabel} from '../venue-details/SectionLabel';
import {SurfaceCard} from '../venue-details/SurfaceCard';

interface ViewportTopPlacesProps {
    items: ViewportTopPlace[];
    onSelectPlace: (placeId: string | number) => void;
}

export function ViewportTopPlaces({items, onSelectPlace}: ViewportTopPlacesProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (items.length === 0) return null;

    return (
        <View>
            <SectionLabel>Top places</SectionLabel>
            <SurfaceCard className="overflow-hidden p-0">
                {items.map((item, index) => (
                    <Pressable
                        key={String(item.place.placeId)}
                        onPress={() => onSelectPlace(item.place.placeId)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.place.placeName}`}
                        className={`flex-row items-center gap-x-3 px-4 py-3 active:bg-bg-primary-darker ${
                            index > 0 ? 'border-t border-border-input' : ''
                        }`}
                    >
                        <View className="h-9 w-9 items-center justify-center rounded-xl bg-bg-primary-darker">
                            <AppText
                                variant="body-small"
                                className="font-bold text-text-primary"
                            >
                                {index + 1}
                            </AppText>
                        </View>
                        <View className="min-w-0 flex-1">
                            <AppText
                                variant="body-base"
                                className="font-semibold text-text-primary"
                                numberOfLines={1}
                            >
                                {item.place.placeName}
                            </AppText>
                            <AppText
                                variant="body-xs"
                                className="text-text-primary-lighter"
                            >
                                {item.visitCount} visit
                                {item.visitCount === 1 ? '' : 's'} ·{' '}
                                {(item.shareOfViewport * 100).toFixed(0)}% of view
                            </AppText>
                        </View>
                        <AppText
                            variant="body-small"
                            className="font-semibold text-text-primary"
                        >
                            {formatINR(item.sharedInr)}
                        </AppText>
                        <Iconify
                            icon="heroicons:chevron-right"
                            size={18}
                            color={colors.icon.lighter}
                        />
                    </Pressable>
                ))}
            </SurfaceCard>
        </View>
    );
}

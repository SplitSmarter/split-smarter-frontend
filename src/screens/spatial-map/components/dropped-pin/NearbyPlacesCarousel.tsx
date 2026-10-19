import React, {memo, useCallback} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {Shimmer} from '@/src/components/common/shimmer';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {LocationDetails} from '@/src/api/dto/user/place';
import {calculateDistance} from '@/src/utils/place/distance';
import {DEFAULT_PLACE_IMAGE} from '@/src/screens/place/select-map/constants/selectMap.constants';

const CARD_W = 132;
const CARD_H = 148;
const IMAGE_H = 88;
const SHIMMER_CARD_COUNT = 4;

interface NearbyPlacesCarouselProps {
    places: LocationDetails[];
    loading: boolean;
    originLat: number;
    originLon: number;
    onSelect: (place: LocationDetails) => void;
    /** When false, parent owns the section title (default true). */
    showHeader?: boolean;
}

function ExploreCardShimmer() {
    return (
        <View
            className="mr-3 overflow-hidden rounded-2xl border border-border-input bg-bg-canvas"
            style={{width: CARD_W, height: CARD_H}}
        >
            <Shimmer height={IMAGE_H} borderRadius={0} className="w-full" />
            <View className="gap-y-1.5 px-2.5 py-2">
                <Shimmer height={12} borderRadius={6} className="w-[90%]" />
                <Shimmer height={10} borderRadius={5} className="w-14" />
            </View>
        </View>
    );
}

export const NearbyPlacesCarousel = memo(function NearbyPlacesCarousel({
    places,
    loading,
    originLat,
    originLon,
    onSelect,
    showHeader = true,
}: NearbyPlacesCarouselProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const renderCard = useCallback(
        (item: LocationDetails, index: number) => {
            const imageUrl =
                item.photos && item.photos.length > 0
                    ? item.photos[0].url
                    : DEFAULT_PLACE_IMAGE;
            const imageId =
                item.photos && item.photos.length > 0
                    ? String(item.photos[0].id)
                    : `nearby_${item.provider_id ?? index}`;
            const distance = calculateDistance(
                originLat,
                originLon,
                item.geo.latitude,
                item.geo.longitude
            );

            return (
                <Pressable
                    key={`explore-${item.provider}-${item.provider_id ?? 'x'}-${item.id ?? 'n'}-${index}`}
                    onPress={() => onSelect(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    className="mr-3 overflow-hidden rounded-2xl border border-border-input bg-bg-canvas active:opacity-80"
                    style={{width: CARD_W, height: CARD_H}}
                >
                    <View
                        className="bg-bg-primary-darker"
                        style={{width: CARD_W, height: IMAGE_H}}
                    >
                        <AppImageV2
                            id={imageId}
                            url={imageUrl}
                            style={{width: CARD_W, height: IMAGE_H}}
                            contentFit="cover"
                            fallbackComponent={
                                <View className="h-full w-full items-center justify-center">
                                    <EntityFallbackIcon
                                        kind="place"
                                        size={28}
                                        color={colors.icon.lighter}
                                    />
                                </View>
                            }
                        />
                    </View>
                    <View className="gap-y-0.5 px-2.5 py-2">
                        <AppText
                            variant="caption-xs"
                            className="font-bold text-text-primary"
                            numberOfLines={2}
                        >
                            {item.name}
                        </AppText>
                        {distance ? (
                            <AppText
                                variant="caption-xs"
                                className="text-text-primary-lighter"
                            >
                                {`${distance.value} ${distance.unit}`}
                            </AppText>
                        ) : null}
                    </View>
                </Pressable>
            );
        },
        [colors.icon.lighter, onSelect, originLat, originLon]
    );

    const showShimmer = loading && places.length === 0;

    return (
        <View
            className="gap-y-2 pb-2"
            style={{minHeight: CARD_H + (showHeader ? 40 : 8)}}
        >
            {showHeader ? (
                <View className="flex-row items-center justify-between px-6">
                    <AppText
                        variant="body-small"
                        className="font-bold text-text-primary"
                    >
                        Explore places
                    </AppText>
                </View>
            ) : null}

            {showShimmer ? (
                <ScrollView
                    horizontal
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: 4,
                    }}
                >
                    {Array.from({length: SHIMMER_CARD_COUNT}, (_, i) => (
                        <ExploreCardShimmer key={`explore-shimmer-${i}`} />
                    ))}
                </ScrollView>
            ) : places.length === 0 ? (
                <View
                    className="items-center justify-center px-6"
                    style={{height: CARD_H}}
                >
                    <AppText
                        variant="caption-xs"
                        className="text-center text-text-primary-lighter"
                    >
                        No places found near this pin
                    </AppText>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: 4,
                    }}
                >
                    {places.map(renderCard)}
                </ScrollView>
            )}
        </View>
    );
});

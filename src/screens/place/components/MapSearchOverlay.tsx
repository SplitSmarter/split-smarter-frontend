import React from 'react';
import { View, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { LocationDetails } from "@/src/api/dto/user/place";
import { calculateDistance } from "@/src/utils/place/distance";
import { styles } from '@/src/screens/place/SelectMapScreen.styles';

interface MapSearchOverlayProps {
    searchQuery: string;
    isSearching: boolean;
    searchResults: LocationDetails[];
    location: { latitude: number; longitude: number } | null;
    onSearchTextChange: (text: string) => void;
    onClearSearch: () => void;
    onSelectResult: (item: LocationDetails) => void;
    defaultImage: string;
}

export const MapSearchOverlay: React.FC<MapSearchOverlayProps> = ({
                                                                      searchQuery,
                                                                      isSearching,
                                                                      searchResults,
                                                                      location,
                                                                      onSearchTextChange,
                                                                      onClearSearch,
                                                                      onSelectResult,
                                                                      defaultImage,
                                                                  }) => {
    return (
        <View style={styles.fixedSearchContainer}>
            <View className="w-full">
                <AppInput
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChangeText={onSearchTextChange}
                    renderLeftIcon={(color) => (
                        <Iconify icon="heroicons:magnifying-glass" size={20} color={color}/>
                    )}
                    renderRightIcon={(color) => {
                        if (isSearching) {
                            return <ActivityIndicator size="small" color="#2D8A5B"/>;
                        }
                        if (searchQuery.length > 0) {
                            return (
                                <Pressable onPress={onClearSearch}>
                                    <Iconify icon="heroicons:x-mark" size={20} color={color}/>
                                </Pressable>
                            );
                        }
                        return null;
                    }}
                />
            </View>

            {searchResults.length > 0 && (
                <View className="rounded-[24px] mt-2.5 max-h-[340px] overflow-hidden shadow-lg shadow-black/15 elevation-8 bg-bg-primary-lighter dark:bg-bg-canvas w-full">
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => item.provider_id?.toString() || index.toString()}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{paddingVertical: 4}}
                        renderItem={({item}) => {
                            const distanceData = location
                                ? calculateDistance(location.latitude, location.longitude, item.geo.latitude, item.geo.longitude)
                                : null;

                            const imageUrl = item.photos && item.photos.length > 0
                                ? item.photos[0].url
                                : defaultImage;

                            const imageId = item.photos && item.photos.length > 0
                                ? String(item.photos[0].id)
                                : `fallback_${item.provider_id || item.name.replace(/\s+/g, '')}`;

                            return (
                                <Pressable
                                    onPress={() => onSelectResult(item)}
                                    className="py-3 px-4 border-b border-black/[0.06] dark:border-white/[0.06] active:bg-bg-primary-darker dark:active:bg-bg-primary-darker"
                                >
                                    <View className="flex-row items-center w-full justify-between">
                                        <View className="w-[56px] h-[56px] rounded-[16px] overflow-hidden bg-bg-primary-darker">
                                            <AppImageV2
                                                id={imageId}
                                                url={imageUrl}
                                                style={styles.listItemImage}
                                                contentFit="cover"
                                            />
                                        </View>

                                        <View className="flex-1 min-w-0 px-3 justify-center">
                                            <AppText
                                                variant="body-base"
                                                numberOfLines={1}
                                                className="font-semibold text-text-primary tracking-tight mb-0.5"
                                            >
                                                {item.name}
                                            </AppText>
                                            {item.address && (
                                                <AppText
                                                    variant="caption-xs"
                                                    numberOfLines={1}
                                                    className="text-text-primary/70 dark:text-text-primary/60 mb-1"
                                                >
                                                    {item.address}
                                                </AppText>
                                            )}
                                        </View>

                                        <View className="items-center justify-center min-w-[50px] pl-1">
                                            <Iconify icon="heroicons:map-pin-solid" size={22} color="#EF4444"/>
                                            {distanceData && (
                                                <AppText
                                                    variant="caption-xs"
                                                    className="text-text-primary font-medium mt-0.5 text-center"
                                                    numberOfLines={1}
                                                >
                                                    {distanceData.value} {distanceData.unit}
                                                </AppText>
                                            )}
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        }}
                    />
                </View>
            )}
        </View>
    );
};
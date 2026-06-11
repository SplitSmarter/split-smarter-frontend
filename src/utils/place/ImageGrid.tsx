import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppImage } from "@/src/components/common/AppImage";
import { AppText } from "@/src/components/common/AppText";
import { PlacePhotoDetails } from "@/src/api/dto/user/place";
import { themeStore } from '@/src/store/themeStore';
import {Shimmer} from "@/src/components/common/shimmer";

interface ImageGridProps {
    photos: PlacePhotoDetails[];
    loading?: boolean;
}

export const ImageGrid = React.memo(({ photos, loading }: ImageGridProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const hasPhotos = photos && photos.length > 0;

    if (loading) {
        return (
            <View className="flex-row h-52 mt-4 gap-x-2">
                {/* Main large image shimmer */}
                <View className="flex-[2]">
                    <Shimmer height="100%" />
                </View>
                {/* Side small images shimmer stack */}
                <View className="flex-1 gap-y-2">
                    <View className="flex-1">
                        <Shimmer height="100%" />
                    </View>
                    <View className="flex-1">
                        <Shimmer height="100%" />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-row h-52 mt-4 gap-x-2">
            {hasPhotos ? (
                <>
                    <View className="flex-[2] overflow-hidden rounded-[20px] bg-bg-secondary">
                        <AppImage
                            id={photos[0]?.id}
                            url={photos[0]?.url}
                            size="full" // Tell component to use 100%
                            className="h-full w-full" // Tailwind fill
                            contentFit="cover"
                        />
                    </View>

                    {photos.length > 1 && (
                        <View className="flex-1 gap-y-2">
                            <View className="flex-1 overflow-hidden rounded-[20px] bg-bg-secondary">
                                <AppImage
                                    id={photos[1]?.id}
                                    url={photos[1]?.url}
                                    size="full"
                                    className="h-full w-full"
                                    contentFit="cover"
                                />
                            </View>

                            {photos.length > 2 && (
                                <View className="flex-1 overflow-hidden rounded-[20px] bg-bg-secondary">
                                    <AppImage
                                        id={photos[2]?.id}
                                        url={photos[2]?.url}
                                        size="full"
                                        className="h-full w-full"
                                        contentFit="cover"
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </>
            ) : (
                /* Branded Empty State */
                <View className="flex-1 items-center justify-center rounded-[20px] bg-bg-primary border border-dashed border-divider">
                    <View className="items-center opacity-40">
                        <Iconify
                            icon="heroicons:photo"
                            size={48}
                            color={isDark ? "#AAA" : "#666"}
                        />
                        <AppText variant="body-xs" className="mt-2 text-text-secondary">
                            No photos available
                        </AppText>
                    </View>
                </View>
            )}
        </View>
    );
});

ImageGrid.displayName = 'ImageGrid';
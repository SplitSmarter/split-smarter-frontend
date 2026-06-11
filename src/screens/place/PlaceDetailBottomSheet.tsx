import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator, Alert } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { ImageGrid } from "@/src/utils/place/ImageGrid";
import { themeStore } from '@/src/store/themeStore';
import { usePlaceDetails } from "@/src/hooks/usePlaceDetails";
import { CreatePlaceApi } from "@/src/api/user/place/location";
import { PlaceSource } from "@/src/api/dto/constants";

interface PlaceDetailBottomSheetProps {
    place: {
        id: number | null;
        provider: PlaceSource;
        provider_id: number | null;
        place_id: string | null;
        name: string;
        coordinate: [number, number]; // [longitude, latitude]
        address?: string;
    } | null;
    isVisible: boolean;
    onClose: () => void;
    onSave?: (details: any) => void;
    onSelect?: (details: any) => void;
    isSaved: boolean;
}

export const PlaceDetailBottomSheet = React.memo(({
                                                      place, isVisible, onClose, onSave, onSelect, isSaved
                                                  }: PlaceDetailBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const { loading: isEnriching, displayData, isAddressLoading } = usePlaceDetails(place, isVisible);

    const [editedValues, setEditedValues] = useState<{name?: string, description?: string}>({});
    const nameRef = useRef(displayData.name || "");
    const descRef = useRef(displayData.description || "");

    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (displayData && !isEditing) {
            nameRef.current = displayData.name;
            descRef.current = displayData.description || "";
            setEditedValues({});
        }
    }, [displayData.name, displayData.description]);

    const snapPoints = useMemo(() => ['65%', '95%'], []);

    useEffect(() => {
        if (isVisible && place) {
            setTimeout(() => bottomSheetModalRef.current?.present(), 100);
        } else {
            bottomSheetModalRef.current?.dismiss();
            setIsEditing(false);
        }
    }, [isVisible, !!place]);

    const handleSelectAction = async () => {
        if (!displayData || !place) return;
        setIsProcessing(true);

        try {
            let finalizedPlaceSelection = { ...place };

            if (!isSaved) {
                // FIXED MAPPING: coordinate[0] is longitude, coordinate[1] is latitude.
                const requestData = {
                    name: nameRef.current || displayData.name || place.name,
                    description: descRef.current || displayData.description || "",
                    provider: displayData.provider || place.provider,
                    provider_id: displayData.provider_id || place.provider_id,
                    custom_details: {
                        name: nameRef.current || displayData.name || place.name,
                        description: descRef.current || displayData.description || "",
                        address: displayData.address || place.address || "",
                        geo: displayData.geo || { latitude: place.coordinate[1], longitude: place.coordinate[0] },
                        country: displayData.country || "",
                        city: displayData.city || "",
                        country_code: displayData.country_code || ""
                    }
                };

                const result = await CreatePlaceApi(requestData);

                if (result.data) {
                    finalizedPlaceSelection = {
                        ...place,
                        id: result.data.id,
                        name: nameRef.current || displayData.name || place.name,
                        address: displayData.address || place.address
                    };

                    onSave?.(finalizedPlaceSelection);
                } else {
                    Alert.alert("Error", result.message || "Failed to persist location tracking parameters.");
                    setIsProcessing(false);
                    return;
                }
            } else {
                onSelect?.(finalizedPlaceSelection);
            }
        } catch (e) {
            console.error("Error executing unified save-and-select pipelines:", e);
        } {
            setIsProcessing(false);
        }
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} pressBehavior="close" />
        ), []
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={!isEditing && !isProcessing}
            backgroundStyle={{
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                borderRadius: 32
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? '#333333' : '#E5E5E5'
            }}
            keyboardBehavior="fillParent"
            keyboardBlurBehavior="restore"
        >
            <BottomSheetView style={{ flex: 1, minHeight: 400 }}>
                {place && (
                    <View className="flex-1">
                        {isEditing ? (
                            <View className="flex-1 px-5 pt-2 pb-8">
                                <View className="flex-row justify-between items-center mb-6">
                                    <AppText variant="h3" className="text-text-primary">Edit Details</AppText>
                                    <Pressable onPress={() => setIsEditing(false)} className="p-2 bg-bg-secondary rounded-full active:opacity-70">
                                        <Iconify icon="heroicons:arrow-uturn-left" size={20} className="text-text-primary" />
                                    </Pressable>
                                </View>

                                <BottomSheetScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 60 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <View className="gap-y-6">
                                        <AppInput
                                            label="Place Name"
                                            defaultValue={nameRef.current}
                                            onChangeText={(text) => { nameRef.current = text; }}
                                            returnKeyType="next"
                                        />
                                        <AppInput
                                            label="Description"
                                            defaultValue={descRef.current}
                                            onChangeText={(text) => { descRef.current = text; }}
                                            textAlignVertical="top"
                                        />

                                        <AppButton
                                            onPress={() => {
                                                setEditedValues({
                                                    name: nameRef.current,
                                                    description: descRef.current
                                                });
                                                setIsEditing(false);
                                            }}
                                            variant="primary"
                                            className="bg-green-increase mt-4 rounded-2xl h-14"
                                        >
                                            <AppText className="text-text-canvas font-bold">Done</AppText>
                                        </AppButton>
                                    </View>
                                </BottomSheetScrollView>
                            </View>
                        ) : (
                            <View className="flex-1 px-5 pt-2 pb-8">
                                <View className="flex-row justify-between items-start mb-1 min-h-[60px]">
                                    <View className="flex-1">
                                        <AppText variant="h3" className="text-[22px] text-text-primary" numberOfLines={1}>
                                            {editedValues.name || displayData.name || place.name}
                                        </AppText>

                                        <View className="flex-row items-center mt-1 pr-4">
                                            <Iconify
                                                icon="heroicons:map-pin"
                                                size={14}
                                                color={isDark ? "rgba(255, 255, 255, 0.6)" : "#71717A"}
                                            />
                                            {isAddressLoading && !place?.address ? (
                                                <ActivityIndicator size="small" className="text-green-increase ml-2" />
                                            ) : (
                                                <AppText variant="caption-xs" className="text-text-primary ml-1" numberOfLines={1}>
                                                    {displayData.address || place?.address || "Fetching address coordinates..."}
                                                </AppText>
                                            )}
                                        </View>
                                    </View>

                                    <View className="flex-row gap-x-2">
                                        {!isEnriching && (
                                            <Pressable
                                                disabled={isEnriching}
                                                onPress={() => setIsEditing(true)}
                                                className={`p-2 bg-bg-secondary rounded-full active:opacity-70 ${isEnriching ? 'opacity-30' : ''}`}
                                            >
                                                <Iconify icon="heroicons:pencil-square" size={20} className="text-text-primary" />
                                            </Pressable>
                                        )}
                                        <Pressable onPress={onClose} className="p-2 bg-bg-secondary rounded-full active:opacity-70">
                                            <Iconify icon="heroicons:x-mark" size={20} className="text-text-primary" />
                                        </Pressable>
                                    </View>
                                </View>

                                <ImageGrid key={place?.id || 'no-place'} loading={isEnriching} photos={displayData.photos} />

                                {(editedValues.description || displayData.description) && (
                                    <View className="mt-4">
                                        <AppText variant="body-xs" className="text-text-secondary italic" numberOfLines={2}>
                                            &#34;{editedValues.description || displayData.description}&#34;
                                        </AppText>
                                    </View>
                                )}

                                <View className="mt-auto">
                                    <AppButton
                                        variant="primary"
                                        onPress={handleSelectAction}
                                        loading={isProcessing}
                                        disabled={isEnriching || isProcessing}
                                        className="bg-green-increase rounded-2xl h-14"
                                    >
                                        <AppText className="text-text-canvas font-bold">
                                            {isEnriching ? 'Loading Details...' : (isSaved ? 'Select Place' : 'Save & Select Place')}
                                        </AppText>
                                    </AppButton>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

PlaceDetailBottomSheet.displayName = 'PlaceDetailBottomSheet';
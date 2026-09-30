import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage";
import { AppInput } from "@/src/components/common/AppInput";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from "@/src/constants/colors";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { RelationDetails } from "@/src/api/dto/user/relation";

interface SelectRelationshipBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    onClose: () => void;
    onSelect: (relation: RelationDetails) => void;
}

export const SelectRelationshipBottomSheet = ({
                                                  visible,
                                                  onClose,
                                                  onSelect,
                                                  selectedId
                                              }: SelectRelationshipBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const snapPoints = useMemo(() => ['80%'], []);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
            fetchRelations();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    const fetchRelations = async () => {
        setLoading(true);
        try {
            const response = await GetRelationsApi({ limit: 100 });
            if (response.data) {
                setRelations(response.data);
            }
        } catch (error) {
            console.error("Failed fetching network relationships:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRelations = relations.filter(item =>
        item.with_user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.5}
                pressBehavior="close"
            />
        ), []
    );

    const handleAddNewRelationshipPress = () => {
        // Smoothly dismiss references to prevent dirty screen overlaps during layout transition
        bottomSheetModalRef.current?.dismiss();
        onClose();

        setTimeout(() => {
            router.push('/(authenticated)/user/relationship/add');
        }, 200);
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: isDark ? '#121212' : '#FFFFFF', borderRadius: 40 }}
            handleIndicatorStyle={{ backgroundColor: isDark ? '#333' : '#E5E5E5' }}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
        >
            {/* Safe standard view context frame container instead of throwing the useBottomSheetInternal crash exception */}
            <BottomSheetView style={{ flex: 1 }}>
                <View className="flex-1 px-6 pt-2">
                    {/* Header Controls */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Pressable onPress={onClose} className="p-2 rounded-full">
                            <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary">Select Relation</AppText>
                        <View className="w-10" />
                    </View>

                    {/* Search Field wrapper */}
                    <View className="flex-row items-center justify-between mb-6">
                        <AppInput
                            placeholder="Type name to search"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            renderLeftIcon={(color) => (
                                <Iconify icon="heroicons:magnifying-glass" size={20} color={color} />
                            )}
                        />
                    </View>

                    {loading ? (
                        <View className="flex-1 justify-center">
                            <ActivityIndicator size="large" color="#2D6A4F" />
                        </View>
                    ) : (
                        <BottomSheetScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            {filteredRelations.length > 0 ? (
                                <View className="bg-bg-primary-lighter rounded-3xl p-4 border border-bg-secondary-lighter">
                                    <AppText variant="body-base" className="font-bold mb-4 text-text-primary">
                                        Connections
                                    </AppText>
                                    <View className="gap-y-2">
                                        {filteredRelations.map((item) => {
                                            const isSelected = item.id === selectedId;
                                            return (
                                                <Pressable
                                                    key={item.id}
                                                    onPress={() => {
                                                        onSelect(item);
                                                        bottomSheetModalRef.current?.dismiss();
                                                    }}
                                                    className={`flex-row items-center p-3 rounded-2xl ${
                                                        isSelected ? 'bg-bg-secondary/10 border border-bg-secondary/30' : 'bg-white dark:bg-zinc-900 border border-transparent'
                                                    }`}
                                                >
                                                    <AppImage
                                                        url={item.with_user.avatar?.url}
                                                        id={item.with_user.avatar?.id}
                                                        size="sm"
                                                        variant="circular"
                                                    />
                                                    <View className="flex-1 ml-3">
                                                        <AppText className="font-semibold text-text-primary">
                                                            {item.with_user.name}
                                                        </AppText>
                                                        <AppText variant="caption-xs" className="text-text-secondary opacity-60 uppercase tracking-wider">
                                                            {item.with_user.user_type || 'Contact'}
                                                        </AppText>
                                                    </View>
                                                    <Iconify
                                                        icon={isSelected ? "heroicons:check-circle-solid" : "heroicons:circle"}
                                                        size={24}
                                                        color={isSelected ? COLORS.icon_primary_darker_light : COLORS.icon_secondary_light}
                                                    />
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center py-10">
                                    <Iconify icon="heroicons:face-frown" size={40} color={COLORS.icon_secondary_light} />
                                    <AppText className="text-text-secondary mt-2">No matching relations found</AppText>
                                </View>
                            )}

                            {/* Add CTA Trigger Layout */}
                            <View className="items-center mt-8">
                                <AppButton
                                    variant="primary"
                                    className="px-8 rounded-2xl h-14"
                                    onPress={handleAddNewRelationshipPress}
                                    renderIcon={(color) => (
                                        <Iconify icon="heroicons:user-plus" size={20} color={color} />
                                    )}
                                >
                                    Add New Relationship
                                </AppButton>
                            </View>
                        </BottomSheetScrollView>
                    )}
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};
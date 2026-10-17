import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { View, Pressable } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from "@/src/constants/colors";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { HiddenUserTarget, SelectPeopleTab } from './SelectPeopleTab';
import { SelectMerchantTab } from './SelectMerchantTab';
import { UserMerchantDetails } from '@/src/api/dto/expense/merchant';
import { RelationDetails } from '@/src/api/dto/user/relation';
import { UserSearchResponse } from '@/src/api/dto/user/user';

type EntityTabType = 'people' | 'merchant';

interface SelectEntityBottomSheetProps {
    visible: boolean;
    initialTab?: EntityTabType;
    selectedId?: number;
    selectedType?: RelationWithUserType;
    selectedMerchantId?: number;
    hideUsers?: HiddenUserTarget[];
    onClose: () => void;
    onSelectPerson?: (userId: number, userType: RelationWithUserType, relations: RelationDetails[], globalUsers: UserSearchResponse[]) => void;
    onSelectMerchant?: (merchantId: number, merchant: UserMerchantDetails, merchants: UserMerchantDetails[]) => void;
}

export const SelectEntityBottomSheet = ({
                                            visible,
                                            initialTab = 'people',
                                            selectedId,
                                            selectedType,
                                            selectedMerchantId,
                                            hideUsers = [],
                                            onClose,
                                            onSelectPerson,
                                            onSelectMerchant
                                        }: SelectEntityBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [activeTab, setActiveTab] = useState<EntityTabType>(initialTab);

    useEffect(() => {
        if (visible) {
            setActiveTab(initialTab);
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible, initialTab]);

    const snapPoints = useMemo(() => ['85%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{
                backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter,
                width: 48,
                height: 6,
            }}
        >
            <BottomSheetView className="flex-1 px-4">
                {/* Header with Close and Title */}
                <View className="flex-row items-center justify-between pb-3 border-b border-border-input">
                    <Pressable onPress={onClose} className="p-2 rounded-full active:opacity-60">
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={isDark ? COLORS.dark.text.primary : COLORS.light.text.primary}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Select Entity
                    </AppText>
                    <View style={{ width: 40 }} />
                </View>

                {/* Switcher Segmented Control */}
                <View className="flex-row my-3 p-1 bg-bg-primary-darker rounded-2xl">
                    <Pressable
                        onPress={() => setActiveTab('people')}
                        className={`flex-1 py-2.5 items-center rounded-xl ${
                            activeTab === 'people'
                                ? 'bg-bg-canvas'
                                : 'bg-transparent'
                        }`}
                    >
                        <AppText className={`font-semibold ${activeTab === 'people' ? 'text-text-primary' : 'text-text-primary-lighter'}`}>
                            People
                        </AppText>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('merchant')}
                        className={`flex-1 py-2.5 items-center rounded-xl ${
                            activeTab === 'merchant'
                                ? 'bg-bg-canvas'
                                : 'bg-transparent'
                        }`}
                    >
                        <AppText className={`font-semibold ${activeTab === 'merchant' ? 'text-text-primary' : 'text-text-primary-lighter'}`}>
                            Merchants
                        </AppText>
                    </Pressable>
                </View>

                {/* Tab Views Content */}
                {activeTab === 'people' ? (
                    <SelectPeopleTab
                        isDark={isDark}
                        selectedId={selectedId}
                        selectedType={selectedType}
                        hideUsers={hideUsers}
                        onClose={onClose}
                        onSelect={(userId, userType, relations, globalUsers) => {
                            onSelectPerson?.(userId, userType, relations, globalUsers);
                        }}
                    />
                ) : (
                    <SelectMerchantTab
                        isDark={isDark}
                        selectedMerchantId={selectedMerchantId}
                        onClose={onClose}
                        onSelect={(merchantId, merchant, merchants) => {
                            onSelectMerchant?.(merchantId, merchant, merchants);
                        }}
                    />
                )}
            </BottomSheetView>
        </BottomSheetModal>
    );
};

SelectEntityBottomSheet.displayName = 'SelectEntityBottomSheet';
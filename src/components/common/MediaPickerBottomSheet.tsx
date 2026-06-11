// In MediaPickerBottomSheet.tsx
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from '@/src/store/themeStore';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView} from '@gorhom/bottom-sheet'; // Revert this
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Iconify } from 'react-native-iconify';

interface MediaPickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (fromCamera: boolean) => void;
}

export const MediaPickerBottomSheet = ({visible, onClose, onSelect}: MediaPickerBottomSheetProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ['35%'], []);

    useEffect(() => {
        if (visible) {
            // No index needed, present() handles transition from "closed" to snapPoint[0]
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

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

    const Option = ({title, iconComponent, onPress}: {title: string, iconComponent: React.ReactNode, onPress: () => void}) => (
        <Pressable
            onPress={onPress}
            className="flex-row items-center p-5 bg-zinc-100 dark:bg-zinc-800 rounded-3xl mb-3 active:opacity-60"
        >
            <View className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
                {iconComponent}
            </View>
            <AppText className="ml-4 font-semibold text-lg text-text-primary">{title}</AppText>
        </Pressable>
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{backgroundColor: isDark ? '#121212' : '#F8F8F8', borderRadius: 40}}
            handleIndicatorStyle={{backgroundColor: isDark ? '#333' : '#E5E5E5'}}
        >
            {/* Wrap content in BottomSheetView to fix rendering issues inside ScrollViews */}
            <BottomSheetView className="flex-1 px-6 pt-2">
                <AppText variant="h4" className="font-bold text-text-primary text-center mb-6">
                    Choose Image
                </AppText>

                <Option
                    title="Take Photo"
                    iconComponent={<Iconify icon="heroicons:camera" size={24} color="#059669" />}
                    onPress={() => onSelect(true)}
                />

                <Option
                    title="Choose from Gallery"
                    iconComponent={<Iconify icon="heroicons:photo" size={24} color="#059669" />}
                    onPress={() => onSelect(false)}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
};
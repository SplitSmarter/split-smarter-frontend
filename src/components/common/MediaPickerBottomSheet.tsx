import { AppText } from "@/src/components/common/AppText";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView} from '@gorhom/bottom-sheet';
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
    const colors = isDark ? COLORS.dark : COLORS.light;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ['35%'], []);

    useEffect(() => {
        if (visible) {
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
            className="mb-3 flex-row items-center rounded-3xl p-5"
            style={({pressed}) => [
                {
                    backgroundColor: colors.bg.darker,
                },
                pressed ? {opacity: 0.6} : undefined,
            ]}
        >
            <View
                className="rounded-2xl p-3"
                style={{backgroundColor: colors.bg.lighter}}
            >
                {iconComponent}
            </View>
            <AppText
                className="ml-4 text-lg font-semibold"
                style={{color: colors.text.primary}}
            >
                {title}
            </AppText>
        </Pressable>
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            onDismiss={onClose}
            enableDynamicSizing={false}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{backgroundColor: colors.bg.overlay, borderRadius: 40}}
            handleIndicatorStyle={{backgroundColor: colors.icon.lighter}}
        >
            <BottomSheetView className="flex-1 px-6 pt-2">
                <AppText
                    variant="h4"
                    className="mb-6 text-center font-bold"
                    style={{color: colors.text.primary}}
                >
                    Choose Image
                </AppText>

                <Option
                    title="Take Photo"
                    iconComponent={<Iconify icon="heroicons:camera" size={24} color={colors.icon.primary} />}
                    onPress={() => onSelect(true)}
                />

                <Option
                    title="Choose from Gallery"
                    iconComponent={<Iconify icon="heroicons:photo" size={24} color={colors.icon.primary} />}
                    onPress={() => onSelect(false)}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
};

import React, { useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Pressable } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from "@/src/constants/colors";

interface AppBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: (string | number)[];
    showCloseButton?: boolean;
}

export const AppBottomSheet = React.forwardRef<BottomSheetModal, AppBottomSheetProps>((props, ref) => {
    const { isVisible, onClose, children, snapPoints: customSnapPoints, showCloseButton = true } = props;

    const internalRef = React.useRef<BottomSheetModal>(null);

    // Sync the external ref with internal ref
    useImperativeHandle(ref, () => internalRef.current as BottomSheetModal);

    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const snapPoints = useMemo(() => customSnapPoints || ['50%', '75%'], [customSnapPoints]);

    useEffect(() => {
        if (isVisible) {
            internalRef.current?.present();
        } else {
            internalRef.current?.dismiss();
        }
    }, [isVisible]);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) onClose();
    }, [onClose]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} pressBehavior="close" />
        ),
        []
    );

    const iconColor = isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;

    return (
        <BottomSheetModal
            ref={internalRef}
            index={0}
            snapPoints={snapPoints}
            onDismiss={onClose}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: isDark ? '#121212' : '#FFFFFF' }}
            handleIndicatorStyle={{ backgroundColor: isDark ? '#333' : '#E5E5E5', width: 40 }}
        >
            <BottomSheetView style={{ flex: 1 }} className="px-6 pb-8">
                {showCloseButton && (
                    <View className="flex-row justify-end items-center mb-2">
                        <Pressable onPress={onClose} className="p-1 bg-bg-primary-darker/10 rounded-full">
                            <Iconify icon="heroicons:x-mark" size={20} color={iconColor} />
                        </Pressable>
                    </View>
                )}
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

AppBottomSheet.displayName = 'AppBottomSheet';
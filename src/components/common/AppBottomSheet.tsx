import React, { useCallback, useMemo, useEffect, useImperativeHandle } from 'react';
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

    useImperativeHandle(ref, () => internalRef.current as BottomSheetModal);

    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

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

    return (
        <BottomSheetModal
            ref={internalRef}
            index={0}
            snapPoints={snapPoints}
            onDismiss={onClose}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: colors.bg.overlay, borderRadius: 40 }}
            handleIndicatorStyle={{ backgroundColor: colors.icon.lighter, width: 40 }}
        >
            <BottomSheetView style={{ flex: 1 }} className="px-6 pb-8">
                {showCloseButton && (
                    <View className="mb-2 flex-row items-center justify-end">
                        <Pressable
                            onPress={onClose}
                            className="rounded-full p-1"
                            style={{ backgroundColor: colors.bg.darker }}
                        >
                            <Iconify icon="heroicons:x-mark" size={20} color={colors.icon.primary} />
                        </Pressable>
                    </View>
                )}
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

AppBottomSheet.displayName = "AppBottomSheet";

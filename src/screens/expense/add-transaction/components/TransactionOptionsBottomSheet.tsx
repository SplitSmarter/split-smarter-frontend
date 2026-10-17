import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Pressable, View} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

interface TransactionOptionsBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSaveDraft: () => void;
    onSchedule: () => void;
    onClear: () => void;
}

export const TransactionOptionsBottomSheet = ({
    visible,
    onClose,
    onSaveDraft,
    onSchedule,
    onClear,
}: TransactionOptionsBottomSheetProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const activeColors = isDark ? COLORS.dark : COLORS.light;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['42%'], []);

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
                opacity={isDark ? 0.7 : 0.4}
                pressBehavior="close"
            />
        ),
        [isDark]
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: activeColors.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: activeColors.icon.lighter,
                width: 48,
                height: 6,
            }}
        >
            <BottomSheetView className="flex-1 px-6 pt-2 pb-8">
                <AppText variant="h3" className="font-bold mb-4 px-2 text-text-primary">
                    Form Options
                </AppText>

                <Pressable
                    onPress={onSaveDraft}
                    className="flex-row items-center p-4 rounded-xl"
                    style={({pressed}) => (pressed ? {opacity: 0.7} : undefined)}
                >
                    <Iconify icon="heroicons:document-arrow-down" size={24} color={activeColors.icon.primary}/>
                    <AppText variant="body-base" className="ml-4 font-semibold text-[16px] text-text-primary">
                        Save as Draft
                    </AppText>
                </Pressable>

                <Pressable
                    onPress={onSchedule}
                    className="flex-row items-center p-4 rounded-xl"
                    style={({pressed}) => (pressed ? {opacity: 0.7} : undefined)}
                >
                    <Iconify icon="heroicons:clock" size={24} color={activeColors.icon.primary}/>
                    <AppText variant="body-base" className="ml-4 font-semibold text-[16px] text-text-primary">
                        Schedule Transaction
                    </AppText>
                </Pressable>

                <View className="h-[1px] my-2 w-full bg-bg-primary-darker/20"/>

                <Pressable
                    onPress={onClear}
                    className="flex-row items-center p-4 rounded-xl"
                    style={({pressed}) => (pressed ? {opacity: 0.7} : undefined)}
                >
                    <Iconify icon="heroicons:trash" size={24} color={activeColors.status.error}/>
                    <AppText
                        variant="body-base"
                        className="ml-4 font-semibold text-[16px]"
                        style={{color: activeColors.status.error}}
                    >
                        Clear Form
                    </AppText>
                </Pressable>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

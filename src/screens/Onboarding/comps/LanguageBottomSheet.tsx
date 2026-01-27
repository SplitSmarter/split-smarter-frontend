import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Pressable, Image } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetFlatList,
    BottomSheetBackdrop,
    BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useI18nStore } from '@/src/store/useI18nStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { languages } from "@/src/constants/language";
import { COLORS } from "@/src/constants/colors";
import { i18n as i18nInstance } from "@/src/i18n/index";

interface LanguageBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
}

export const LanguageBottomSheet = React.memo(({ isVisible, onClose }: LanguageBottomSheetProps) => {
    // 1. Hooks (Strict Stable Order)
    const { t } = useTranslation('translation', { i18n: i18nInstance });
    const { changeLanguage, language } = useI18nStore();
    const theme = useThemeStore((state) => state.theme);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // 2. Logic
    const isDark = theme === 'dark';
    const iconColor = isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;
    const brandGreen = isDark ? COLORS.icon_secondary_dark: COLORS.icon_secondary_light;
    const snapPoints = useMemo(() => ['70%'], []);

    // 3. Side Effects
    useEffect(() => {
        if (isVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isVisible]);

    // 4. Callbacks
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0} // Fixed typo: appearsAtIndex -> appearsOnIndex
                disappearsOnIndex={-1} // Fixed typo: disappearsAtIndex -> disappearsOnIndex
                opacity={0.5}
                pressBehavior="close"
            />
        ), []
    );

    const handleLanguageSelect = useCallback((tag: any) => {
        changeLanguage(tag);
    }, [changeLanguage]);

    const renderLanguageItem = useCallback(({ item }: { item: typeof languages[keyof typeof languages] }) => {
        const isSelected = language === item.tag;
        const flagUrl = `https://flagcdn.com/w160/${item.countryCode.toLowerCase()}.png`;

        return (
            <Pressable
                onPress={() => handleLanguageSelect(item.tag)}
                className={`flex-row items-center p-4 rounded-2xl border ${
                    isSelected
                        ? 'border-bg-secondary bg-bg-secondary/5'
                        : 'border-bg-primary-darker'
                }`}
            >
                <View className="w-14 h-10 rounded-md bg-bg-primary-darker overflow-hidden items-center justify-center mr-4 border border-black/5">
                    <Image
                        source={{ uri: flagUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                <View className="flex-1">
                    <AppText variant="body-base" className={`font-bold ${isSelected ? 'text-bg-secondary' : 'text-text-primary'}`}>
                        {t('language.name.self', { lng: item.tag })}
                    </AppText>
                    <AppText variant="caption-xs" className="opacity-40 text-text-primary">
                        {t('language.name.english', { lng: item.tag })}
                    </AppText>
                </View>

                {isSelected && (
                    <Iconify icon="heroicons:check-circle-20-solid" size={20} color={brandGreen} />
                )}
            </Pressable>
        );
    }, [handleLanguageSelect, language, t]);

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: isDark ? '#121212' : '#FFFFFF' }}
            handleIndicatorStyle={{ backgroundColor: isDark ? '#333' : '#E5E5E5', width: 40 }}
        >
            <View className="flex-1 px-6 pt-2 pb-10">
                <View className="relative items-center mb-6">
                    <Pressable
                        onPress={onClose}
                        className="absolute right-0 top-0 p-1 bg-bg-primary-darker/10 rounded-full active:opacity-60"
                        style={{ zIndex: 10 }}
                    >
                        <Iconify icon="heroicons:x-mark" size={20} color={iconColor} />
                    </Pressable>

                    <View className="w-16 h-16 bg-bg-secondary/10 rounded-full items-center justify-center mb-4">
                        <Iconify icon="heroicons:language" size={32} color={brandGreen} />
                    </View>
                    <AppText variant="h3">{t('common.language.select')}</AppText>
                </View>

                <BottomSheetFlatList
                    data={Object.values(languages)}
                    keyExtractor={(item) => item.tag}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                    renderItem={renderLanguageItem}
                />

                <AppButton onPress={onClose} variant="primary" size="lg" className="mt-4">
                    {t('common.continue')}
                </AppButton>
            </View>
        </BottomSheetModal>
    );
});

LanguageBottomSheet.displayName = 'LanguageBottomSheet';
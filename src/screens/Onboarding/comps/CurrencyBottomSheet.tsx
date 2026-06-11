import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetFlatList,
    BottomSheetBackdrop,
    BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { themeStore } from '@/src/store/themeStore';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage"; // Import AppImage
import { currencies } from "@/src/constants/currency";
import { COLORS } from "@/src/constants/colors";
import { i18n as i18nInstance } from "@/src/i18n/index";

interface CurrencyBottomSheetProps {
    isVisible: boolean;
    currentCurrency: string;
    onSelect: (code: string) => void;
    onClose: () => void;
}

export const CurrencyBottomSheet = React.memo(({
                                                   isVisible,
                                                   onClose,
                                                   currentCurrency,
                                                   onSelect
                                               }: CurrencyBottomSheetProps) => {
    const { t } = useTranslation('translation', { i18n: i18nInstance });
    const { theme } = themeStore();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const isDark = theme === 'dark';
    const iconColor = isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;
    const brandGreen = isDark ? COLORS.icon_secondary_dark : COLORS.icon_secondary_light;
    const snapPoints = useMemo(() => ['70%'], []);

    useEffect(() => {
        if (isVisible) bottomSheetModalRef.current?.present();
        else bottomSheetModalRef.current?.dismiss();
    }, [isVisible]);

    const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
    ), []);

    const renderCurrencyItem = useCallback(({ item }: { item: typeof currencies[keyof typeof currencies] }) => {
        const isSelected = currentCurrency === item.code;
        // Using the 4:3 ratio URL as discussed for better circular fit
        const flagUrl = `https://flagcdn.com/256x192/${item.countryTag.toLowerCase()}.png`;

        return (
            <Pressable
                onPress={() => onSelect(item.code)}
                className={`flex-row items-center p-4 rounded-2xl border ${
                    isSelected ? 'border-bg-secondary bg-bg-secondary/5' : 'border-bg-primary-darker'
                }`}
            >
                {/* Using AppImage here:
                    - id: provides unique cache key
                    - url: the flag cdn link
                    - size: 'md' (48px)
                    - variant: 'circular' handles the rounding and overflow
                */}
                <AppImage
                    id={`flag_${item.countryTag}`}
                    url={flagUrl}
                    size="md"
                    variant="circular"
                    borderEnabled={true}
                    borderColor={isSelected ? 'rgba(40, 159, 50, 0.2)' : 'rgba(0,0,0,0.05)'}
                    fallbackIcon={<Iconify icon="heroicons:flag" size={24} color="gray" />}
                />

                {/* Currency Details */}
                <View className="flex-1 ml-4">
                    <View className="flex-row items-center gap-x-2">
                        <AppText variant="body-base" className={`font-bold ${isSelected ? 'text-bg-secondary' : 'text-text-primary'}`}>
                            {item.code}
                        </AppText>
                        <AppText variant="caption-xs" className="opacity-40 text-text-primary">
                            ({item.symbol})
                        </AppText>
                    </View>
                    <AppText variant="caption-xs" className="opacity-60 text-text-primary">
                        {t(item.name)}
                    </AppText>
                </View>

                {isSelected && (
                    <Iconify icon="heroicons:check-circle-20-solid" size={24} color={brandGreen} />
                )}
            </Pressable>
        );
    }, [currentCurrency, brandGreen]);

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: isDark ? '#121212' : '#FFFFFF' }}
            handleIndicatorStyle={{ backgroundColor: isDark ? '#333' : '#E5E5E5', width: 40 }}
        >
            <View className="flex-1 px-6 pt-2 pb-10">
                <View className="relative items-center mb-6">
                    <Pressable onPress={onClose} className="absolute right-0 top-0 p-2 bg-bg-primary-darker/10 rounded-full" style={{ zIndex: 10 }}>
                        <Iconify icon="heroicons:x-mark" size={20} color={iconColor} />
                    </Pressable>

                    <View className="w-16 h-16 bg-bg-secondary/10 rounded-full items-center justify-center mb-4">
                        <Iconify icon="heroicons:banknotes" size={32} color={brandGreen} />
                    </View>
                    <AppText variant="h3">{t('common.currency.select', 'Select Currency')}</AppText>
                </View>

                <BottomSheetFlatList
                    data={Object.values(currencies)}
                    keyExtractor={(item) => item.code}
                    contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                    renderItem={renderCurrencyItem}
                />

                <AppButton onPress={onClose} variant="primary" size="lg" className="mt-4">
                    {t('common.done', 'Done')}
                </AppButton>
            </View>
        </BottomSheetModal>
    );
});

CurrencyBottomSheet.displayName = 'CurrencyBottomSheet';
import React, { useCallback, useMemo } from 'react';
import { View, Modal, Pressable, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Iconify } from 'react-native-iconify';
import { themeStore } from '@/src/store/themeStore';
import { userStore } from '@/src/store/userStore';
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { Currency } from "@/src/constants/expense/currency";
import { COLORS } from "@/src/constants/colors";
import { i18n as i18nInstance } from "@/src/i18n/index";

export interface ExchangeRateDetails {
    INR: number;
    USD: number;
    CO2?: number;
    EUR: number;
    CAD: number;
    GBP: number;
}

interface CurrencyModalProps {
    visible: boolean;
    currentCurrency: string;
    exchangeRates?: ExchangeRateDetails;
    showConversionRates?: boolean;
    onSelect: (code: string) => void;
    onClose: () => void;
}

export const CurrencyModal = React.memo(({
                                             visible,
                                             onClose,
                                             currentCurrency,
                                             exchangeRates,
                                             showConversionRates = true,
                                             onSelect
                                         }: CurrencyModalProps) => {
    const { t } = useTranslation('translation', { i18n: i18nInstance });
    const isDark = themeStore((state) => state.theme === 'dark');
    const loggedInUser = userStore((state) => state.user);

    const iconColor = isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;
    const brandGreen = isDark ? COLORS.icon_secondary_dark : COLORS.icon_secondary_light;

    const calculateConversionSubtitle = useCallback((targetCurrencyCode: string) => {
        if (!showConversionRates || !exchangeRates) return '';

        const userBaseCurrency = loggedInUser?.currency || 'INR';

        if (targetCurrencyCode === userBaseCurrency) {
            return t('common.currency.base', 'Base Currency');
        }

        const baselineInrValueTarget = exchangeRates[targetCurrencyCode as keyof ExchangeRateDetails];
        const baselineInrValueUserBase = exchangeRates[userBaseCurrency as keyof ExchangeRateDetails];

        if (!baselineInrValueTarget || !baselineInrValueUserBase) return '';

        // Formula conversion relative to User's target store currency profile
        const absoluteConversionFactor = baselineInrValueTarget / baselineInrValueUserBase;
        const userBaseSymbol = Currency[userBaseCurrency as keyof typeof Currency]?.symbol || userBaseCurrency;

        return `1 ${targetCurrencyCode} ≈ ${userBaseSymbol}${absoluteConversionFactor.toFixed(2)}`;
    }, [loggedInUser, exchangeRates, showConversionRates, t]);

    const renderCurrencyItem = useCallback(({ item }: { item: typeof Currency[keyof typeof Currency] }) => {
        const isSelected = currentCurrency === item.code;
        const flagUrl = `https://flagcdn.com/256x192/${item.countryTag.toLowerCase()}.png`;
        const localConversionTranslation = calculateConversionSubtitle(item.code);

        return (
            <Pressable
                onPress={() => onSelect(item.code)}
                className={`flex-row items-center p-4 rounded-2xl border mb-2.5 ${
                    isSelected
                        ? 'border-bg-secondary bg-bg-secondary/5'
                        : 'border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/20'
                }`}
            >
                {/* Advanced Cache Optimized Flag Layer */}
                <View className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-zinc-100 dark:bg-zinc-900 items-center justify-center">
                    <AppImageV2
                        id={`flag_v2_${item.countryTag}`}
                        url={flagUrl}
                        transition={150}
                        placeholder="|rF?hV%2WCj[ayj[a|j[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj["
                        style={{ width: '100%', height: '100%' }}
                        fallbackComponent={
                            <View className="p-2">
                                <Iconify icon="heroicons:flag" size={16} color="gray" />
                            </View>
                        }
                    />
                </View>

                {/* Currency Description Core Meta Segment */}
                <View className="flex-1 ml-3.5">
                    <View className="flex-row items-center gap-x-1.5">
                        <AppText className={`font-bold text-sm ${isSelected ? 'text-bg-secondary' : 'text-text-primary'}`}>
                            {item.code}
                        </AppText>
                        <AppText variant="caption-xs" className="opacity-40 text-text-primary text-[11px]">
                            ({item.symbol})
                        </AppText>
                    </View>
                    <AppText variant="caption-xs" className="opacity-60 text-text-primary mt-0.5 text-[11px]">
                        {t(item.name)}
                    </AppText>
                </View>

                {/* Contextualized User Exchange Rate Metric Box */}
                {showConversionRates && localConversionTranslation.length > 0 && (
                    <View className="items-end mr-2">
                        <AppText className={`text-[10px] font-semibold ${isSelected ? 'text-bg-secondary/80 font-bold' : 'text-text-primary-lighter'}`}>
                            {localConversionTranslation}
                        </AppText>
                    </View>
                )}

                {isSelected && (
                    <Iconify icon="heroicons:check-circle-20-solid" size={20} color={brandGreen} />
                )}
            </Pressable>
        );
    }, [currentCurrency, brandGreen, calculateConversionSubtitle, showConversionRates, onSelect, t]);

    const currenciesList = useMemo(() => Object.values(Currency), []);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            {/* Centered Overlay Window Container */}
            <View className="flex-1 justify-center items-center bg-black/60 px-5">

                {/* Floating Dialog Box Frame using design variables */}
                <View className="bg-white dark:bg-zinc-950 w-full rounded-[28px] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl max-h-[75%]">

                    {/* Relative Header Structure */}
                    <View className="w-full flex-row items-center justify-between mb-5">
                        <AppText variant="h3" className="font-extrabold text-text-primary text-base">
                            {t('common.currency.select', 'Select Currency')}
                        </AppText>

                        <Pressable onPress={onClose} className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full active:opacity-60">
                            <Iconify icon="heroicons:x-mark" size={14} color={iconColor} />
                        </Pressable>
                    </View>

                    {/* Fast Scrolling List Grid */}
                    <FlatList
                        data={currenciesList}
                        keyExtractor={(item) => item.code}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 4 }}
                        renderItem={renderCurrencyItem}
                        removeClippedSubviews={true}
                        initialNumToRender={8}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                    />

                </View>
            </View>
        </Modal>
    );
});

CurrencyModal.displayName = 'CurrencyModal';
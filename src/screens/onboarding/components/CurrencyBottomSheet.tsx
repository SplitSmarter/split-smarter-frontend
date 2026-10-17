import React, {useCallback, useMemo, useRef, useEffect, useLayoutEffect, useState} from 'react';
import {View, Pressable} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetFlatList,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {useTranslation} from 'react-i18next';
import {themeStore} from '@/src/store/themeStore';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppImage} from '@/src/components/common/AppImage';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {Currency} from '@/src/constants/expense/currency';
import {COLORS} from '@/src/constants/colors';
import {i18n as i18nInstance} from '@/src/i18n/index';

type CurrencyItem = (typeof Currency)[keyof typeof Currency];

const ALL_CURRENCIES = Object.values(Currency);
const SEARCH_DEBOUNCE_MS = 320;

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
    onSelect,
}: CurrencyBottomSheetProps) => {
    const {t, i18n} = useTranslation('translation', {i18n: i18nInstance});
    const {theme} = themeStore();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const iconColor = colors.icon.primary;
    const snapPoints = useMemo(() => ['70%'], []);

    /** Immediate input value — keeps typing fluent. */
    const [search, setSearch] = useState('');
    /** Applied filter query — updates after typing pauses. */
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build search haystacks lazily / once per language — not on every open.
    const currencySearchIndex = useMemo(
        () =>
            ALL_CURRENCIES.map((item) => ({
                item,
                haystack: `${item.code} ${item.symbol} ${item.countryTag} ${t(item.name)}`.toLowerCase(),
            })),
        // i18n.language keeps index in sync if locale changes without rebuilding on open.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [i18n.language],
    );

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = search.trim();
        if (!trimmed) {
            setDebouncedQuery('');
            return;
        }

        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(trimmed.toLowerCase());
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search]);

    const filteredCurrencies = useMemo(() => {
        if (!debouncedQuery) return ALL_CURRENCIES;
        return currencySearchIndex
            .filter(({haystack}) => haystack.includes(debouncedQuery))
            .map(({item}) => item);
    }, [currencySearchIndex, debouncedQuery]);

    // Present/dismiss as early as possible (before paint) so open feels instant.
    useLayoutEffect(() => {
        if (isVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isVisible]);

    // Reset search after visibility settles — don't block present().
    useEffect(() => {
        if (!isVisible) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearch('');
        setDebouncedQuery('');
    }, [isVisible]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        [],
    );

    const handleClearSearch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearch('');
        setDebouncedQuery('');
    }, []);

    const renderCurrencyItem = useCallback(
        ({item}: {item: CurrencyItem}) => {
            const isSelected = currentCurrency === item.code;
            const flagUrl = `https://flagcdn.com/256x192/${item.countryTag.toLowerCase()}.png`;

            return (
                <Pressable
                    onPress={() => onSelect(item.code)}
                    className={`flex-row items-center p-4 rounded-2xl border ${
                        isSelected
                            ? 'border-accent-sky bg-accent-sky-bg'
                            : 'border-bg-primary-darker'
                    }`}
                >
                    <AppImage
                        id={`flag_${item.countryTag}`}
                        url={flagUrl}
                        size="md"
                        variant="circular"
                        borderEnabled={true}
                        borderColor={
                            isSelected ? `${colors.accent.sky}33` : `${colors.text.primary}0D`
                        }
                        fallbackIcon={
                            <EntityFallbackIcon
                                kind="currencyFlag"
                                size={24}
                                color={colors.icon.lighter}
                            />
                        }
                    />

                    <View className="flex-1 ml-4">
                        <View className="flex-row items-center gap-x-2">
                            <AppText
                                variant="body-base"
                                className={`font-bold ${isSelected ? 'text-accent-sky' : 'text-text-primary'}`}
                            >
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
                        <Iconify
                            icon="heroicons:check-circle-20-solid"
                            size={24}
                            color={colors.accent.sky}
                        />
                    )}
                </Pressable>
            );
        },
        [currentCurrency, colors, onSelect, t],
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            enableOverDrag={false}
            backgroundStyle={{backgroundColor: colors.bg.overlay}}
            handleIndicatorStyle={{backgroundColor: colors.icon.lighter, width: 40}}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
        >
            <View className="flex-1 px-6 pt-2 pb-10">
                <View className="relative mb-4 items-center justify-center py-1">
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        {t('common.currency.select', 'Select Currency')}
                    </AppText>
                    <Pressable
                        onPress={onClose}
                        hitSlop={8}
                        className="absolute right-0 top-0 p-2 bg-bg-primary-darker/10 rounded-full"
                    >
                        <Iconify icon="heroicons:x-mark" size={18} color={iconColor} />
                    </Pressable>
                </View>

                <View className="mb-4">
                    <AppInput
                        placeholder={t('common.currency.search', 'Search currency...')}
                        value={search}
                        onChangeText={setSearch}
                        autoCorrect={false}
                        autoCapitalize="none"
                        renderLeftIcon={(color) => (
                            <Iconify icon="heroicons:magnifying-glass" size={20} color={color} />
                        )}
                        renderRightIcon={(color) =>
                            search.length > 0 ? (
                                <Pressable onPress={handleClearSearch} hitSlop={8}>
                                    <Iconify icon="heroicons:x-mark" size={20} color={color} />
                                </Pressable>
                            ) : null
                        }
                    />
                </View>

                <BottomSheetFlatList
                    data={filteredCurrencies}
                    keyExtractor={(item) => item.code}
                    contentContainerStyle={{gap: 12, paddingBottom: 20}}
                    renderItem={renderCurrencyItem}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={10}
                    maxToRenderPerBatch={8}
                    windowSize={5}
                    removeClippedSubviews
                    ListEmptyComponent={
                        <View className="items-center py-10">
                            <AppText className="text-text-primary-lighter">
                                {t('common.currency.no_results', 'No currencies found')}
                            </AppText>
                        </View>
                    }
                />
            </View>
        </BottomSheetModal>
    );
});

CurrencyBottomSheet.displayName = 'CurrencyBottomSheet';

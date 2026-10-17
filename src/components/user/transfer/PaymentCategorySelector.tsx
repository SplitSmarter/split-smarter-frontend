import React, {useState, useEffect} from 'react';
import { COLORS } from '@/src/constants/colors';
import {View, ScrollView, Pressable} from 'react-native';
import { themeStore } from '@/src/store/themeStore';
import {useTranslation} from 'react-i18next';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {Shimmer} from '@/src/components/common/shimmer';
import {GetConsumerPaymentCategorySummariesApi} from '@/src/api/user_payment/categories';
import {ConsumerPaymentCategorySummaryResponse} from '@/src/api/dto/user_payments/categories';
import {useTransferDraftStore} from '@/src/store/draft/transferDraftStore';

/** Matches loaded chips: w-20 + py-3 + sm icon (32) + mb-2 + caption */
const CATEGORY_CHIP_HEIGHT = 78;
const CATEGORY_CHIP_RADIUS = 16;
const SHIMMER_CHIP_COUNT = 4;

export const PaymentCategorySelector: React.FC = () => {
    const {t} = useTranslation();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const [categories, setCategories] = useState<ConsumerPaymentCategorySummaryResponse[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Consume store values and actions directly
    const selectedCategoryId = useTransferDraftStore((state) => state.paymentCategoryId);
    const setPaymentCategoryId = useTransferDraftStore((state) => state.setPaymentCategoryId);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await GetConsumerPaymentCategorySummariesApi();
            if (res && res.data && res.data.length > 0) {
                setCategories(res.data);

                // Default select the category containing "Other" if none is selected yet
                if (!selectedCategoryId) {
                    const otherCategory = res.data.find((cat) =>
                        cat.name.toLowerCase().includes('other')
                    );
                    if (otherCategory) {
                        setPaymentCategoryId(otherCategory.id as any);
                    } else {
                        // Fallback to the first category if "Other" isn't present
                        setPaymentCategoryId(res.data[0].id as any);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching payment categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    return (
        <View>
            <AppText variant="body-base" className="font-semibold text-text-primary">
                {t('transfer.category_label', 'Payment Category')}
            </AppText>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: 2, gap: 10}}
            >
                {loadingCategories
                    ? Array.from({length: SHIMMER_CHIP_COUNT}, (_, i) => (
                        <Shimmer
                            key={`category-shimmer-${i}`}
                            height={CATEGORY_CHIP_HEIGHT}
                            borderRadius={CATEGORY_CHIP_RADIUS}
                            className="w-20"
                        />
                    ))
                    : categories.map((cat) => {
                        const isSelected = selectedCategoryId !== null && String(selectedCategoryId) === String(cat.id);
                        return (
                            <Pressable
                                key={cat.id}
                                onPress={() => setPaymentCategoryId(cat.id as any)}
                                className={`w-20 py-3 px-2 rounded-2xl items-center justify-between border ${
                                    isSelected
                                        ? 'bg-accent-sky-bg border-accent-sky'
                                        : 'bg-bg-primary border-border-input'
                                }`}
                            >
                                <View className="mb-2 items-center justify-center">
                                    <AppImage
                                        url={cat.icon?.url}
                                        size="sm"
                                        variant="rounded"
                                        fallbackIcon={
                                            <EntityFallbackIcon
                                                kind="paymentCategory"
                                                size={18}
                                                color={colors.accent.orbIndigo}
                                            />
                                        }
                                    />
                                </View>
                                <AppText
                                    variant="caption-xs"
                                    numberOfLines={1}
                                    className={`font-semibold text-center ${isSelected ? 'text-accent-sky' : 'text-text-primary'}`}
                                >
                                    {cat.name}
                                </AppText>
                            </Pressable>
                        );
                    })}
            </ScrollView>
        </View>
    );
};
import React, {useState, useEffect} from 'react';
import {View, ScrollView, ActivityIndicator, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {useTranslation} from 'react-i18next';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {GetConsumerPaymentCategorySummariesApi} from '@/src/api/user_payment/categories';
import {ConsumerPaymentCategorySummaryResponse} from '@/src/api/dto/user_payments/categories';
import {useTransferDraftStore} from '@/src/store/draft/transferDraftStore';

export const PaymentCategorySelector: React.FC = () => {
    const {t} = useTranslation();
    const [categories, setCategories] = useState<ConsumerPaymentCategorySummaryResponse[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

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

            {loadingCategories ? (
                <View className="py-4 items-center justify-center">
                    <ActivityIndicator size="small" color="#2D6A4F"/>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingVertical: 2, gap: 10}}
                >
                    {categories.map((cat) => {
                        const isSelected = selectedCategoryId !== null && String(selectedCategoryId) === String(cat.id);
                        return (
                            <Pressable
                                key={cat.id}
                                onPress={() => setPaymentCategoryId(cat.id as any)}
                                className={`w-20 py-3 px-2 rounded-2xl items-center justify-between border ${
                                    isSelected
                                        ? 'bg-bg-secondary/10 border-bg-secondary/30'
                                        : 'bg-bg-primary border-bg-secondary-lighter'
                                }`}
                            >
                                <View className="mb-2 items-center justify-center">
                                    {cat.icon?.url ? (
                                        <AppImage url={cat.icon.url} size="sm" variant="rounded"/>
                                    ) : (
                                        <View
                                            className="w-10 h-10 rounded-full bg-indigo-500/10 items-center justify-center">
                                            <Iconify icon="heroicons:tag" size={18} color="#6366F1"/>
                                        </View>
                                    )}
                                </View>
                                <AppText
                                    variant="caption-xs"
                                    numberOfLines={1}
                                    className={`font-semibold text-center ${isSelected ? 'text-green-increase' : 'text-text-primary'}`}
                                >
                                    {cat.name}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};
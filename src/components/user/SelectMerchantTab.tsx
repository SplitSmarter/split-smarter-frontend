import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { BottomSheetTextInput, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppImage } from "@/src/components/common/AppImage";
import { COLORS } from "@/src/constants/colors";
import { UserMerchantDetails } from "@/src/api/dto/expense/merchant";
import { SearchMerchantsApi } from "@/src/api/expense/merchant"; // Adjust import path if needed

interface SelectMerchantTabProps {
    isDark: boolean;
    selectedMerchantId?: number;
    onClose: () => void;
    onSelect: (merchantId: number, merchant: UserMerchantDetails, merchants: UserMerchantDetails[]) => void;
}

export const SelectMerchantTab = ({
                                      isDark,
                                      selectedMerchantId,
                                      onClose,
                                      onSelect
                                  }: SelectMerchantTabProps) => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [merchants, setMerchants] = useState<UserMerchantDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async (query?: string) => {
        setLoading(true);
        try {
            const trimmedQuery = query?.trim();
            const response = await SearchMerchantsApi({
                q: trimmedQuery && trimmedQuery.length > 0 ? trimmedQuery : undefined,
                limit: 50
            });

            if (response.data) {
                setMerchants(response.data);
            }
        } catch (error) {
            console.error("Error fetching merchants:", error);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSearching(true);
            fetchMerchants(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const handleAddNewMerchant = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/merchant/add'); // Adjust route as necessary
        }, 200);
    };

    const renderItem = useCallback(({ item }: { item: UserMerchantDetails }) => {
        const isSelected = selectedMerchantId === item.id;
        const subtitle = item.mcc_code?.description || item.website || "Merchant";

        return (
            <MerchantRowItem
                merchant={item}
                isSelected={isSelected}
                subtext={subtitle}
                onPress={(id: number, merchantObj: UserMerchantDetails) => {
                    onSelect(id, merchantObj, merchants);
                    onClose();
                }}
            />
        );
    }, [selectedMerchantId, merchants, onClose, onSelect]);

    return (
        <View className="flex-1">
            <View className="my-3 flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12">
                <Iconify icon="heroicons:magnifying-glass" size={20} color={isDark ? '#71717A' : '#A1A1AA'} />
                <BottomSheetTextInput
                    style={[styles.input, { color: isDark ? '#FFF' : '#000' }]}
                    placeholder="Search merchant name, category..."
                    placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                    value={search}
                    onChangeText={setSearch}
                />
                {isSearching && (
                    <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light} />
                )}
                <Pressable onPress={handleAddNewMerchant} className="ml-2 p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800">
                    <Iconify icon="heroicons:building-storefront" size={18} color={!isDark ? COLORS.light.icon.darker : COLORS.light.text.contrast} />
                </Pressable>
            </View>

            {loading && merchants.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator size="large" color="#2D6A4F" />
                </View>
            ) : (
                <BottomSheetFlatList
                    data={merchants}
                    keyExtractor={(item) => `merchant-${item.id}`}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const MerchantRowItem = React.memo(({ merchant, isSelected, onPress, subtext }: any) => {
    return (
        <Pressable
            onPress={() => onPress(merchant.id, merchant)}
            className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                isSelected
                    ? 'bg-bg-secondary/10 border border-bg-secondary/30'
                    : 'bg-white dark:bg-zinc-900 border border-transparent'
            }`}
        >
            <AppImage url={merchant.logo?.url} size="sm" variant="rounded" />
            <View className="flex-1 ml-3">
                <AppText className="font-semibold text-text-primary">{merchant.name}</AppText>
                <AppText variant="caption-xs" className="text-text-secondary opacity-60" numberOfLines={1}>
                    {subtext}
                </AppText>
            </View>
            {isSelected ? (
                <Iconify icon="heroicons:check-circle-solid" size={24} color={COLORS.icon_primary_darker_light} />
            ) : (
                <Iconify icon="heroicons:check-circle" size={24} color={COLORS.icon_secondary_light} />
            )}
        </Pressable>
    );
}, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected &&
        prevProps.merchant.id === nextProps.merchant.id &&
        prevProps.merchant.name === nextProps.merchant.name &&
        prevProps.merchant.logo?.url === nextProps.merchant.logo?.url &&
        prevProps.subtext === nextProps.subtext;
});

MerchantRowItem.displayName = 'MerchantRowItem';

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 12,
        height: '100%'
    }
});
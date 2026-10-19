import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    ActivityIndicator,
    Pressable,
    StyleSheet,
    TextInput,
    FlatList,
    type ListRenderItem,
} from 'react-native';
import {BottomSheetTextInput, BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {SearchClearButton} from '@/src/components/common/SearchClearButton';
import {COLORS} from '@/src/constants/colors';
import {UserMerchantDetails} from '@/src/api/dto/expense/merchant';
import {SearchMerchantsApi} from '@/src/api/expense/merchant';

interface SelectMerchantTabProps {
    isDark: boolean;
    selectedMerchantId?: number;
    onClose: () => void;
    onSelect: (
        merchantId: number,
        merchant: UserMerchantDetails,
        merchants: UserMerchantDetails[]
    ) => void;
    /**
     * `sheet` — BottomSheet* input/list (default, for @gorhom sheets).
     * `plain` — RN TextInput/FlatList (modals / non-sheet hosts).
     */
    variant?: 'sheet' | 'plain';
}

export const SelectMerchantTab = ({
    isDark,
    selectedMerchantId,
    onClose,
    onSelect,
    variant = 'sheet',
}: SelectMerchantTabProps) => {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const [search, setSearch] = useState('');
    const [merchants, setMerchants] = useState<UserMerchantDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const isPlain = variant === 'plain';

    const fetchMerchants = useCallback(async (query?: string) => {
        setLoading(true);
        try {
            const trimmedQuery = query?.trim();
            const response = await SearchMerchantsApi({
                q:
                    trimmedQuery && trimmedQuery.length > 0
                        ? trimmedQuery
                        : undefined,
                limit: 50,
            });

            if (response.data) {
                setMerchants(response.data);
            }
        } catch (error) {
            console.error('Error fetching merchants:', error);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    }, []);

    // Single load path: empty query on open + debounced search (avoids double mount fetch).
    useEffect(() => {
        const trimmed = search.trim();
        const delayMs = trimmed.length === 0 ? 0 : 500;
        if (trimmed.length > 0) {
            setIsSearching(true);
        }
        const timer = setTimeout(() => {
            void fetchMerchants(search);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [search, fetchMerchants]);

    const renderItem = useCallback<ListRenderItem<UserMerchantDetails>>(
        ({item}) => {
            const isSelected = selectedMerchantId === item.id;
            const subtitle =
                item.mcc_code?.description || item.website || 'Merchant';

            return (
                <MerchantRowItem
                    merchant={item}
                    isSelected={isSelected}
                    isDark={isDark}
                    subtext={subtitle}
                    onPress={(id: number, merchantObj: UserMerchantDetails) => {
                        onSelect(id, merchantObj, merchants);
                        onClose();
                    }}
                />
            );
        },
        [selectedMerchantId, merchants, onClose, onSelect, isDark]
    );

    const SearchInput = isPlain ? TextInput : BottomSheetTextInput;
    const List = isPlain ? FlatList : BottomSheetFlatList;

    return (
        <View className="flex-1">
            <View
                className="my-3 flex-row items-center rounded-2xl border px-4 h-12"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                }}
            >
                <Iconify
                    icon="heroicons:magnifying-glass"
                    size={20}
                    color={colors.icon.lighter}
                />
                <SearchInput
                    style={[styles.input, {color: colors.text.primary}]}
                    placeholder="Search merchant name, category..."
                    placeholderTextColor={colors.text.placeholder}
                    value={search}
                    onChangeText={setSearch}
                />
                {isSearching ? (
                    <ActivityIndicator
                        size="small"
                        color={colors.icon.primary}
                    />
                ) : (
                    <SearchClearButton
                        value={search}
                        onClear={() => setSearch('')}
                        color={colors.icon.primary}
                        size={18}
                    />
                )}
            </View>

            {loading && merchants.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator
                        size="large"
                        color={colors.icon.primary}
                    />
                </View>
            ) : (
                <List
                    data={merchants}
                    keyExtractor={(item: UserMerchantDetails) =>
                        `merchant-${item.id}`
                    }
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 40}}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const MerchantRowItem = React.memo(
    ({merchant, isSelected, isDark, onPress, subtext}: any) => {
        const colors = isDark ? COLORS.dark : COLORS.light;

        return (
            <Pressable
                onPress={() => onPress(merchant.id, merchant)}
                className={`flex-row items-center p-3 rounded-2xl mb-2 border ${
                    isSelected
                        ? 'bg-accent-sky-bg border-accent-sky'
                        : 'border-transparent'
                }`}
                style={
                    isSelected
                        ? undefined
                        : {backgroundColor: colors.bg.lighter}
                }
            >
                <AppImage
                    url={merchant.logo?.url}
                    size="sm"
                    variant="rounded"
                    fallbackIcon={
                        <EntityFallbackIcon
                            kind="merchant"
                            size={18}
                            color={colors.icon.lighter}
                        />
                    }
                />
                <View className="flex-1 ml-3">
                    <AppText className="font-semibold text-text-primary">
                        {merchant.name}
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="text-text-primary-lighter opacity-60"
                        numberOfLines={1}
                    >
                        {subtext}
                    </AppText>
                </View>
                {isSelected ? (
                    <Iconify
                        icon="heroicons:check-circle-solid"
                        size={24}
                        color={colors.accent.sky}
                    />
                ) : (
                    <Iconify
                        icon="heroicons:check-circle"
                        size={24}
                        color={colors.icon.primary}
                    />
                )}
            </Pressable>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.isSelected === nextProps.isSelected &&
            prevProps.merchant.id === nextProps.merchant.id &&
            prevProps.merchant.name === nextProps.merchant.name &&
            prevProps.merchant.logo?.url === nextProps.merchant.logo?.url &&
            prevProps.subtext === nextProps.subtext
        );
    }
);

MerchantRowItem.displayName = 'MerchantRowItem';

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 12,
        height: '100%',
    },
});

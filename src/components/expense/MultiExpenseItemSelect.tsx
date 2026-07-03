import { ExpenseItemSource } from "@/src/api/dto/constants";
import { GetExpenseItemsApi } from "@/src/api/expense/items";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { AppInput } from '@/src/components/common/AppInput';
import { AppText } from '@/src/components/common/AppText';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { themeStore } from "@/src/store/themeStore";
import { useExpenseDraftStore, ExpenseItem as StoreExpenseItem } from "@/src/store/draft/expenseDraftStore";
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, KeyboardAvoidingView, Platform,
    Pressable,
    ScrollView,
    Modal,
    View
} from 'react-native';
import { Iconify } from "react-native-iconify";

interface ApiExpenseItem {
    id: number;
    title: string;
    description?: string | null;
    cost: number;
    item_type: string;
    icon?: { url: string; } | null;
}

interface Props {
    onSave: (items: StoreExpenseItem[]) => void;
    onAddNew: () => void;
}

type FilterTab = 'All' | 'Default' | 'Custom';

const MultiExpenseItemSelect = ({ onSave, onAddNew }: Props) => {
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    const draft = useExpenseDraftStore();

    const [allItems, setAllItems] = useState<ApiExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Mismatch confirmation state
    const [mismatchModalVisible, setMismatchModalVisible] = useState(false);

    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                setLoading(true);
                const res = await GetExpenseItemsApi([ExpenseItemSource.DEFAULT, ExpenseItemSource.CUSTOM]);
                if (res.data) {
                    const mappedItems: ApiExpenseItem[] = res.data.map(item => ({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        cost: item.cost,
                        item_type: item.item_type,
                        icon: item.icon ? { url: item.icon.url } : null
                    }));
                    setAllItems(mappedItems);
                }
            } catch (error) {
                console.error("Failed to load inventory items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllItems();
    }, []);

    const displayedItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTab =
                activeTab === 'All' ||
                (activeTab === 'Default' && item.item_type === ExpenseItemSource.DEFAULT) ||
                (activeTab === 'Custom' && item.item_type === ExpenseItemSource.CUSTOM);
            return matchesSearch && matchesTab;
        });
    }, [allItems, searchQuery, activeTab]);

    // Calculate sum total of items dynamically
    const selectedItemsTotal = useMemo(() => {
        return draft.expenseItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    }, [draft.expenseItems]);

    const handleToggle = (item: ApiExpenseItem) => {
        const stringId = String(item.id);
        const exists = draft.expenseItems.find(i => i.id === stringId);

        if (exists) {
            draft.setExpenseItems(draft.expenseItems.filter(i => i.id !== stringId));
        } else {
            draft.setExpenseItems([
                ...draft.expenseItems,
                {
                    id: stringId,
                    title: item.title,
                    cost: item.cost,
                    quantity: 1,
                    iconUrl: item.icon?.url || null,
                    sharedBetween: []
                }
            ]);
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        const updatedList = draft.expenseItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);

        draft.setExpenseItems(updatedList);
    };

    // Intercept checkout selection for mismatch inspection logic
    const handleConfirmSelection = () => {
        if (draft.expenseItems.length > 0 && selectedItemsTotal !== draft.totalAmount) {
            setMismatchModalVisible(true);
        } else {
            onSave(draft.expenseItems);
        }
    };

    const handleUpdateAmountAndSave = () => {
        draft.setTotalAmount(selectedItemsTotal);
        setMismatchModalVisible(false);
        onSave(draft.expenseItems);
    };

    return (
        <ScreenWrapper backgroundColor={isDark ? "#121212" : "#F8F9FA"} withPadding={false}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">

                {/* Header: Selected Items */}
                <View className="pt-4 pb-2">
                    <AppText variant="h4" className="px-4 mb-2 opacity-60">Selected Items</AppText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}
                    >
                        {draft.expenseItems.map(item => (
                            <View key={item.id} className={`mr-4 p-3 rounded-2xl items-center border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <Pressable
                                    onPress={() => updateQuantity(item.id, -item.quantity)}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 z-10 shadow-sm"
                                >
                                    <Iconify icon="heroicons:x-mark" size={12} color="white" />
                                </Pressable>
                                <AppImageV2
                                    id={`selected-${item.id}`}
                                    url={item.iconUrl || null}
                                    style={{ width: 40, height: 40 }}
                                    className="rounded-full"
                                    contentFit="contain"
                                />
                                <AppText variant="body-small" className="mt-2 font-bold" numberOfLines={1}>{item.title}</AppText>
                                <View className={`flex-row items-center mt-2 rounded-lg px-1 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                    <Pressable onPress={() => updateQuantity(item.id, -1)} className="p-1">
                                        <Iconify icon="heroicons:minus" size={14} color={isDark ? "#AAA" : "#666"} />
                                    </Pressable>
                                    <AppText className="mx-2 font-bold">{item.quantity}</AppText>
                                    <Pressable onPress={() => updateQuantity(item.id, 1)} className="p-1">
                                        <Iconify icon="heroicons:plus" size={14} color={isDark ? "#AAA" : "#666"} />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                        {draft.expenseItems.length === 0 && (
                            <View className="h-20 justify-center px-4">
                                <AppText className="opacity-40 italic">No items selected yet</AppText>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Search & Filter Bar */}
                <View className="px-4 mt-2 mb-4">
                    <AppInput
                        placeholder="Search items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={isDark ? "#666" : "#999"}
                        renderLeftIcon={(color) => <Iconify icon="heroicons:magnifying-glass" size={20} color={color} />}
                    />
                    <View className="flex-row mt-4">
                        {(['All', 'Default', 'Custom'] as FilterTab[]).map((tab) => (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full mr-2 ${activeTab === tab ? 'bg-emerald-600' : 'bg-transparent border border-emerald-600/20'}`}
                            >
                                <AppText className={activeTab === tab ? 'text-white font-bold' : 'text-emerald-600'}>{tab}</AppText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Main List */}
                <FlatList
                    data={displayedItems}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                    className="flex-1"
                    renderItem={({ item }) => {
                        const stringId = String(item.id);
                        const isSelected = draft.expenseItems.some(i => i.id === stringId);
                        return (
                            <Pressable
                                onPress={() => handleToggle(item)}
                                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
                                    isSelected
                                        ? (isDark ? 'bg-emerald-900/20 border-emerald-500' : 'bg-emerald-50 border-emerald-200')
                                        : (isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100')
                                }`}
                            >
                                <AppImageV2
                                    id={`item-${item.id}`}
                                    url={item.icon?.url || null}
                                    style={{ width: 44, height: 44 }}
                                    className="rounded-full"
                                    contentFit="contain"
                                />
                                <View className="flex-1 ml-4">
                                    <AppText variant="h4" className={isDark ? "text-white" : "text-black"}>{item.title}</AppText>
                                    <AppText className="opacity-50">₹{item.cost}</AppText>
                                </View>
                                <View>
                                    {isSelected ? (
                                        <Iconify icon="heroicons:check-circle-solid" size={26} color="#10B981" />
                                    ) : (
                                        <Iconify icon="heroicons:plus-circle" size={26} color={isDark ? "#333" : "#D1D5DB"} />
                                    )}
                                </View>
                            </Pressable>
                        );
                    }}
                    ListEmptyComponent={loading ? <ActivityIndicator className="mt-10" color="#059669" /> : (
                        <View className="items-center mt-10">
                            <AppText className="opacity-40">No items found</AppText>
                        </View>
                    )}
                />

                {/* Footer Controls */}
                <View className={`p-4 pb-8 flex-row ${isDark ? 'bg-black border-t border-gray-900' : 'bg-white border-t border-gray-100'}`}>
                    <Pressable
                        onPress={onAddNew}
                        className="flex-1 h-14 border border-emerald-600 rounded-2xl flex-row items-center justify-center mr-2 active:opacity-70"
                    >
                        <Iconify icon="heroicons:plus" size={20} color="#059669" />
                        <AppText className="ml-2 text-emerald-600 font-bold">Add New</AppText>
                    </Pressable>
                    <Pressable
                        onPress={handleConfirmSelection}
                        className="flex-[2] h-14 bg-emerald-600 rounded-2xl items-center justify-center active:opacity-90 shadow-sm"
                    >
                        <AppText className="text-white font-bold text-lg">Save Selection</AppText>
                    </Pressable>
                </View>

                {/* Amount Mismatch Resolution Modal */}
                {/* Amount Mismatch Resolution Modal */}
                <Modal visible={mismatchModalVisible} animationType="fade" transparent>
                    <View className="flex-1 items-center justify-center bg-black/60 px-6">
                        <View className={`w-full p-6 rounded-3xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                            <View className="items-center mb-4">
                                <View className="p-3 bg-amber-500/10 rounded-full mb-2">
                                    <Iconify icon="heroicons:exclamation-triangle" size={32} color="#F59E0B" />
                                </View>
                                <AppText variant="h3" className="font-bold text-center">Amount Mismatch</AppText>
                            </View>

                            <AppText className="text-center opacity-70 mb-6">
                                The items sum to <AppText className="font-bold text-emerald-500">₹{selectedItemsTotal.toFixed(2)}</AppText>, but the expense amount is set to <AppText className="font-bold text-amber-500">₹{draft.totalAmount.toFixed(2)}</AppText>. How would you like to proceed?
                            </AppText>

                            <View className="gap-y-3">
                                {/* Option 1: Overwrite state with items cost calculation and save */}
                                <Pressable
                                    onPress={handleUpdateAmountAndSave}
                                    className="w-full h-12 bg-emerald-600 rounded-xl items-center justify-center active:opacity-90"
                                >
                                    <AppText className="text-white font-bold">Update Amount to ₹{selectedItemsTotal.toFixed(2)}</AppText>
                                </Pressable>

                                {/* Option 3: Dismiss warning modal and return right back to item lists modifications */}
                                <Pressable
                                    onPress={() => setMismatchModalVisible(false)}
                                    className="w-full h-12 items-center justify-center active:opacity-60"
                                >
                                    <AppText className="text-emerald-600 dark:text-emerald-400 font-bold">
                                        Go back
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default MultiExpenseItemSelect;
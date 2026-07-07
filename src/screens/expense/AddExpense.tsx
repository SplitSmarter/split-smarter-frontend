import { AppButton } from '@/src/components/common/AppButton';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { AppInput } from '@/src/components/common/AppInput';
import { AppText } from '@/src/components/common/AppText';
import { ExpenseAttachments } from "@/src/components/expense/ExpenseAttachments";
import MultiExpenseItemSelect from "@/src/components/expense/MultiExpenseItemSelect";
import { CategoryGroupLocationSelector } from "@/src/screens/expense/CGLSelector";
import { themeStore } from "@/src/store/themeStore";
import { userStore } from "@/src/store/userStore";
import { useExpenseDraftStore, PayerUser } from "@/src/store/draft/expenseDraftStore";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from "@/src/constants/expense/currency";
import { CurrencyBottomSheet } from "@/src/screens/Onboarding/comps/CurrencyBottomSheet";
import { router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppButtonV2 } from "@/src/components/common/AppButtonV2";
import { COLORS } from "@/src/constants/colors";

const AddExpenseScreen = () => {
    const { user } = userStore();
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    const [isItemSelectVisible, setIsItemSelectVisible] = useState(false);
    const [currencySheetOpen, setCurrencySheetOpen] = useState(false);

    // Bind completely to Zustand Context
    const draft = useExpenseDraftStore();

    // Safe string translation for input display
    const amountString = useMemo(() => {
        return draft.totalAmount === 0 ? "" : draft.totalAmount.toString();
    }, [draft.totalAmount]);

    // Handle proportional scaling calculations when total amount varies
    useEffect(() => {
        // If there's an amount but no participants have been assigned yet, stop calculation loop
        if (draft.payers.length === 0 && draft.splitParticipants.length === 0) return;

        const scaleDistribution = (prevList: PayerUser[]) => {
            if (prevList.length === 0) return prevList;

            const lockedSum = prevList.reduce((sum, u) => sum + (u.isLocked ? (u.amount || 0) : 0), 0);
            const remainingPool = Math.max(0, draft.totalAmount - lockedSum);

            const unlockedParticipants = prevList.filter(u => !u.isLocked);
            const totalShares = unlockedParticipants.reduce((sum, u) => sum + (u.shares ?? 1), 0);

            return prevList.map(p => {
                if (p.isLocked) return p;
                return {
                    ...p,
                    amount: totalShares > 0 ? (remainingPool * (p.shares ?? 1)) / totalShares : 0
                };
            });
        };

        // Distribute mathematically based on initial store populations smoothly
        const updatedPayers = scaleDistribution(draft.payers);
        const updatedParticipants = scaleDistribution(draft.splitParticipants);

        // Check if values actually changed to avoid repetitive state mutations
        const payersChanged = JSON.stringify(updatedPayers) !== JSON.stringify(draft.payers);
        const participantsChanged = JSON.stringify(updatedParticipants) !== JSON.stringify(draft.splitParticipants);

        if (payersChanged) draft.setPayers(updatedPayers);
        if (participantsChanged) draft.setSplitParticipants(updatedParticipants);

    }, [draft.totalAmount]); // Only run scaling when the input sum changes

    const handleAmountChange = (text: string) => {
        const parsed = parseFloat(text);
        draft.setTotalAmount(isNaN(parsed) || parsed < 0 ? 0 : parsed);
    };

    const handleCurrencySelect = (code: string) => {
        draft.setCurrency(code as CurrencyCode);
        setCurrencySheetOpen(false);
    };

    const handleOpenPaidBy = () => {
        router.push({
            pathname: '/(authenticated)/expense/user/split',
            params: { type: 'paidBy', totalExpense: draft.totalAmount.toString() }
        });
    };

    const handleOpenSplitSelect = () => {
        router.push({
            pathname: '/(authenticated)/expense/user/split',
            params: { type: 'split', totalExpense: draft.totalAmount.toString() }
        });
    };

    const payerText = useMemo(() => {
        if (draft.payers.length === 0) return "No one paid";
        const hasMe = draft.payers.some(p => String(p.id) === String(user?.id));
        if (draft.payers.length === 1) return hasMe ? "Paid by You" : `Paid by ${draft.payers[0].name}`;
        return hasMe ? `Paid by You and ${draft.payers.length - 1} Others` : `Paid by ${draft.payers[0].name} and ${draft.payers.length - 1} Others`;
    }, [draft.payers, user]);

    const splitTextSummary = useMemo(() => {
        if (draft.splitParticipants.length === 0) return "Split with no one";
        const hasMe = draft.splitParticipants.some(p => String(p.id) === String(user?.id));
        if (draft.splitParticipants.length === 1) return hasMe ? "Split completely with Yourself" : `Split with ${draft.splitParticipants[0].name}`;
        return hasMe ? `Split between You and ${draft.splitParticipants.length - 1} others` : `Split between ${draft.splitParticipants[0].name} and ${draft.splitParticipants.length - 1} others`;
    }, [draft.splitParticipants, user]);

    const activeCurrencyConfig = Currency[draft.currency];

    return (
        <>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                <View className="gap-y-6">
                    {/* 1. Name Input */}
                    <AppInput
                        label="Name"
                        value={draft.title}
                        onChangeText={draft.setTitle}
                        placeholder="Enter Name"
                        placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                    />

                    {/* 2. Amount Input */}
                    <AppInput
                        label="Amount"
                        value={amountString}
                        onChangeText={handleAmountChange}
                        placeholder="0.00"
                        placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                        renderLeftIcon={() => (
                            <Pressable
                                onPress={() => setCurrencySheetOpen(true)}
                                className="flex-row items-center mr-2 pr-2 border-r border-bg-secondary-lighter"
                            >
                                <AppText className="text-bg-secondary text-heading-h3 font-bold">
                                    {activeCurrencyConfig?.symbol ?? '₹'}
                                </AppText>
                                <Iconify
                                    icon="heroicons:chevron-down"
                                    size={14}
                                    color={isDark ? COLORS.dark.brand.primary : COLORS.light.brand.primary}
                                    className="ml-1"
                                />
                            </Pressable>
                        )}
                        keyboardType="numeric"
                        renderRightIcon={() => (
                            <Pressable onPress={() => draft.setTotalAmount(0)}>
                                <AppText variant="body-small" className="text-bg-secondary font-medium">Clear</AppText>
                            </Pressable>
                        )}
                    />

                    <CategoryGroupLocationSelector />

                    {/* 4. Paid By Selection Box */}
                    <AppButtonV2
                        variant="secondary"
                        size="none"
                        className="w-full flex-row justify-between items-center px-6 py-4 rounded-full border border-border-input bg-bg-primary-lighter"
                        onPress={handleOpenPaidBy}
                        hasShadow={false}
                    >
                        <View className="flex-1 items-start space-y-0.5">
                            <AppText variant="caption-xs"
                                     className="text-text-primary-lighter font-semibold uppercase tracking-wider">
                                Paid By
                            </AppText>
                            <AppText variant="body-base" className="text-text-primary font-medium">
                                {payerText}
                            </AppText>
                        </View>

                        <Iconify
                            icon="heroicons:chevron-right"
                            size={20}
                            color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary}
                        />
                    </AppButtonV2>

                    {/* 5. Split Between List Component Box */}
                    <Pressable
                        className="bg-bg-primary-lighter rounded-2xl p-4 shadow-sm border border-border-input"
                        onPress={handleOpenSplitSelect}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <AppText variant="h4" className="font-bold text-text-primary">Split Between</AppText>
                            <Iconify icon="heroicons:pencil-square" size={20}
                                     color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary} />
                        </View>

                        {draft.splitParticipants.length > 0 ? (
                            draft.splitParticipants.map((participant, index) => (
                                <View
                                    key={`split-${participant.id}-${participant.user_type}`}
                                    className={`flex-row items-center justify-between py-3 ${index !== draft.splitParticipants.length - 1 ? 'border-b border-border-input' : ''}`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        {participant.avatar?.url ? (
                                            <AppImageV2 id={`avatar-${participant.name}`} url={participant.avatar.url}
                                                        style={{ width: 24, height: 24 }} className="rounded-full" />
                                        ) : (
                                            <View style={{ width: 24, height: 24 }}
                                                  className="bg-gray-200 dark:bg-zinc-800 rounded-full items-center justify-center">
                                                <Iconify icon="heroicons:user-solid" size={12} color="#999" />
                                            </View>
                                        )}
                                        <AppText
                                            className="ml-3 flex-1 text-text-primary font-medium">{participant.name}</AppText>
                                    </View>
                                    <AppText
                                        className="font-bold text-text-primary">
                                        {activeCurrencyConfig?.symbol ?? '₹'}{(participant.amount || 0).toFixed(2)}
                                    </AppText>
                                </View>
                            ))
                        ) : (
                            <AppText variant="caption-xs" className="text-text-primary opacity-60 font-medium">{splitTextSummary}</AppText>
                        )}
                    </Pressable>

                    {/* 6. Items Section */}
                    <Pressable
                        className="bg-bg-primary-lighter rounded-2xl p-4 shadow-sm border border-border-input"
                        onPress={() => setIsItemSelectVisible(true)}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <AppText variant="h4" className="font-bold text-text-primary">Items</AppText>
                            <Iconify icon="heroicons:pencil-square" size={20}
                                     color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary} />
                        </View>
                        {draft.expenseItems.length > 0 ? (
                            draft.expenseItems.map((item, index) => (
                                <View key={item.id}
                                      className={`flex-row items-center justify-between py-3 ${index !== draft.expenseItems.length - 1 ? 'border-b border-b-secondary-lighter' : ''}`}>
                                    <View className="flex-row items-center flex-1">
                                        {item.iconUrl ? (
                                            <AppImageV2 id={`selected-item-${item.id}`} url={item.iconUrl}
                                                        style={{ width: 24, height: 24 }} contentFit="contain" />
                                        ) : (
                                            <View style={{ width: 24, height: 24 }}
                                                  className="bg-gray-200 rounded-full items-center justify-center">
                                                <Iconify icon="heroicons:shopping-cart" size={12} color="#999" />
                                            </View>
                                        )}
                                        <View className="ml-3 flex-1">
                                            <AppText className="text-text-primary font-medium">{item.title}</AppText>
                                            <AppText variant="body-small"
                                                     className="text-text-secondary">Qty: {item.quantity}</AppText>
                                        </View>
                                    </View>
                                    <AppText
                                        className="font-bold text-text-primary">
                                        {activeCurrencyConfig?.symbol ?? '₹'}{(item.cost * item.quantity).toFixed(2)}
                                    </AppText>
                                </View>
                            ))
                        ) : (
                            <AppText variant="caption-xs"
                                     className="text-text-primary opacity-60 font-medium">No items selected</AppText>
                        )}
                    </Pressable>

                    <ExpenseAttachments onAttachmentsChange={(uris) => {
                        draft.setLocalAttachmentUris(uris)
                    }} />
                </View>
            </ScrollView>

            <Modal visible={isItemSelectVisible} animationType="slide" transparent
                   onRequestClose={() => setIsItemSelectVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <Pressable className="absolute inset-0" onPress={() => setIsItemSelectVisible(false)} />
                    <View style={{ height: '90%', zIndex: 1 }}
                          className={`rounded-t-[32px] overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}>
                        <View className="items-center pt-3 pb-1">
                            <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </View>
                        <View className="flex-1">
                            <MultiExpenseItemSelect
                                onSave={(items) => {
                                    draft.setExpenseItems(items);
                                    setIsItemSelectVisible(false);
                                }}
                                onAddNew={() => console.log('Add new item')}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <CurrencyBottomSheet
                isVisible={currencySheetOpen}
                currentCurrency={draft.currency}
                onSelect={handleCurrencySelect}
                onClose={() => setCurrencySheetOpen(false)}
            />
        </>
    );
};

export default AddExpenseScreen;
import {AppInput} from '@/src/components/common/AppInput';
import {AppText} from '@/src/components/common/AppText';
import {ExpenseAttachments} from "@/src/components/expense/ExpenseAttachments";
import MultiExpenseItemSelect from "@/src/components/expense/MultiExpenseItemSelect";
import {CategoryGroupLocationSelector} from "@/src/screens/expense/CGLSelector";
import {themeStore} from "@/src/store/themeStore";
import {userStore} from "@/src/store/userStore";
import {useExpenseDraftStore} from "@/src/store/draft/expenseDraftStore";
import {Currency, CurrencyCode} from "@/src/constants/expense/currency";
import {CurrencyBottomSheet} from "@/src/screens/Onboarding/comps/CurrencyBottomSheet";
import {router} from 'expo-router';
import React, {useEffect, useMemo, useState} from 'react';
import {Modal, Pressable, ScrollView, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppButtonV2} from "@/src/components/common/AppButtonV2";
import {COLORS} from "@/src/constants/colors";
import {distributeProportionalAmounts, getPayerSummaryText} from "@/src/utils/expense/expenseCalculations";
import {RelationWithUserType} from "@/src/api/dto/constants";
import {DraftValidationErrorKey} from "@/src/interfaces/expense/draft_validation";
import {SplitSectionCard} from "@/src/screens/expense/SplitSectionCard";
import {ItemsSectionCard} from "@/src/screens/expense/ItemsSectionCard";

const AddExpenseScreen = () => {
    const {user} = userStore();
    const {theme} = themeStore();
    const isDark = theme === 'dark';

    const [isItemSelectVisible, setIsItemSelectVisible] = useState(false);
    const [currencySheetOpen, setCurrencySheetOpen] = useState(false);

    const draft = useExpenseDraftStore();
    const activeCurrencyConfig = Currency[draft.currency];

    // Safe string translation for input display
    const amountString = useMemo(() => {
        return draft.totalAmount === 0 ? "" : draft.totalAmount.toString();
    }, [draft.totalAmount]);

    const handleTitleChange = (text: string) => {
        draft.setTitle(text);
        draft.runIntegrityValidation(DraftValidationErrorKey.TITLE_REQUIRED);
    };

    // Handle Amount changes with immediate validation sync
    const handleAmountChange = (text: string) => {
        const parsed = parseFloat(text);
        const amount = isNaN(parsed) || parsed < 0 ? 0 : parsed;
        draft.setTotalAmount(amount);
        draft.runIntegrityValidation(DraftValidationErrorKey.AMOUNT_INVALID);
    };

    // Handle proportional scaling calculations when total amount varies
    useEffect(() => {
        if (draft.payers.length === 0 && draft.splitParticipants.length === 0) return;

        const updatedPayers = distributeProportionalAmounts(draft.payers, draft.totalAmount);
        const updatedParticipants = distributeProportionalAmounts(draft.splitParticipants, draft.totalAmount);

        if (JSON.stringify(updatedPayers) !== JSON.stringify(draft.payers)) {
            draft.setPayers(updatedPayers);
        }
        if (JSON.stringify(updatedParticipants) !== JSON.stringify(draft.splitParticipants)) {
            draft.setSplitParticipants(updatedParticipants);
        }
    }, [draft.totalAmount]);

    // Self-hydrating user fallback context
    useEffect(() => {
        const currentUser = userStore.getState().user;
        if (currentUser) {
            const fallbackUser = {
                id: String(currentUser.id),
                name: "You",
                avatar: currentUser.avatar ? {
                    id: String(currentUser.avatar.id),
                    name: '',
                    url: currentUser.avatar.url,
                    extension: ''
                } : null,
                amount: draft.totalAmount,
                shares: 1,
                isLocked: false,
                user_type: RelationWithUserType.USER
            };

            if (draft.payers.length === 0) draft.setPayers([fallbackUser]);
            if (draft.splitParticipants.length === 0) draft.setSplitParticipants([fallbackUser]);
        }
    }, [user]);

    return (
        <>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{paddingBottom: 60}}
            >
                <View className="gap-y-6">
                    {/* 1. Name Input */}
                    <AppInput
                        label="Name"
                        value={draft.title}
                        onChangeText={handleTitleChange}
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
                            <Pressable onPress={() => handleAmountChange("0")}>
                                <AppText variant="body-small" className="text-bg-secondary font-medium">Clear</AppText>
                            </Pressable>
                        )}
                    />

                    <CategoryGroupLocationSelector/>

                    {/* 4. Paid By Component Box */}
                    <AppButtonV2
                        variant="secondary"
                        size="none"
                        className="w-full flex-row justify-between items-center px-6 py-4 rounded-full border border-border-input bg-bg-primary-lighter"
                        onPress={() => router.push({
                            pathname: '/(authenticated)/expense/user/split',
                            params: {type: 'paidBy', totalExpense: draft.totalAmount.toString()}
                        })}
                        hasShadow={false}
                    >
                        <View className="flex-1 items-start space-y-0.5">
                            <AppText variant="caption-xs"
                                     className="text-text-primary-lighter font-semibold uppercase tracking-wider">
                                Paid By
                            </AppText>
                            <AppText variant="body-base" className="text-text-primary font-medium">
                                {useMemo(() => getPayerSummaryText(draft.payers, user?.id), [draft.payers, user])}
                            </AppText>
                        </View>
                        <Iconify icon="heroicons:chevron-right" size={20}
                                 color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary}/>
                    </AppButtonV2>

                    {/* 5. Split Section Sub-component */}
                    <SplitSectionCard
                        participants={draft.splitParticipants}
                        currencySymbol={activeCurrencyConfig?.symbol}
                        isDark={isDark}
                        onPress={() => router.push({
                            pathname: '/(authenticated)/expense/user/split',
                            params: {type: 'split', totalExpense: draft.totalAmount.toString()}
                        })}
                    />

                    {/* 6. Items Section Sub-component */}
                    <ItemsSectionCard
                        items={draft.expenseItems}
                        currencySymbol={activeCurrencyConfig?.symbol}
                        isDark={isDark}
                        onPress={() => setIsItemSelectVisible(true)}
                    />

                    <ExpenseAttachments onAttachmentsChange={(uris) => draft.setLocalAttachmentUris(uris)}/>
                </View>
            </ScrollView>

            {/* Bottom Drawers */}
            <Modal visible={isItemSelectVisible} animationType="slide" transparent
                   onRequestClose={() => setIsItemSelectVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <Pressable className="absolute inset-0" onPress={() => setIsItemSelectVisible(false)}/>
                    <View style={{height: '90%', zIndex: 1}}
                          className={`rounded-t-[32px] overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}>
                        <View className="items-center pt-3 pb-1">
                            <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}/>
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
                onSelect={(code) => {
                    draft.setCurrency(code as CurrencyCode);
                    setCurrencySheetOpen(false);
                }}
                onClose={() => setCurrencySheetOpen(false)}
            />
        </>
    );
};

export default AddExpenseScreen;

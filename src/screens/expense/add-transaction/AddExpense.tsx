import {AppInput} from '@/src/components/common/AppInput';
import {AppText} from '@/src/components/common/AppText';
import {ExpenseAttachments} from '@/src/components/expense/ExpenseAttachments';
import {CategoryGroupLocationSelector} from '@/src/screens/expense/CGLSelector';
import {themeStore} from '@/src/store/themeStore';
import {userStore} from '@/src/store/userStore';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {Currency, CurrencyCode} from '@/src/constants/expense/currency';
import {CurrencyBottomSheet} from '@/src/screens/onboarding/components/CurrencyBottomSheet';
import {router, useLocalSearchParams} from 'expo-router';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Modal, Pressable, ScrollView, View} from 'react-native';
import {AddExpenseItemResponse} from '@/src/api/dto/expense/item';
import {Iconify} from 'react-native-iconify';
import {AppButton} from '@/src/components/common/AppButton';
import {COLORS} from '@/src/constants/colors';
import {
    distributeProportionalAmounts,
    hasAmountChangeDependents,
    itemCostSum,
    redistributeSplitPreservingItemFloors,
} from '@/src/utils/expense/expenseCalculations';
import {
    getDefaultExpenseItemDraft,
    isSoleDefaultExpenseItem,
} from '@/src/utils/expense/defaultExpenseItem';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {DraftValidationErrorKey} from '@/src/interfaces/expense/draft_validation';
import {ExpenseSplitGraph} from '@/src/components/expense/connections-graph/ExpenseSplitGraph';
import {ConnectionsListView} from '@/src/components/expense/connections-graph/ConnectionsListView';
import type {ConnectionsEditTarget} from '@/src/components/expense/connections-graph/ConnectionsEditChooserModal';
import {buildGraphFromDraft} from '@/src/utils/expense/buildGraphFromDraft';
import {systemStore} from '@/src/store/systemStore';
import {ScheduleDateChip} from './components/ScheduleDateChip';
import {useAddTransactionActions} from './context/AddTransactionActionsContext';
import {useRegisterOverlayDismiss} from '@/src/hooks/useBackDismissStack';
import {
    formatExpenseScheduleLabel,
    getExpenseScheduleChipMode,
} from '@/src/utils/expense/formatExpenseScheduleLabel';

const parseAmount = (text: string): number => {
    const parsed = parseFloat(text);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

const formatAmountInput = (amount: number): string =>
    amount === 0 ? '' : String(amount);

const AddExpenseScreen = () => {
    const {user} = userStore();
    const {theme} = themeStore();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

    const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
    const [amountModalVisible, setAmountModalVisible] = useState(false);
    const [pendingTotal, setPendingTotal] = useState<number | null>(null);
    const params = useLocalSearchParams<{newlyCreatedItem?: string}>();
    const consumedItemParamRef = useRef<string | null>(null);

    useRegisterOverlayDismiss(currencySheetOpen, () => setCurrencySheetOpen(false));
    useRegisterOverlayDismiss(amountModalVisible, () => setAmountModalVisible(false));

    const draft = useExpenseDraftStore();
    const {openDatePicker} = useAddTransactionActions();
    const activeCurrencyConfig = Currency[draft.currency];
    const currencySymbol = activeCurrencyConfig?.symbol ?? '₹';

    const amountDateLabel = useMemo(
        () =>
            formatExpenseScheduleLabel(
                draft.expenseDate,
                draft.isRecurring,
                draft.recurringDetails,
            ),
        [draft.expenseDate, draft.isRecurring, draft.recurringDetails],
    );
    const amountDateMode = useMemo(
        () => getExpenseScheduleChipMode(draft.isRecurring, draft.recurringDetails),
        [draft.isRecurring, draft.recurringDetails],
    );

    const connectionsGraphData = useMemo(
        () =>
            buildGraphFromDraft({
                title: draft.title,
                totalAmount: draft.totalAmount,
                currencySymbol,
                expenseItems: draft.expenseItems,
                payers: draft.payers,
                splitParticipants: draft.splitParticipants,
            }),
        [
            draft.title,
            draft.totalAmount,
            currencySymbol,
            draft.expenseItems,
            draft.payers,
            draft.splitParticipants,
        ],
    );

    const handleConnectionsEdit = useCallback(
        (target: ConnectionsEditTarget) => {
            if (target === 'paidBy') {
                router.push({
                    pathname: '/(authenticated)/expense/user/split',
                    params: {
                        type: 'paidBy',
                        totalExpense: draft.totalAmount.toString(),
                    },
                });
                return;
            }
            if (target === 'split') {
                router.push({
                    pathname: '/(authenticated)/expense/user/split',
                    params: {
                        type: 'split',
                        totalExpense: draft.totalAmount.toString(),
                    },
                });
                return;
            }
            if (target === 'assignItems' || target === 'items') {
                router.push('/(authenticated)/expense/items/assign');
            }
        },
        [draft.totalAmount],
    );

    // Local buffer — store total only updates on commit (blur / Clear / modal confirm)
    const [amountInput, setAmountInput] = useState(() => formatAmountInput(draft.totalAmount));

    useEffect(() => {
        const raw = params.newlyCreatedItem;
        if (!raw || typeof raw !== 'string' || consumedItemParamRef.current === raw) {
            return;
        }
        try {
            const created = JSON.parse(raw) as AddExpenseItemResponse;
            if (!created?.id) return;
            consumedItemParamRef.current = raw;
            const currentItems = useExpenseDraftStore.getState().expenseItems;
            const alreadySelected = currentItems.some(
                (item) => String(item.id) === String(created.id)
            );
            if (!alreadySelected) {
                const nextItems = [
                    ...currentItems,
                    {
                        id: String(created.id),
                        title: created.title,
                        cost: created.cost,
                        quantity: 1,
                        iconUrl: created.icon?.url ?? null,
                        sharedBetween: [],
                        paidBetween: [],
                    },
                ];
                const nextTotal = itemCostSum(nextItems);
                const draftStore = useExpenseDraftStore.getState();
                draftStore.setExpenseItems(nextItems);
                draftStore.setTotalAmount(nextTotal);
                draftStore.setPayers(
                    distributeProportionalAmounts(draftStore.payers, nextTotal),
                );
                draftStore.setSplitParticipants(
                    redistributeSplitPreservingItemFloors(
                        draftStore.splitParticipants,
                        nextItems,
                        nextTotal,
                    ),
                );
                setAmountInput(formatAmountInput(nextTotal));
            }
        } catch {
            // Ignore malformed return params
        }
    }, [params.newlyCreatedItem]);

    useEffect(() => {
        setAmountInput(formatAmountInput(draft.totalAmount));
    }, [draft.totalAmount]);

    const handleTitleChange = (text: string) => {
        draft.setTitle(text);
        draft.runIntegrityValidation(DraftValidationErrorKey.TITLE_REQUIRED);
    };

    const applyTotal = useCallback(
        (nextTotal: number) => {
            // Replace catalog picks with the default line priced to the new total
            const defaultItem = getDefaultExpenseItemDraft(nextTotal);
            draft.setExpenseItems(defaultItem ? [defaultItem] : []);
            draft.setTotalAmount(nextTotal);
            draft.setPayers(distributeProportionalAmounts(draft.payers, nextTotal));
            draft.setSplitParticipants(
                distributeProportionalAmounts(draft.splitParticipants, nextTotal)
            );
            draft.runIntegrityValidation(DraftValidationErrorKey.AMOUNT_INVALID);
            setAmountInput(formatAmountInput(nextTotal));
            setPendingTotal(null);
            setAmountModalVisible(false);
        },
        [draft]
    );

    const commitAmount = useCallback(
        (raw: string) => {
            const nextTotal = parseAmount(raw);
            const previousTotal = draft.totalAmount;

            if (Math.abs(nextTotal - previousTotal) <= 0.009) {
                setAmountInput(formatAmountInput(previousTotal));
                return;
            }

            const needsPrompt = hasAmountChangeDependents(
                draft.payers,
                draft.splitParticipants,
                draft.expenseItems,
                user?.id,
                previousTotal
            );

            if (!needsPrompt) {
                applyTotal(nextTotal);
                return;
            }

            setPendingTotal(nextTotal);
            setAmountModalVisible(true);
        },
        [draft, user?.id, applyTotal]
    );

    const handleAmountTyping = (text: string) => {
        setAmountInput(text);
    };

    const handleAmountBlur = () => {
        commitAmount(amountInput);
    };

    const handleClearAmount = () => {
        setAmountInput('');
        commitAmount('0');
    };

    const handleRedistribute = () => {
        if (pendingTotal == null) return;
        applyTotal(pendingTotal);
    };

    const handleKeepPreviousAmount = () => {
        setAmountInput(formatAmountInput(draft.totalAmount));
        setPendingTotal(null);
        setAmountModalVisible(false);
    };

    const hadCustomItems =
        draft.expenseItems.length > 0 && !isSoleDefaultExpenseItem(draft.expenseItems);

    const isSystemReady = systemStore((s) => s.isInitialized);
    const defaultExpenseItemId = systemStore((s) => s.defaults.defaultExpenseItem.id);

    // Seed the system default item once defaults load (store may have started empty).
    useEffect(() => {
        if (!isSystemReady || !defaultExpenseItemId) return;
        const {expenseItems, totalAmount, setExpenseItems} = useExpenseDraftStore.getState();
        if (expenseItems.length > 0) return;
        const item = getDefaultExpenseItemDraft(totalAmount);
        if (item) setExpenseItems([item]);
    }, [isSystemReady, defaultExpenseItemId]);

    // Self-hydrating user fallback context
    useEffect(() => {
        const currentUser = userStore.getState().user;
        if (currentUser) {
            const fallbackUser = {
                id: String(currentUser.id),
                name: 'You',
                avatar: currentUser.avatar
                    ? {
                          id: String(currentUser.avatar.id),
                          name: '',
                          url: currentUser.avatar.url,
                          extension: '',
                      }
                    : null,
                amount: draft.totalAmount,
                shares: 1,
                isLocked: false,
                user_type: RelationWithUserType.USER,
            };

            if (draft.payers.length === 0) draft.setPayers([fallbackUser]);
            if (draft.splitParticipants.length === 0) {
                draft.setSplitParticipants([fallbackUser]);
            }
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
                    <AppInput
                        label="Name"
                        value={draft.title}
                        onChangeText={handleTitleChange}
                        placeholder="Enter Name"
                        placeholderTextColor={colors.text.placeholder}
                    />

                    <View className="gap-y-2">
                        <AppText variant="body-base" className="font-semibold text-text-primary">
                            Amount
                        </AppText>
                        <View className="flex-row items-center gap-x-2">
                            <View className="flex-1 min-w-0">
                                <AppInput
                                    value={amountInput}
                                    onChangeText={handleAmountTyping}
                                    onBlur={handleAmountBlur}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.text.placeholder}
                                    renderLeftIcon={() => (
                                        <Pressable
                                            onPress={() => setCurrencySheetOpen(true)}
                                            className="mr-2 flex-row items-center border-r border-border-input pr-2"
                                        >
                                            <AppText className="text-heading-h3 font-bold text-green-increase">
                                                {currencySymbol}
                                            </AppText>
                                            <Iconify
                                                icon="heroicons:chevron-down"
                                                size={14}
                                                color={colors.icon.primary}
                                                className="ml-1"
                                            />
                                        </Pressable>
                                    )}
                                    keyboardType="numeric"
                                    renderRightIcon={() => (
                                        <Pressable onPress={handleClearAmount}>
                                            <AppText
                                                variant="body-small"
                                                className="font-medium text-text-link"
                                            >
                                                Clear
                                            </AppText>
                                        </Pressable>
                                    )}
                                />
                            </View>
                            <ScheduleDateChip
                                label={amountDateLabel}
                                mode={amountDateMode}
                                onPress={openDatePicker}
                            />
                        </View>
                    </View>

                    <CategoryGroupLocationSelector />

                    <ExpenseSplitGraph
                        data={connectionsGraphData}
                        onEditTarget={handleConnectionsEdit}
                        initialViewMode="graph"
                        listContent={
                            <ConnectionsListView
                                data={connectionsGraphData}
                                viewerId={user?.id}
                                showAllSections
                                onEditSection={handleConnectionsEdit}
                            />
                        }
                    />

                    <ExpenseAttachments
                        onAttachmentsChange={(uris) => draft.setLocalAttachmentUris(uris)}
                    />
                </View>
            </ScrollView>

            <CurrencyBottomSheet
                isVisible={currencySheetOpen}
                currentCurrency={draft.currency}
                onSelect={(code) => {
                    draft.setCurrency(code as CurrencyCode);
                    setCurrencySheetOpen(false);
                }}
                onClose={() => setCurrencySheetOpen(false)}
            />

            <Modal visible={amountModalVisible} animationType="fade" transparent>
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View className="w-full rounded-3xl border border-border-input bg-bg-primary p-6">
                        <View className="mb-4 items-center">
                            <View className="mb-2 rounded-full bg-amber-500/10 p-3">
                                <Iconify
                                    icon="heroicons:exclamation-triangle"
                                    size={32}
                                    color={colors.status.warning}
                                />
                            </View>
                            <AppText
                                variant="h3"
                                className="text-center font-bold text-text-primary"
                            >
                                Update expense amount?
                            </AppText>
                        </View>

                        <AppText className="mb-2 text-center text-text-primary-lighter">
                            Change from{' '}
                            <AppText className="font-bold text-text-primary">
                                {currencySymbol}
                                {draft.totalAmount.toFixed(2)}
                            </AppText>
                            {' to '}
                            <AppText className="font-bold text-green-increase">
                                {currencySymbol}
                                {(pendingTotal ?? 0).toFixed(2)}
                            </AppText>
                            . Paid by and Split Between will be redistributed.
                        </AppText>

                        {hadCustomItems && (
                            <AppText
                                variant="caption-xs"
                                className="mb-2 text-center text-text-primary-lighter"
                            >
                                Selected items will be replaced by the default item at the new
                                total.
                            </AppText>
                        )}

                        <AppText
                            variant="caption-xs"
                            className="mb-6 text-center text-text-primary-lighter"
                        >
                            Locked shares stay fixed when possible.
                        </AppText>

                        <AppButton variant="primary" size="md" onPress={handleRedistribute}>
                            Update total & redistribute
                        </AppButton>

                        <Pressable
                            onPress={handleKeepPreviousAmount}
                            className="mt-3 items-center py-3"
                        >
                            <AppText className="font-bold text-text-link">
                                Keep {currencySymbol}
                                {draft.totalAmount.toFixed(2)}
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default AddExpenseScreen;

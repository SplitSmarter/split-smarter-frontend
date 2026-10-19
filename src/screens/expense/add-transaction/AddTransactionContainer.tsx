import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform, Keyboard} from 'react-native';
import {router} from 'expo-router';
import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {ExpenseScheduleModal} from '@/src/components/expense/schedule/ExpenseScheduleModal';
import {GenericValidationErrorModal} from '@/src/components/expense/errors/GenericValidationErrorModal';
import {GroupMismatchModal} from '@/src/components/expense/GroupMismatchModal';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {
    BackDismissStackProvider,
    useBackDismissStack,
    useRegisterOverlayDismiss,
} from '@/src/hooks/useBackDismissStack';

import AddExpenseScreen from './AddExpense';
import AddTransfer from './AddTransfer';

import {useAddTransaction} from './hooks/useAddTransaction';
import {useExpenseContextHints} from '@/src/screens/expense/add-transaction/hooks/useExpenseContextHints';
import {TransactionTabType} from './constants/addTransaction.constants';
import {addTransactionStyles as styles} from './styles/addTransaction.styles';

import {AddTransactionHeader} from './components/AddTransactionHeader';
import {TransactionFooter} from './components/TransactionFooter';
import {ProcessingOverlay} from './components/ProcessingOverlay';
import {TransactionOptionsBottomSheet} from './components/TransactionOptionsBottomSheet';
import {SelectDateBottomSheet} from "@/src/components/common/SelectDateBottomSheet";
import {DraftValidationErrorKey} from '@/src/interfaces/expense/draft_validation';
import {AddTransactionActionsProvider} from './context/AddTransactionActionsContext';
import {useTransferDraftStore} from '@/src/store/draft/transferDraftStore';

const navigateBackFromAddTransaction = () => {
    if (router.canGoBack()) {
        router.back();
        return;
    }
    router.replace('/(authenticated)/(tabs)/' as any);
};

/** Registers container-owned overlays with the back-dismiss stack. */
const AddTransactionOverlayRegistration = ({
    showDatePicker,
    optionsVisible,
    scheduleModalVisible,
    validationModalVisible,
    pickerVisible,
    setShowDatePicker,
    setOptionsVisible,
    setScheduleModalVisible,
    setValidationModalVisible,
    setPickerVisible,
}: {
    showDatePicker: boolean;
    optionsVisible: boolean;
    scheduleModalVisible: boolean;
    validationModalVisible: boolean;
    pickerVisible: boolean;
    setShowDatePicker: (v: boolean) => void;
    setOptionsVisible: (v: boolean) => void;
    setScheduleModalVisible: (v: boolean) => void;
    setValidationModalVisible: (v: boolean) => void;
    setPickerVisible: (v: boolean) => void;
}) => {
    useRegisterOverlayDismiss(showDatePicker, () => setShowDatePicker(false));
    useRegisterOverlayDismiss(optionsVisible, () => setOptionsVisible(false));
    useRegisterOverlayDismiss(scheduleModalVisible, () => setScheduleModalVisible(false));
    useRegisterOverlayDismiss(validationModalVisible, () => setValidationModalVisible(false));
    useRegisterOverlayDismiss(pickerVisible, () => setPickerVisible(false));
    return null;
};

const AddTransactionHeaderWithBack = ({
    activeTab,
    onTabChange,
    onOpenOptions,
}: {
    activeTab: TransactionTabType;
    onTabChange: (tab: TransactionTabType) => void;
    onOpenOptions: () => void;
}) => {
    const stack = useBackDismissStack();
    const onBack = useCallback(() => {
        // requestBack() returns void — never use ?? or both back navigations fire.
        if (stack) {
            stack.requestBack();
            return;
        }
        navigateBackFromAddTransaction();
    }, [stack]);

    return (
        <AddTransactionHeader
            activeTab={activeTab}
            onTabChange={onTabChange}
            onOpenOptions={onOpenOptions}
            onBack={onBack}
        />
    );
};

export const AddTransactionContainer = () => {
    const {
        isDark,
        activeTab,
        expenseDraft,
        pickerVisible,
        optionsVisible,
        showDatePicker,
        isProcessing,
        isSubmitting,
        isLocalValidating,
        isAddingMissingMembers,
        scheduleModalVisible,
        validationModalVisible,
        activeValidationContent,
        setPickerVisible,
        setOptionsVisible,
        setShowDatePicker,
        setScheduleModalVisible,
        setValidationModalVisible,
        handleTabChange,
        handleClearForm,
        handleSaveDraftAlert,
        handleSubmitData,
        handleDateConfirm,
        handleMediaSelection,
        handleSaveCompiledSchedule,
    } = useAddTransaction();

    const transferDate = useTransferDraftStore((s) => s.transferDate);

    const placeId = useMemo(() => {
        if (expenseDraft.expenseLocationMode !== 'place') return null;
        const raw = expenseDraft.expenseLocation?.id;
        if (raw == null) return null;
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [expenseDraft.expenseLocationMode, expenseDraft.expenseLocation?.id]);

    const {
        memories: contextMemories,
        budgets: contextBudgets,
        loading: contextHintsLoading,
    } = useExpenseContextHints({
        enabled: activeTab === 'expense',
        expenseDate: expenseDraft.expenseDate,
        groupId: expenseDraft.groupId,
        categoryId: expenseDraft.categoryId,
        placeId,
        amount: expenseDraft.totalAmount,
        currency: expenseDraft.currency,
    });

    const datePickerActions = useMemo(
        () => ({openDatePicker: () => setShowDatePicker(true)}),
        [setShowDatePicker],
    );

    const datePickerInitial = useMemo(() => {
        const raw =
            activeTab === 'transfer' ? transferDate : expenseDraft.expenseDate;
        return raw?.includes('T') ? raw.split('T')[0] : raw;
    }, [activeTab, transferDate, expenseDraft.expenseDate]);

    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = {backgroundColor: colors.bg.primary};
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const blockBack = isProcessing || isSubmitting;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // Android: only apply behavior while keyboard is open to avoid residual bottom gap after dismiss.
    const keyboardBehavior =
        Platform.OS === 'ios' ? 'padding' : keyboardVisible ? 'padding' : undefined;

    return (
        <BackDismissStackProvider
            onEmptyBack={navigateBackFromAddTransaction}
            blockBack={blockBack}
        >
        <AddTransactionActionsProvider value={datePickerActions}>
        <AddTransactionOverlayRegistration
            showDatePicker={showDatePicker}
            optionsVisible={optionsVisible}
            scheduleModalVisible={scheduleModalVisible}
            validationModalVisible={validationModalVisible}
            pickerVisible={pickerVisible}
            setShowDatePicker={setShowDatePicker}
            setOptionsVisible={setOptionsVisible}
            setScheduleModalVisible={setScheduleModalVisible}
            setValidationModalVisible={setValidationModalVisible}
            setPickerVisible={setPickerVisible}
        />
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <KeyboardAvoidingView
                behavior={keyboardBehavior}
                style={[styles.keyboardView, {backgroundColor: heroStatusBar}]}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
                enabled={Platform.OS === 'ios' || keyboardVisible}
            >
                <View style={[styles.mainContainer, {backgroundColor: heroStatusBar}]}>
                    <ProcessingOverlay visible={isProcessing || isSubmitting} isProcessing={isProcessing}/>

                    <View style={[styles.mainContainer, {backgroundColor: heroStatusBar}]}>
                        <AddTransactionHeaderWithBack
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            onOpenOptions={() => setOptionsVisible(true)}
                        />

                        <View className="flex-1 flex-col" style={{backgroundColor: heroStatusBar}}>
                            <View style={[styles.sheetCardContainer, canvasBg]}>
                                <ScrollView
                                    className="flex-1"
                                    style={canvasBg}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.scrollContent}
                                >
                                    {activeTab === 'expense' ? <AddExpenseScreen/> : <AddTransfer/>}
                                </ScrollView>
                            </View>
                        </View>
                    </View>

                    <TransactionFooter
                        activeTab={activeTab}
                        isDark={isDark}
                        isValidating={expenseDraft.isValidating || isLocalValidating}
                        isAddingMissingMembers={isAddingMissingMembers}
                        submitDisabled={isSubmitting || isAddingMissingMembers}
                        activeValidationContent={activeValidationContent}
                        pendingGroupMemberCount={
                            expenseDraft.shouldAddPendingMembersOnSubmit
                                ? expenseDraft.pendingGroupMemberAdds.length
                                : 0
                        }
                        contextMemories={contextMemories}
                        contextBudgets={contextBudgets}
                        contextHintsLoading={contextHintsLoading}
                        currencyCode={expenseDraft.currency}
                        onOpenPicker={() => setPickerVisible(true)}
                        onOpenValidationModal={() => setValidationModalVisible(true)}
                        onSubmit={handleSubmitData}
                    />

                    <SelectDateBottomSheet
                        visible={showDatePicker}
                        initialDate={datePickerInitial}
                        onClose={() => setShowDatePicker(false)}
                        onConfirm={handleDateConfirm}
                        allowedModes={activeTab === 'transfer' ? 'single' : 'both'}
                        allowFutureDates={false}
                    />

                    <TransactionOptionsBottomSheet
                        visible={optionsVisible}
                        onClose={() => setOptionsVisible(false)}
                        onSaveDraft={handleSaveDraftAlert}
                        onSchedule={() => {
                            setOptionsVisible(false);
                            setScheduleModalVisible(true);
                        }}
                        onClear={handleClearForm}
                    />

                    <GroupMismatchModal
                        visible={
                            validationModalVisible &&
                            activeValidationContent?.key === DraftValidationErrorKey.GROUP_MISMATCH
                        }
                        onClose={() => setValidationModalVisible(false)}
                    />

                    <GenericValidationErrorModal
                        visible={
                            validationModalVisible &&
                            activeValidationContent?.key !== DraftValidationErrorKey.GROUP_MISMATCH
                        }
                        errorKey={activeValidationContent?.key || null}
                        errorData={activeValidationContent?.payload || null}
                        isDark={isDark}
                        onClose={() => setValidationModalVisible(false)}
                    />

                    <ExpenseScheduleModal
                        visible={scheduleModalVisible}
                        onClose={() => setScheduleModalVisible(false)}
                        onSaveSchedule={handleSaveCompiledSchedule}
                        initialDate={expenseDraft.expenseDate}
                    />

                    <MediaPickerBottomSheet
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        onSelect={handleMediaSelection}
                    />
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
        </AddTransactionActionsProvider>
        </BackDismissStackProvider>
    );
};
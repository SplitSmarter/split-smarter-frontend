import React, {useEffect, useState} from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform, Keyboard} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {ExpenseScheduleModal} from '@/src/components/expense/schedule/ExpenseScheduleModal';
import {GenericValidationErrorModal} from '@/src/components/expense/errors/GenericValidationErrorModal';
import {GroupMismatchModal} from '@/src/components/expense/GroupMismatchModal';

import AddExpenseScreen from './AddExpense';
import AddTransfer from './AddTransfer';

import {useAddTransaction} from './hooks/useAddTransaction';
import {ADD_TRANSACTION_THEME} from './constants/addTransaction.constants';
import {addTransactionStyles as styles} from './styles/addTransaction.styles';

import {AddTransactionHeader} from './components/AddTransactionHeader';
import {TransactionFooter} from './components/TransactionFooter';
import {ProcessingOverlay} from './components/ProcessingOverlay';
import {TransactionOptionsBottomSheet} from './components/TransactionOptionsBottomSheet';
import {SelectDateBottomSheet} from "@/src/components/common/SelectDateBottomSheet";
import {DraftValidationErrorKey} from '@/src/interfaces/expense/draft_validation';

export const AddTransactionContainer = () => {
    const {
        isDark,
        activeTab,
        readableDate,
        expenseDraft,
        transferDraft,
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
        isInitiatingPayment,
        setPickerVisible,
        setOptionsVisible,
        setShowDatePicker,
        setScheduleModalVisible,
        setValidationModalVisible,
        handleTabChange,
        handleClearForm,
        handleSaveDraftAlert,
        handleSubmitData,
        handleInitiatePaymentAndNavigate,
        handleDateConfirm,
        handleMediaSelection,
        handleSaveCompiledSchedule,
    } = useAddTransaction();

    const themeConfig = isDark ? ADD_TRANSACTION_THEME.dark : ADD_TRANSACTION_THEME.light;
    const [keyboardVisible, setKeyboardVisible] = useState(false);

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
        <SafeAreaView style={styles.safeArea} className="bg-bg-primary" edges={['top']}>
            <KeyboardAvoidingView
                behavior={keyboardBehavior}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
                enabled={Platform.OS === 'ios' || keyboardVisible}
            >
                <View style={styles.mainContainer} className="bg-bg-primary">
                    <ProcessingOverlay visible={isProcessing || isSubmitting} isProcessing={isProcessing}/>

                    <View style={styles.mainContainer}>
                        <AddTransactionHeader
                            iconColor={themeConfig.iconColor}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            onOpenOptions={() => setOptionsVisible(true)}
                        />

                        <View className="flex-1 flex-col mt-2">
                            <View
                                style={styles.sheetCardContainer}
                                className="bg-bg-canvas border-bg-primary-darker/40"
                            >
                                <ScrollView
                                    className="flex-1"
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
                        readableDate={readableDate}
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
                        transferAmount={transferDraft.amount}
                        transferCurrency={transferDraft.currency}
                        isInitiatingPayment={isInitiatingPayment}
                        onOpenDatePicker={() => setShowDatePicker(true)}
                        onOpenPicker={() => setPickerVisible(true)}
                        onOpenValidationModal={() => setValidationModalVisible(true)}
                        onSubmit={handleSubmitData}
                        onInitiatePayment={handleInitiatePaymentAndNavigate}
                    />

                    <SelectDateBottomSheet
                        visible={showDatePicker}
                        initialDate={expenseDraft.expenseDate.split('T')[0]}
                        onClose={() => setShowDatePicker(false)}
                        onConfirm={handleDateConfirm}
                        allowedModes={activeTab === 'transfer' ? 'single' : 'both'}
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
        </SafeAreaView>
    );
};
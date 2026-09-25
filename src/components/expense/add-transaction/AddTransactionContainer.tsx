import React from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS} from '@/src/constants/colors';

import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {ExpenseScheduleModal} from '@/src/components/expense/schedule/ExpenseScheduleModal';
import {GenericValidationErrorModal} from '@/src/components/expense/errors/GenericValidationErrorModal';
import {InlineDatePicker, TransactionOptionsModal} from '@/src/screens/expense/AddTransactionHelper';

import AddExpenseScreen from '@/src/screens/expense/AddExpense';
import AddTransfer from '@/src/screens/expense/AddTransfer';

import {useAddTransaction} from './hooks/useAddTransaction';
import {ADD_TRANSACTION_THEME} from './constants/addTransaction.constants';
import {addTransactionStyles as styles} from './styles/addTransaction.styles';

import {AddTransactionHeader} from './components/AddTransactionHeader';
import {TransactionTabs} from './components/TransactionTabs';
import {TransactionFooter} from './components/TransactionFooter';
import {ProcessingOverlay} from './components/ProcessingOverlay';

export const AddTransactionContainer = () => {
    const {
        isDark,
        activeTab,
        readableDate,
        expenseDraft,
        pickerVisible,
        optionsVisible,
        showDatePicker,
        isProcessing,
        isSubmitting,
        isLocalValidating,
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
        handleSubmitData,
        handleDateChange,
        handleMediaSelection,
        handleSaveCompiledSchedule,
    } = useAddTransaction();

    const themeConfig = isDark ? ADD_TRANSACTION_THEME.dark : ADD_TRANSACTION_THEME.light;
    const activeColors = isDark ? COLORS.dark : COLORS.light;

    return (
        <SafeAreaView style={styles.safeArea} className="bg-bg-primary" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            >
                <View style={styles.mainContainer} className="bg-bg-primary">
                    <ProcessingOverlay visible={isProcessing || isSubmitting} isProcessing={isProcessing}/>

                    <View style={styles.mainContainer}>
                        <AddTransactionHeader
                            iconColor={themeConfig.iconColor}
                            onOpenPicker={() => setPickerVisible(true)}
                            onOpenOptions={() => setOptionsVisible(true)}
                        />

                        <View className="flex-1 flex-col mt-2">
                            <TransactionTabs activeTab={activeTab} onTabChange={handleTabChange}/>

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

                        <TransactionFooter
                            readableDate={readableDate}
                            isValidating={expenseDraft.isValidating || isLocalValidating}
                            activeValidationContent={activeValidationContent}
                            onOpenDatePicker={() => setShowDatePicker(true)}
                            onOpenValidationModal={() => setValidationModalVisible(true)}
                            onSubmit={handleSubmitData}
                        />
                    </View>

                    {/* Modal Overlay Stack */}
                    <InlineDatePicker
                        visible={showDatePicker}
                        dateValue={new Date(expenseDraft.expenseDate)}
                        isDark={isDark}
                        brandColor={activeColors.brand.primary}
                        onClose={() => setShowDatePicker(false)}
                        onChange={handleDateChange}
                    />

                    <TransactionOptionsModal
                        visible={optionsVisible}
                        isDark={isDark}
                        activeColors={activeColors}
                        onClose={() => setOptionsVisible(false)}
                        onSaveDraft={() => setOptionsVisible(false)}
                        onSchedule={() => {
                            setOptionsVisible(false);
                            setScheduleModalVisible(true);
                        }}
                        onClear={handleClearForm}
                    />

                    <GenericValidationErrorModal
                        visible={validationModalVisible}
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
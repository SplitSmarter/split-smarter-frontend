import {AppButton} from '@/src/components/common/AppButton';
import {AppText} from '@/src/components/common/AppText';
import {MediaPickerBottomSheet} from "@/src/components/common/MediaPickerBottomSheet";
import {useAssetPicker} from "@/src/hooks/useMediaPicker";
import AddExpenseScreen from '@/src/screens/expense/AddExpense';
import AddTransfer from '@/src/screens/expense/AddTransfer';
import {themeStore} from "@/src/store/themeStore";
import {useExpenseDraftStore} from "@/src/store/draft/expenseDraftStore";
import {useTransferDraftStore} from "@/src/store/draft/transferDraftStore";
import {router} from "expo-router";
import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Iconify} from "react-native-iconify";
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {DateComponentPayload} from "@/src/constants/expense/schedule";
import {ExpenseScheduleModal} from "@/src/components/expense/schedule/ExpenseScheduleModal";
import {ExpenseComponentType} from "@/src/api/dto/expense/constant";
import {COLORS} from "@/src/constants/colors";
import {DraftValidationErrorKey} from "@/src/interfaces/expense/draft_validation";
import {executeTransactionSubmit, validateTransactionSubmit} from "@/src/utils/expense/transactionHelpers";
import {InlineDatePicker, TabButton, TransactionOptionsModal} from "@/src/screens/expense/AddTransactionHelper";
import {GenericValidationErrorModal} from "@/src/components/expense/errors/GenericValidationErrorModal";

const AddTransactionScreen = () => {
    console.log("rendered transaction screen");
    const {theme} = themeStore();
    const isDark = theme === 'dark';
    const activeColors = isDark ? COLORS.dark : COLORS.light;

    const [activeTab, setActiveTab] = useState<'expense' | 'transfer'>('expense');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [validationModalVisible, setValidationModalVisible] = useState(false);
    const [isLocalValidating, setIsLocalValidating] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

    const {handleSingleCamera, handleSingleGallery} = useAssetPicker();
    const expenseDraft = useExpenseDraftStore();
    const transferDraft = useTransferDraftStore();

    const activeValidationContent = useMemo(() => {
        if (activeTab !== 'expense') return null;

        const errors = expenseDraft.validationErrors;
        if (errors[DraftValidationErrorKey.TITLE_REQUIRED]) {
            return {
                type: 'ERROR',
                key: DraftValidationErrorKey.TITLE_REQUIRED,
                payload: errors[DraftValidationErrorKey.TITLE_REQUIRED]
            };
        }
        if (errors[DraftValidationErrorKey.AMOUNT_INVALID]) {
            return {
                type: 'ERROR',
                key: DraftValidationErrorKey.AMOUNT_INVALID,
                payload: errors[DraftValidationErrorKey.AMOUNT_INVALID]
            };
        }
        if (errors[DraftValidationErrorKey.GROUP_MISMATCH]) {
            return {
                type: 'WARNING',
                key: DraftValidationErrorKey.GROUP_MISMATCH,
                payload: errors[DraftValidationErrorKey.GROUP_MISMATCH]
            };
        }
        return null;
    }, [expenseDraft.validationErrors, activeTab]);

    const handleTabChange = (tab: 'expense' | 'transfer') => {
        setActiveTab(tab);
        expenseDraft.setExpenseType(tab === 'expense' ? ExpenseComponentType.ITEM : ExpenseComponentType.TRANSFER);
    };

    const handleSaveCompiledSchedule = (payload: DateComponentPayload) => {
        Alert.alert("Schedule Registered", "The recurring rules have been successfully bound to this tracking schema.");
    };

    const handleMediaSelection = async (fromCamera: boolean) => {
        setPickerVisible(false);
        setTimeout(async () => {
            try {
                const action = fromCamera ? handleSingleCamera : handleSingleGallery;
                const result = await action();

                if (result) {
                    setIsProcessing(true);
                    setTimeout(() => {
                        setIsProcessing(false);
                        if (activeTab === 'expense') {
                            expenseDraft.setTitle("Scan Draft Expense");
                            expenseDraft.setTotalAmount(450.00);
                        } else {
                            transferDraft.setAmount(450.00);
                        }
                        Alert.alert("Success", "Document scanned and fields populated successfully!");
                    }, 2500);
                }
            } catch (error) {
                setIsProcessing(false);
                console.error("Scan Error:", error);
            }
        }, 400);
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (event.type === 'set' && selectedDate && activeTab === 'expense') {
            expenseDraft.setExpenseDate(selectedDate.toISOString());
        }
    };

    const handleClearForm = () => {
        setOptionsVisible(false);
        Alert.alert(
            "Clear Split Form",
            "Are you sure you want to discard your modifications and wipe this working cache state?",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => {
                        if (activeTab === 'expense') {
                            expenseDraft.resetDraft();
                            expenseDraft.setExpenseType(ExpenseComponentType.ITEM);
                        } else {
                            transferDraft.resetDraft();
                        }
                    }
                }
            ]
        );
    };

    const handleSubmitData = async () => {
        setIsLocalValidating(true);
        const isValid = await validateTransactionSubmit(activeTab);
        setIsLocalValidating(false);
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const res = await executeTransactionSubmit(activeTab);
            if (res.success) {
                Alert.alert("Success", res.message, [
                    {
                        text: "OK",
                        onPress: () => {
                            if (activeTab === 'expense') expenseDraft.resetDraft();
                            else transferDraft.resetDraft();
                            router.back();
                        }
                    }
                ]);
            }
        } catch (error: any) {
            console.error("Submission Failure Log Context:", error);
            const errorTitle = error.tag ? `${error.tag} Alert` : "Submission Failed";
            Alert.alert(errorTitle.replace(/([A-Z])/g, ' $1').trim(), error.message || "An unresolved network event interrupted transmission streams.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const readableDate = useMemo(() => {
        const d = new Date(expenseDraft.expenseDate);
        return d.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short'});
    }, [expenseDraft.expenseDate]);

    return (
        <SafeAreaView className="flex-1 bg-bg-secondary" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1"
                                  keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <View className="flex-1 bg-bg-secondary">

                    {/* Activity Spinner HUD Overlay */}
                    {(isProcessing || isSubmitting) && (
                        <View className="absolute inset-0 bg-black/70 z-50 items-center justify-center space-y-4">
                            <ActivityIndicator size="large" color={COLORS.light.bg.canvas}/>
                            <AppText className="text-white font-semibold">
                                {isProcessing ? "Parsing receipt records..." : "Uploading transaction data..."}
                            </AppText>
                        </View>
                    )}

                    <View className="flex-1">
                        {/* Navbar */}
                        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
                            <Pressable onPress={() => router.back()} className="p-1">
                                <Iconify icon="heroicons:chevron-left" size={28}
                                         color={isDark ? COLORS.dark.text.contrast : COLORS.light.text.contrast}/>
                            </Pressable>
                            <AppText variant="h3" className="text-text-secondary font-bold">Add Split</AppText>
                            <View className="flex-row items-center gap-x-3">
                                <Pressable onPress={() => setPickerVisible(true)} className="p-1 active:opacity-70">
                                    <Iconify icon="heroicons:camera" size={26}
                                             color={isDark ? COLORS.dark.text.contrast : COLORS.light.text.contrast}/>
                                </Pressable>
                                <Pressable onPress={() => setOptionsVisible(true)} className="p-1 active:opacity-70">
                                    <Iconify icon="heroicons:ellipsis-vertical" size={28}
                                             color={isDark ? COLORS.dark.text.contrast : COLORS.light.text.contrast}/>
                                </Pressable>
                            </View>
                        </View>

                        {/* Interactive Main Sheets */}
                        <View className="flex-1 bg-bg-secondary flex-col mt-2">
                            <View className="px-6 pt-2 pb-5">
                                <View
                                    className="flex-row bg-bg-canvas p-1 rounded-full border border-bg-primary-darker shadow-sm w-full">
                                    <TabButton label="Expense" isActive={activeTab === 'expense'}
                                               onPress={() => handleTabChange('expense')}/>
                                    <TabButton label="Transfer" isActive={activeTab === 'transfer'}
                                               onPress={() => handleTabChange('transfer')}/>
                                </View>
                            </View>

                            <View
                                className="flex-1 bg-bg-canvas rounded-t-[32px] px-6 pt-6 border-t border-bg-primary-darker/40">
                                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                                            keyboardShouldPersistTaps="handled"
                                            contentContainerStyle={{paddingBottom: 180}}>
                                    {activeTab === 'expense' ? <AddExpenseScreen/> : <AddTransfer/>}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Fixed Bottom Layout Toolbar Footer */}
                        <View className="absolute bottom-0 w-full bg-bg-primary pt-4 pb-10 px-6 rounded-t-[40px] shadow-2xl border-t border-bg-secondary-lighter">
                            <View className="flex-row justify-between items-center mb-6">
                                <Pressable onPress={() => setShowDatePicker(true)}
                                           className="flex-row items-center bg-bg-canvas rounded-full px-5 py-2 active:opacity-80">
                                    <Iconify icon="heroicons:calendar" size={18} color={COLORS.color_red_decrease}/>
                                    <AppText variant="body-base" className="ml-2 text-text-primary font-bold">{readableDate}</AppText>
                                </Pressable>

                                {/* 👈 CLEAN GENERIC MODAL TRIPPED ON CLICKS */}
                                {(expenseDraft.isValidating || isLocalValidating) ? (
                                    <View className="flex-row items-center space-x-1">
                                        <ActivityIndicator size="small" color="#9CA3AF" />
                                        <AppText variant="caption-xs" className="text-text-secondary font-medium">Checking group...</AppText>
                                    </View>
                                ) : activeValidationContent ? (
                                    activeValidationContent.type === 'ERROR' ? (
                                        <Pressable
                                            onPress={() => setValidationModalVisible(true)}
                                            className="flex-row items-center space-x-1 bg-red-500/10 dark:bg-red-500/20 px-3 py-1.5 rounded-xl max-w-[55%] active:opacity-70"
                                        >
                                            <Iconify icon="heroicons:exclamation-circle" size={14} color="#EF4444" />
                                            <AppText variant="caption-xs" className="text-red-600 dark:text-red-400 font-semibold mr-1" numberOfLines={1}>
                                                {activeValidationContent.payload?.message}
                                            </AppText>
                                            <Iconify icon="heroicons:information-circle" size={14} color="#EF4444" />
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            onPress={() => setValidationModalVisible(true)}
                                            className="flex-row items-center space-x-1 bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1.5 rounded-xl max-w-[55%] active:opacity-70"
                                        >
                                            <Iconify icon="heroicons:exclamation-triangle" size={14} color="#D97706" />
                                            <AppText variant="caption-xs" className="text-amber-700 dark:text-amber-400 font-bold mr-1 flex-1" numberOfLines={1}>
                                                {activeValidationContent.payload?.message}
                                            </AppText>
                                            <Iconify icon="heroicons:information-circle" size={14} color="#D97706" />
                                        </Pressable>
                                    )
                                ) : (
                                    <View className="flex-row items-center space-x-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                                        <Iconify icon="heroicons:check-circle" size={14} color="#10B981" />
                                        <AppText variant="caption-xs" className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</AppText>
                                    </View>
                                )}
                            </View>

                            <AppButton variant="primary" size="lg" onPress={handleSubmitData}>SUBMIT</AppButton>
                        </View>
                    </View>

                    {/* Extracted Bottom Sheet Components */}
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
                        onSaveDraft={() => {
                            setOptionsVisible(false);
                            Alert.alert("Draft Saved", "This entry layout state has been added to your local drafts archive.");
                        }}
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

                    <ExpenseScheduleModal visible={scheduleModalVisible} onClose={() => setScheduleModalVisible(false)}
                                          onSaveSchedule={handleSaveCompiledSchedule}
                                          initialDate={expenseDraft.expenseDate}/>
                    <MediaPickerBottomSheet visible={pickerVisible} onClose={() => setPickerVisible(false)}
                                            onSelect={handleMediaSelection}/>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddTransactionScreen;
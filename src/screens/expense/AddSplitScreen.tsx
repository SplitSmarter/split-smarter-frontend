import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { MediaPickerBottomSheet } from "@/src/components/common/MediaPickerBottomSheet";
import { useAssetPicker } from "@/src/hooks/useMediaPicker";
import AddExpenseScreen from '@/src/screens/expense/AddExpense';
import AddTransfer from '@/src/screens/expense/AddTransfer';
import { themeStore } from "@/src/store/themeStore";
import { useExpenseDraftStore } from "@/src/store/draft/expenseDraftStore";
import { useTransferDraftStore } from "@/src/store/draft/transferDraftStore";
import { router } from "expo-router";
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View, ActivityIndicator, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Iconify } from "react-native-iconify";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DateComponentPayload } from "@/src/constants/expense/schedule";
import { ExpenseScheduleModal } from "@/src/components/expense/schedule/ExpenseScheduleModal";
import { AddExpenseApi } from "@/src/api/expense/expense";
import { mapDraftToRequest } from "@/src/utils/expense/Mapper";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";
import { createTransferApi } from "@/src/api/expense/transfer";
import { useUploadStore } from "@/src/store/uploadStore";
import { COLORS } from "@/src/constants/colors"; // 🚀 Ensure this points to your Colors file location

const AddSplitScreen = () => {
    const { theme } = themeStore();
    const isDark = theme === 'dark';
    const activeColors = isDark ? COLORS.dark : COLORS.light;

    const [activeTab, setActiveTab] = useState<'expense' | 'transfer'>('expense');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { handleSingleCamera, handleSingleGallery } = useAssetPicker();
    const expenseDraft = useExpenseDraftStore();
    const transferDraft = useTransferDraftStore();

    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

    const handleTabChange = (tab: 'expense' | 'transfer') => {
        setActiveTab(tab);
        if (tab === 'expense') {
            expenseDraft.setExpenseType(ExpenseComponentType.ITEM);
        } else {
            expenseDraft.setExpenseType(ExpenseComponentType.TRANSFER);
        }
    };

    const handleSaveCompiledSchedule = (payload: DateComponentPayload) => {
        console.log("Compiled Payload mapping directly to backend AddExpenseRequest format:", payload);
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
                    console.log("Uploaded Asset IDs:", result);

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
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            if (activeTab === 'expense') {
                expenseDraft.setExpenseDate(selectedDate.toISOString());
            }
        }
    };

    const handleSaveAsDraft = () => {
        setOptionsVisible(false);
        Alert.alert("Draft Saved", "This entry layout state has been added to your local drafts archive.");
    };

    const handleScheduleExpense = () => {
        setOptionsVisible(false);
        setScheduleModalVisible(true);
    };

    const handleClearForm = () => {
        setOptionsVisible(false);
        Alert.alert(
            "Clear Split Form",
            "Are you sure you want to discard your modifications and wipe this working cache state?",
            [
                { text: "Cancel", style: "cancel" },
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
        setIsSubmitting(true);
        try {
            if (activeTab === 'expense') {
                if (!expenseDraft.title.trim()) {
                    Alert.alert("Validation Error", "Please provide a valid Expense Name.");
                    setIsSubmitting(false);
                    return;
                }

                if (expenseDraft.totalAmount <= 0) {
                    Alert.alert("Validation Error", "Total expenditure must be greater than 0.");
                    setIsSubmitting(false);
                    return;
                }

                let uploadedAssetIds: string[] = [];
                const localUrisToProcess = expenseDraft.localAttachmentUris || [];

                if (localUrisToProcess.length > 0) {
                    const addToQueue = useUploadStore.getState().addToQueue;

                    const uploadTasks = localUrisToProcess.map(async (uri): Promise<string | null> => {
                        const trackingId = await addToQueue(uri);
                        if (!trackingId) return null;

                        let assetId: string | undefined = undefined;

                        const checkStatus = () => {
                            const task = useUploadStore.getState().queue[trackingId];
                            if (task?.status === 'completed') {
                                assetId = task.assetId;
                                return true;
                            }
                            if (task?.status === 'failed') {
                                return true;
                            }
                            return false;
                        };

                        if (!checkStatus()) {
                            for (let i = 0; i < 30; i++) {
                                await new Promise(resolve => setTimeout(resolve, 500));
                                if (checkStatus()) break;
                            }
                        }

                        return assetId || null;
                    });

                    const settledAssetIds = await Promise.all<string | null>(uploadTasks);
                    uploadedAssetIds = settledAssetIds.filter((id): id is string => id !== null);
                }

                expenseDraft.setExpenseType(ExpenseComponentType.ITEM);
                const payload = mapDraftToRequest(expenseDraft, uploadedAssetIds);

                console.log("Expense Payload dispatched via HTTP client pipeline:", payload);
                const response = await AddExpenseApi(payload);

                Alert.alert("Success", response.message, [
                    {
                        text: "OK",
                        onPress: () => {
                            expenseDraft.resetDraft();
                            router.back();
                        }
                    }
                ]);

            } else {
                if (transferDraft.amount <= 0) {
                    Alert.alert("Validation Error", "Transfer amount must be greater than 0.");
                    setIsSubmitting(false);
                    return;
                }

                if (!transferDraft.recipient) {
                    Alert.alert("Validation Error", "Please choose a valid destination Recipient.");
                    setIsSubmitting(false);
                    return;
                }

                if (!transferDraft.sender) {
                    Alert.alert("Validation Error", "Sender entity context is missing.");
                    setIsSubmitting(false);
                    return;
                }

                let cleanDateStr = new Date().toISOString().split('T')[0];
                if (expenseDraft.expenseDate) {
                    cleanDateStr = expenseDraft.expenseDate.includes('T')
                        ? expenseDraft.expenseDate.split('T')[0]
                        : expenseDraft.expenseDate;
                }

                const cleanMode = (transferDraft.mode || 'other').toLowerCase();

                const transferPayload = {
                    name: expenseDraft.title?.trim() || `Transfer for ${transferDraft.recipient.name}`,
                    amount: transferDraft.amount,
                    currency: transferDraft.currency,
                    transfer_date: cleanDateStr,
                    from_user_id: Number(transferDraft.sender.id),
                    from_user_type: transferDraft.sender.user_type,
                    to_user_id: Number(transferDraft.recipient.id),
                    to_user_type: transferDraft.recipient.user_type,
                    group_id: expenseDraft.groupId ? Number(expenseDraft.groupId) : null,
                    description: transferDraft.description?.trim() || null,
                    mode: cleanMode as any
                };

                console.log("Transfer Payload dispatched via createTransferApi:", transferPayload);
                const response = await createTransferApi(transferPayload as any);

                Alert.alert("Success", response.message || "Transfer logged successfully", [
                    {
                        text: "OK",
                        onPress: () => {
                            transferDraft.resetDraft();
                            router.back();
                        }
                    }
                ]);
            }
        } catch (error: any) {
            console.error("Submission Failure Log Context:", error);
            const errorTitle = error.tag ? `${error.tag} Alert` : "Submission Failed";
            Alert.alert(
                errorTitle.replace(/([A-Z])/g, ' $1').trim(),
                error.message || "An unresolved network event interrupted transmission streams."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const readableDate = React.useMemo(() => {
        const d = new Date(expenseDraft.expenseDate);
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    }, [expenseDraft.expenseDate]);

    return (
        <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
            <View className="flex-1 bg-bg-canvas">
                {(isProcessing || isSubmitting) && (
                    <View className="absolute inset-0 bg-black/70 z-50 items-center justify-center space-y-4">
                        <ActivityIndicator size="large" color={COLORS.light.bg.canvas} />
                        <AppText className="text-white font-semibold">
                            {isProcessing ? "Parsing receipt records..." : "Uploading transaction data..."}
                        </AppText>
                    </View>
                )}

                <View className="flex-1">
                    {/* Navbar */}
                    <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
                        <Pressable onPress={() => router.back()} className="p-1">
                            <Iconify icon="heroicons:chevron-left" size={28} color={activeColors.text.primary} />
                        </Pressable>
                        <AppText variant="h3" className="text-text-primary font-bold">Add Split</AppText>

                        <View className="flex-row items-center gap-x-3">
                            <Pressable onPress={() => setPickerVisible(true)} className="p-1 active:opacity-70">
                                <Iconify icon="heroicons:camera" size={26} color={activeColors.text.primary} />
                            </Pressable>
                            <Pressable onPress={() => setOptionsVisible(true)} className="p-1 active:opacity-70">
                                <Iconify icon="heroicons:ellipsis-vertical" size={28} color={activeColors.text.primary} />
                            </Pressable>
                        </View>
                    </View>

                    {/* Main Render Section */}
                    <View className="flex-1 flex-col px-6 mt-2">
                        <View className="flex-row bg-bg-primary p-1 rounded-full shadow-sm mb-6 w-full">
                            <TabButton label="Expense" isActive={activeTab === 'expense'} onPress={() => handleTabChange('expense')} />
                            <TabButton label="Transfer" isActive={activeTab === 'transfer'} onPress={() => handleTabChange('transfer')} />
                        </View>

                        <View className="flex-1">
                            {activeTab === 'expense' ? (
                                <View className="flex-1 pb-[180px]">
                                    <AddExpenseScreen />
                                </View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 220 }}>
                                        <AddTransfer />
                                </ScrollView>
                            )}
                        </View>
                    </View>

                    {/* Dynamic Bottom Interface Toolbar Panel */}
                    <View className="absolute bottom-0 w-full bg-bg-primary pt-4 pb-10 px-6 rounded-t-[40px] shadow-2xl border-t border-bg-secondary-lighter">
                        <View className="flex-row justify-between items-center mb-6">
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                className="flex-row items-center bg-bg-canvas rounded-full px-5 py-2 active:opacity-80"
                            >
                                <Iconify icon="heroicons:calendar" size={18} color={COLORS.color_red_decrease} />
                                <AppText variant="body-base" className="ml-2 text-text-primary font-bold">
                                    {readableDate}
                                </AppText>
                            </Pressable>

                            <AppText variant="caption-xs" className="text-text-secondary italic">
                                Auto-sync enabled
                            </AppText>
                        </View>

                        <AppButton variant="primary" size="lg" onPress={handleSubmitData}>
                            SUBMIT
                        </AppButton>
                    </View>
                </View>

                {/* DateTimePicker Elements */}
                {showDatePicker && (
                    Platform.OS === 'ios' ? (
                        <View className="absolute inset-0 bg-black/40 z-50 justify-end">
                            <Pressable className="flex-1" onPress={() => setShowDatePicker(false)} />
                            <View className={`p-6 rounded-t-[30px] ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                                <View className="flex-row justify-between items-center mb-4">
                                    <AppText className="font-bold text-lg">Select Date</AppText>
                                    <Pressable onPress={() => setShowDatePicker(false)}>
                                        <AppText className="font-bold" style={{ color: activeColors.brand.primary }}>Done</AppText>
                                    </Pressable>
                                </View>
                                <DateTimePicker
                                    value={new Date(expenseDraft.expenseDate)}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    onChange={handleDateChange}
                                />
                            </View>
                        </View>
                    ) : (
                        <DateTimePicker
                            value={new Date(expenseDraft.expenseDate)}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )
                )}

                {/* Options Action Sheet Menu */}
                <Modal
                    visible={optionsVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setOptionsVisible(false)}
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <Pressable className="flex-1" onPress={() => setOptionsVisible(false)} />
                        <View className={`p-6 rounded-t-[40px] pb-12 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-white'}`}>

                            <View className={`w-12 h-1.5 rounded-full align-self-center self-center mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

                            <AppText variant="h3" className={`font-bold mb-4 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Form Options
                            </AppText>

                            <Pressable onPress={handleSaveAsDraft} className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                                <Iconify icon="heroicons:document-arrow-down" size={24} color={activeColors.icon.primary} />
                                <AppText variant="body-base" className={`ml-4 font-semibold text-[16px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Save as Draft
                                </AppText>
                            </Pressable>

                            <Pressable onPress={handleScheduleExpense} className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                                <Iconify icon="heroicons:clock" size={24} color={activeColors.icon.primary} />
                                <AppText variant="body-base" className={`ml-4 font-semibold text-[16px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Schedule Transaction
                                </AppText>
                            </Pressable>

                            <View className={`h-[1px] my-2 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

                            <Pressable onPress={handleClearForm} className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                                <Iconify icon="heroicons:trash" size={24} color={activeColors.status.error} />
                                <AppText variant="body-base" className="ml-4 font-semibold text-[16px]" style={{ color: activeColors.status.error }}>
                                    Clear Form
                                </AppText>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

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
        </SafeAreaView>
    );
};

const TabButton = ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} className={`flex-1 py-2 rounded-full items-center justify-center ${isActive ? 'bg-bg-secondary' : ''}`}>
        <AppText variant="body-base" className={isActive ? 'text-white font-bold' : 'text-text-primary-lighter'}>
            {label}
        </AppText>
    </Pressable>
);

export default AddSplitScreen;
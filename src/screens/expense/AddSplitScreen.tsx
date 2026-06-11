import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { MediaPickerBottomSheet } from "@/src/components/common/MediaPickerBottomSheet";
import { useAssetPicker } from "@/src/hooks/useMediaPicker";
import AddExpenseScreen from '@/src/screens/expense/AddExpense';
import AddTransfer from '@/src/screens/expense/AddTransfer';
import { themeStore } from "@/src/store/themeStore";
import { useExpenseDraftStore } from "@/src/store/expenseDraftStore";
import { router } from "expo-router";
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View, ActivityIndicator, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Iconify } from "react-native-iconify";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {DateComponentPayload} from "@/src/constants/expense/schedule";
import {ExpenseScheduleModal} from "@/src/components/expense/schedule/ExpenseScheduleModal";
import {AddExpenseApi} from "@/src/api/expense/expense";
import {mapDraftToRequest} from "@/src/utils/expense/Mapper";
import {ExpenseComponentType} from "@/src/api/dto/expense/constant";

const AddSplitScreen = () => {
    const { theme } = themeStore();
    const isDark = theme === 'dark';
    const [activeTab, setActiveTab] = useState<'expense' | 'transfer'>('expense');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { handleSingleCamera, handleSingleGallery } = useAssetPicker();
    const draft = useExpenseDraftStore();

    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

    const handleTabChange = (tab: 'expense' | 'transfer') => {
        setActiveTab(tab);
        if (tab === 'expense') {
            draft.setExpenseType(ExpenseComponentType.ITEM);
        } else {
            draft.setExpenseType(ExpenseComponentType.TRANSFER);
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
                        draft.setTitle("Scan Draft Expense");
                        draft.setTotalAmount(450.00);
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
            draft.setExpenseDate(selectedDate.toISOString());
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
                        draft.resetDraft();
                        draft.setExpenseType(ExpenseComponentType.ITEM);
                        setActiveTab('expense');
                    }
                }
            ]
        );
    };

    const handleSubmitData = async () => {
        if (activeTab === 'expense') {
            if (!draft.title.trim()) {
                Alert.alert("Validation Error", "Please provide a valid Expense Name.");
                return;
            }
        }

        if (draft.totalAmount <= 0) {
            Alert.alert("Validation Error", "Total expenditure must be greater than 0.");
            return;
        }

        try {
            setIsSubmitting(true);

            const targetType = activeTab === 'expense' ? ExpenseComponentType.ITEM : ExpenseComponentType.TRANSFER;
            console.log("Selected target transmission model context type: ", targetType);

            // 👈 FIX 1: Explicitly force the target type to update inside the draft store
            draft.setExpenseType(targetType);

            // 👈 FIX 2: Create a local copy to map or pass targetType directly into your mapper
            // to shield your payload generator from Zustand's asynchronous batch updating.
            const payload = mapDraftToRequest({
                ...draft,
                expenseType: targetType
            });

            console.log("Payload dispatched via HTTP client pipeline:", payload);
            const response = await AddExpenseApi(payload);

            Alert.alert("Success", response.message, [
                {
                    text: "OK",
                    onPress: () => {
                        draft.resetDraft();
                        router.back();
                    }
                }
            ]);

        } catch (error: any) {
            console.error("Expense Transmission Failure Log Context:", error);
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
        const d = new Date(draft.expenseDate);
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    }, [draft.expenseDate]);

    return (
        <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
            <View className="flex-1 bg-bg-canvas">
                {(isProcessing || isSubmitting) && (
                    <View className="absolute inset-0 bg-black/70 z-50 items-center justify-center space-y-4">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <AppText className="text-white font-semibold">
                            {isProcessing ? "Parsing receipt records..." : "Uploading transaction data..."}
                        </AppText>
                    </View>
                )}

                <View className="flex-1">
                    {/* Navbar */}
                    <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
                        <Pressable onPress={() => router.back()} className="p-1">
                            <Iconify icon="heroicons:chevron-left" size={28} color="white" />
                        </Pressable>
                        <AppText variant="h3" className="text-white font-bold">Add Split</AppText>

                        <View className="flex-row items-center gap-x-3">
                            <Pressable onPress={() => setPickerVisible(true)} className="p-1 active:opacity-70">
                                <Iconify icon="heroicons:camera" size={26} color="white" />
                            </Pressable>
                            <Pressable onPress={() => setOptionsVisible(true)} className="p-1 active:opacity-70">
                                <Iconify icon="heroicons:ellipsis-vertical" size={28} color="white" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Main Render Section */}
                    <View className="flex-1 flex-col px-6 mt-2">
                        <View className="flex-row bg-bg-primary p-1 rounded-full shadow-sm mb-6 w-full">
                            {/* 👈 FIX 3: Swapped generic state hook overrides with explicit orchestration handlers */}
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
                                    <View className="bg-bg-primary rounded-[30px] p-6 shadow-xl border border-bg-primary-darker">
                                        <AddTransfer />
                                    </View>
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
                                <Iconify icon="heroicons:calendar" size={18} className="text-red-decrease" />
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
                                        <AppText className="text-emerald-500 font-bold">Done</AppText>
                                    </Pressable>
                                </View>
                                <DateTimePicker
                                    value={new Date(draft.expenseDate)}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    onChange={handleDateChange}
                                />
                            </View>
                        </View>
                    ) : (
                        <DateTimePicker
                            value={new Date(draft.expenseDate)}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )
                )}

                {/* 3-Option Ellipsis Action Sheet Menu */}
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
                                <Iconify icon="heroicons:document-arrow-down" size={24} color={isDark ? '#E5E7EB' : '#374151'} />
                                <AppText variant="body-base" className={`ml-4 font-semibold text-[16px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Save as Draft
                                </AppText>
                            </Pressable>

                            <Pressable onPress={handleScheduleExpense} className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                                <Iconify icon="heroicons:clock" size={24} color={isDark ? '#E5E7EB' : '#374151'} />
                                <AppText variant="body-base" className={`ml-4 font-semibold text-[16px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Schedule Transaction
                                </AppText>
                            </Pressable>

                            <View className={`h-[1px] my-2 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

                            <Pressable onPress={handleClearForm} className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                                <Iconify icon="heroicons:trash" size={24} color="#EF4444" />
                                <AppText variant="body-base" className="ml-4 font-semibold text-[16px] text-red-500">
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
                    initialDate={draft.expenseDate}
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
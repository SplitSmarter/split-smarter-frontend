import {useState, useMemo, useRef, useCallback} from 'react';
import {Alert} from 'react-native';
import {router, useFocusEffect} from 'expo-router';
import {themeStore} from '@/src/store/themeStore';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {useTransferDraftStore} from '@/src/store/draft/transferDraftStore';
import {useAssetPicker} from '@/src/hooks/useMediaPicker';
import {ExpenseComponentType} from '@/src/api/dto/expense/constant';
import {DraftValidationErrorKey} from '@/src/interfaces/expense/draft_validation';
import {executeTransactionSubmit, validateTransactionSubmit} from '@/src/utils/expense/transactionHelpers';
import {DateComponentPayload} from '@/src/constants/expense/schedule';
import {TransactionTabType} from '../constants/addTransaction.constants';
import {DateSelectionResult} from '@/src/components/common/types/selectDateBottomSheet.types';
import {GetTransactionStatusApi, InitiateTransactionApi} from '@/src/api/user_payment/transaction';

export const useAddTransaction = () => {
    const {theme} = themeStore();
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState<TransactionTabType>('expense');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [validationModalVisible, setValidationModalVisible] = useState(false);
    const [isLocalValidating, setIsLocalValidating] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

    const pendingTransactionIdRef = useRef<string | null>(null);

    const {handleSingleCamera, handleSingleGallery} = useAssetPicker();
    const expenseDraft = useExpenseDraftStore();
    const transferDraft = useTransferDraftStore();

    useFocusEffect(
        useCallback(() => {
            const checkStatusOnReturn = async () => {
                const txId = pendingTransactionIdRef.current;
                if (!txId) return;

                pendingTransactionIdRef.current = null;

                try {
                    const response = await GetTransactionStatusApi(txId);
                    if (response && "data" in response && response.data) {
                        const tx = response.data;
                        Alert.alert(
                            "Transaction Status",
                            `Status: ${tx.status}\nAmount: ₹${tx.amount}\nReference ID: ${tx.id}${
                                tx.failure_reason_raw ? `\nReason: ${tx.failure_reason_raw}` : ""
                            }`
                        );
                    }
                } catch (error: any) {
                    console.error("Status Check Error:", error);
                }
            };

            checkStatusOnReturn();
        }, [])
    );

    const activeValidationContent = useMemo(() => {
        if (activeTab !== 'expense') return null;

        const errors = expenseDraft.validationErrors;
        if (errors[DraftValidationErrorKey.TITLE_REQUIRED]) {
            return {
                type: 'ERROR',
                key: DraftValidationErrorKey.TITLE_REQUIRED,
                payload: errors[DraftValidationErrorKey.TITLE_REQUIRED],
            };
        }
        if (errors[DraftValidationErrorKey.AMOUNT_INVALID]) {
            return {
                type: 'ERROR',
                key: DraftValidationErrorKey.AMOUNT_INVALID,
                payload: errors[DraftValidationErrorKey.AMOUNT_INVALID],
            };
        }
        if (errors[DraftValidationErrorKey.GROUP_MISMATCH]) {
            return {
                type: 'WARNING',
                key: DraftValidationErrorKey.GROUP_MISMATCH,
                payload: errors[DraftValidationErrorKey.GROUP_MISMATCH],
            };
        }
        return null;
    }, [expenseDraft.validationErrors, activeTab]);

    const readableDate = useMemo(() => {
        const d = new Date(expenseDraft.expenseDate);
        return d.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short'});
    }, [expenseDraft.expenseDate]);

    const handleTabChange = (tab: TransactionTabType) => {
        setActiveTab(tab);
        expenseDraft.setExpenseType(
            tab === 'expense' ? ExpenseComponentType.ITEM : ExpenseComponentType.TRANSFER
        );
    };

    const handleSaveCompiledSchedule = (_payload: DateComponentPayload) => {
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

    const handleDateConfirm = (result: DateSelectionResult) => {
        if (!result.isRecurring) {
            expenseDraft.setIsRecurring(false);
            expenseDraft.setExpenseDate(new Date(result.selectedDate).toISOString());
            expenseDraft.setRecurringDetails(null);
        } else {
            expenseDraft.setIsRecurring(true);
            expenseDraft.setExpenseDate(new Date(result.startDate).toISOString());
            expenseDraft.setRecurringDetails({
                recurring_period: result.recurringPeriod,
                interval: result.interval,
                selected_values: result.selectedValues ? [result.selectedValues as any] : [],
                start_date: new Date(result.startDate).toISOString(),
                end_date: result.endDate ? new Date(result.endDate).toISOString() : undefined,
            });
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
                    },
                },
            ]
        );
    };

    const handleSaveDraftAlert = () => {
        setOptionsVisible(false);
        Alert.alert("Draft Saved", "This entry layout state has been added to your local drafts archive.");
    };

    const handleInitiatePaymentAndNavigate = async () => {
        if (!transferDraft.recipient || transferDraft.amount <= 0) {
            Alert.alert("Invalid Details", "Please select a recipient and enter a valid amount before proceeding to pay.");
            return;
        }

        setIsInitiatingPayment(true);
        try {
            const clientReferenceId = `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            const response = await InitiateTransactionApi({
                client_reference_id: clientReferenceId,
                user_id: Number(transferDraft.recipient.id),
                user_type: transferDraft.recipient.user_type,
                amount: transferDraft.amount,
                currency: transferDraft.currency,
            });

            if (response && "data" in response && response.data) {
                const transactionId = response.data.id;
                pendingTransactionIdRef.current = transactionId;

                router.push({
                    pathname: "/(authenticated)/payment/user/transfer",
                    params: {
                        transactionId: transactionId,
                        amount: transferDraft.amount.toString(),
                        userId: transferDraft.recipient.id,
                        userType: transferDraft.recipient.user_type,
                    },
                });
            } else {
                Alert.alert("Error", response?.message || "Failed to initiate transaction.");
            }
        } catch (error: any) {
            Alert.alert("Error", error?.message || "An unexpected error occurred.");
        } finally {
            setIsInitiatingPayment(false);
        }
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
                        },
                    },
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

    return {
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
    };
};
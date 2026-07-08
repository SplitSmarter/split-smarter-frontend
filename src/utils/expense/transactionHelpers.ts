import { Alert } from 'react-native';
import { useUploadStore } from "@/src/store/uploadStore";
import { useExpenseDraftStore } from "@/src/store/draft/expenseDraftStore"; // 👈 Pull stores directly
import { useTransferDraftStore } from "@/src/store/draft/transferDraftStore";
import { mapDraftToRequest } from "@/src/utils/expense/Mapper";
import { AddExpenseApi } from "@/src/api/expense/expense";
import { createTransferApi } from "@/src/api/expense/transfer";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";
import {AddTransferRequest} from "@/src/api/dto/expense/transfer";

export const processLocalAttachments = async (localUris: string[]): Promise<string[]> => {
    if (!localUris || localUris.length === 0) return [];
    const addToQueue = useUploadStore.getState().addToQueue;

    const uploadTasks = localUris.map(async (uri): Promise<string | null> => {
        const trackingId = await addToQueue(uri);
        if (!trackingId) return null;

        const checkStatus = () => {
            const task = useUploadStore.getState().queue[trackingId];
            if (task?.status === 'completed') return { complete: true, id: task.assetId };
            if (task?.status === 'failed') return { complete: true, id: null };
            return { complete: false, id: null };
        };

        let statusCheck = checkStatus();
        if (!statusCheck.complete) {
            for (let i = 0; i < 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                statusCheck = checkStatus();
                if (statusCheck.complete) break;
            }
        }
        return statusCheck.id || null;
    });

    const settledAssetIds = await Promise.all(uploadTasks);
    return settledAssetIds.filter((id): id is string => id !== null);
};

/**
 * Dispatches verified payloads cleanly using central store access
 */
export const executeTransactionSubmit = async (
    activeTab: 'expense' | 'transfer'
): Promise<{ success: boolean; message: string }> => {
    const expenseDraft = useExpenseDraftStore.getState(); // 👈 Grab live snapshot
    const transferDraft = useTransferDraftStore.getState();

    if (activeTab === 'expense') {
        const uploadedAssetIds = await processLocalAttachments(expenseDraft.localAttachmentUris || []);
        expenseDraft.setExpenseType(ExpenseComponentType.ITEM);

        const payload = mapDraftToRequest(expenseDraft, uploadedAssetIds);

        const response = await AddExpenseApi(payload);
        return { success: true, message: response.message };

    } else {
        // 1. Structural Validation Guards to guarantee fields match AddTransferRequest requirements
        if (!transferDraft.sender || !transferDraft.recipient) {
            throw new Error("Cannot execute transfer: Sender or Recipient details are missing.");
        }

        // 2. Parse and normalize the execution timestamp
        let cleanDateStr = new Date().toISOString().split('T')[0];
        if (expenseDraft.expenseDate) {
            cleanDateStr = expenseDraft.expenseDate.includes('T')
                ? expenseDraft.expenseDate.split('T')[0]
                : expenseDraft.expenseDate;
        }

        // 3. Build payload matching AddTransferRequest interface exactly
        const transferPayload: AddTransferRequest = {
            amount: transferDraft.amount,
            currency: transferDraft.currency,
            transfer_date: cleanDateStr,
            from_user_id: Number(transferDraft.sender.id),
            from_user_type: transferDraft.sender.user_type,
            to_user_id: Number(transferDraft.recipient.id),
            to_user_type: transferDraft.recipient.user_type,
            group_id: expenseDraft.groupId ? Number(expenseDraft.groupId) : null,
            description: transferDraft.description?.trim() || null,
            mode: (transferDraft.mode || 'other').toLowerCase() as any // Ensures enum mapping matches TransferMode
        };

        console.log("Transfer Payload dispatched via createTransferApi:", transferPayload);
        const response = await createTransferApi(transferPayload);
        return { success: true, message: response.message || "Transfer logged successfully" };
    }
};

/**
 * Validates tracking schemas uniformly without argument dependency chains
 */
export const validateTransactionSubmit = async (
    activeTab: 'expense' | 'transfer'
): Promise<boolean> => {
    if (activeTab === 'expense') {
        // Run verification directly on store actions
        await useExpenseDraftStore.getState().runIntegrityValidation();

        // Check fresh errors immediately to avoid rendering race conditions
        const freshErrors = useExpenseDraftStore.getState().validationErrors;
        return Object.keys(freshErrors).length === 0;
    } else {
        const transferDraft = useTransferDraftStore.getState();
        if (transferDraft.amount <= 0) {
            Alert.alert("Validation Error", "Transfer amount must be greater than 0.");
            return false;
        }
        if (!transferDraft.recipient) {
            Alert.alert("Validation Error", "Please choose a valid destination Recipient.");
            return false;
        }
        if (!transferDraft.sender) {
            Alert.alert("Validation Error", "Sender entity context is missing.");
            return false;
        }
        return true;
    }
};
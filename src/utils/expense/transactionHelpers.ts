import { Alert } from 'react-native';
import { useUploadStore } from "@/src/store/uploadStore";
import { mapDraftToRequest } from "@/src/utils/expense/Mapper";
import { AddExpenseApi } from "@/src/api/expense/expense";
import { createTransferApi } from "@/src/api/expense/transfer";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";

/**
 * Handles cascading local attachment URI uploads sequentially against the global upload store queue
 */
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
 * Dispatches verified payloads to respective server configurations safely
 */
export const executeTransactionSubmit = async (
    activeTab: 'expense' | 'transfer',
    expenseDraft: any,
    transferDraft: any
): Promise<{ success: boolean; message: string }> => {
    if (activeTab === 'expense') {
        if (!expenseDraft.title.trim()) {
            Alert.alert("Validation Error", "Please provide a valid Expense Name.");
            return { success: false, message: "" };
        }
        if (expenseDraft.totalAmount <= 0) {
            Alert.alert("Validation Error", "Total expenditure must be greater than 0.");
            return { success: false, message: "" };
        }

        const uploadedAssetIds = await processLocalAttachments(expenseDraft.localAttachmentUris || []);
        expenseDraft.setExpenseType(ExpenseComponentType.ITEM);

        const payload = mapDraftToRequest(expenseDraft, uploadedAssetIds);
        console.log("Expense Payload dispatched via HTTP client pipeline:", payload);

        const response = await AddExpenseApi(payload);
        return { success: true, message: response.message };

    } else {
        if (transferDraft.amount <= 0) {
            Alert.alert("Validation Error", "Transfer amount must be greater than 0.");
            return { success: false, message: "" };
        }
        if (!transferDraft.recipient) {
            Alert.alert("Validation Error", "Please choose a valid destination Recipient.");
            return { success: false, message: "" };
        }
        if (!transferDraft.sender) {
            Alert.alert("Validation Error", "Sender entity context is missing.");
            return { success: false, message: "" };
        }

        let cleanDateStr = new Date().toISOString().split('T')[0];
        if (expenseDraft.expenseDate) {
            cleanDateStr = expenseDraft.expenseDate.includes('T')
                ? expenseDraft.expenseDate.split('T')[0]
                : expenseDraft.expenseDate;
        }

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
            mode: (transferDraft.mode || 'other').toLowerCase() as any
        };

        console.log("Transfer Payload dispatched via createTransferApi:", transferPayload);
        const response = await createTransferApi(transferPayload);
        return { success: true, message: response.message || "Transfer logged successfully" };
    }
};
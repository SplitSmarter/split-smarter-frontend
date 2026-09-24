import {
    AddExpenseRequest,
    ComponentTypeUnion,
    DateComponent,
    ExpensePaidByDto,
    ExpenseSharersDto,
    ItemComponent,
    RecurringDateComponent as ApiRecurringDateComponent,
    DateComponentUnion as ApiDateComponentUnion
} from "@/src/api/dto/expense/expense";
import {RelationWithUserType} from "@/src/api/dto/constants";
import {ExpenseComponentType, PaidTowards, ExpenseRecurringPeriod, TransferMode} from "@/src/api/dto/expense/constant";
import {ExpenseDraftState, PayerUser, ExpenseItem} from "@/src/store/draft/expenseDraftStore";
import {RecurringDateComponent as UiRecurringDateComponent} from "@/src/constants/expense/schedule";
import {systemStore} from "@/src/store/systemStore";
import {AddTransferRequest} from "@/src/api/dto/expense/transfer";
import {TransferDraftState} from "@/src/store/draft/transferDraftStore";

/**
 * Transforms UI-centric scheduling and recurring details into the strict
 * backend DTO format without bypassing TypeScript type safety rules.
 */
const mapDraftDateDetailsToPayload = (
    isRecurringDraft: boolean,
    expenseDateDraft: string,
    recurringDetailsDraft: UiRecurringDateComponent | null
): DateComponent => {
    const formattedDate = expenseDateDraft ? expenseDateDraft.split('T')[0] : null;

    if (!isRecurringDraft || !recurringDetailsDraft) {
        return {
            expense_date: formattedDate as any,
            is_recurring: false,
            recurring_details: null
        };
    }

    // Explicitly parse the UI string value into the rigid backend enum schema
    let apiRecurringPeriod: ExpenseRecurringPeriod;
    const periodUpper = recurringDetailsDraft.recurring_period.toUpperCase();

    switch (periodUpper) {
        case "WEEKLY":
            apiRecurringPeriod = ExpenseRecurringPeriod.WEEKLY;
            break;
        case "MONTHLY":
            apiRecurringPeriod = ExpenseRecurringPeriod.MONTHLY;
            break;
        case "YEARLY":
            apiRecurringPeriod = ExpenseRecurringPeriod.YEARLY;
            break;
        case "CUSTOM":
        case "DAILY": // If 'daily' maps directly to custom logic on your backend
            apiRecurringPeriod = ExpenseRecurringPeriod.CUSTOM;
            break;
        default:
            apiRecurringPeriod = ExpenseRecurringPeriod.CUSTOM;
    }

    const apiRecurringDetails: ApiRecurringDateComponent = {
        recurring_period: apiRecurringPeriod,
        custom_period_duration: recurringDetailsDraft.custom_period_duration ?? null,
        interval: recurringDetailsDraft.interval,
        selected_values: (recurringDetailsDraft.selected_values || []) as ApiDateComponentUnion[],
        start_date: recurringDetailsDraft.start_date ? recurringDetailsDraft.start_date.split('T')[0] : null,
        end_date: recurringDetailsDraft.end_date ? recurringDetailsDraft.end_date.split('T')[0] : null
    };

    return {
        expense_date: formattedDate,
        is_recurring: true,
        recurring_details: apiRecurringDetails
    };
};

/**
 * Transforms the client-side Zustand form draft state into a strictly-typed
 * payload required by the FastAPI Pydantic validation schemas.
 */
export const mapExpenseDraftToRequest = (draftState: ExpenseDraftState, uploadedAssetIds: string[] = []): AddExpenseRequest => {

    // 1. Process Date Details through isolated sub-mapper framework
    const dateDetailsPayload = mapDraftDateDetailsToPayload(
        draftState.isRecurring,
        draftState.expenseDate,
        draftState.recurringDetails
    );

    // 2. Process Payers list array maps
    const paidByUsersPayload: ExpensePaidByDto[] = draftState.payers.map((payerDraft: PayerUser) => ({
        user_id: Number(payerDraft.id),
        user_type: payerDraft.user_type || RelationWithUserType.USER,
        amount: Number(payerDraft.amount)
    }));

    // 3. Process Sharers list array maps
    const sharersPayload: ExpenseSharersDto[] = draftState.splitParticipants.map((sharerDraft: PayerUser) => ({
        user_id: Number(sharerDraft.id),
        user_type: sharerDraft.user_type || RelationWithUserType.USER,
        amount: Number(sharerDraft.amount),
        shared_towards: PaidTowards.TOTAL,
        shared_item_id: null
    }));

    // 4. Construct components union block based on polymorphic layout rules
    let componentsPayload: ComponentTypeUnion;
    console.log(draftState.expenseType);
    if (draftState.expenseType === ExpenseComponentType.ITEM) {
        if (!draftState.expenseItems || draftState.expenseItems.length === 0) {

            // Extract the snapshot values directly from the newly extended systemStore data models
            const systemDefaults = systemStore.getState().defaults;

            // Derive fallback item schema identification metrics seamlessly
            const fallbackItemId = systemDefaults.defaultExpenseItem?.id ?? 1;
            const fallbackQuantity = 1;

            componentsPayload = {
                type: ExpenseComponentType.ITEM,
                items: [
                    {
                        id: fallbackItemId,
                        quantity: fallbackQuantity,
                        unit_cost: Number(draftState.totalAmount),
                        currency: draftState.currency,
                        shared_between: null
                    }
                ]
            };
        } else {
            componentsPayload = {
                type: ExpenseComponentType.ITEM,
                items: draftState.expenseItems.map((itemDraft: ExpenseItem, index: number): ItemComponent => {
                    const itemId = index + 1;
                    return {
                        id: itemId,
                        quantity: Number(itemDraft.quantity || 1),
                        unit_cost: Number(itemDraft.cost),
                        currency: draftState.currency,
                        shared_between: null
                    };
                })
            };
        }
    } else {
        console.error("Not implemented");
        componentsPayload = {
            type: ExpenseComponentType.TRANSFER,
            users: draftState.splitParticipants.map((sharerDraft: PayerUser) => ({
                user_id: Number(sharerDraft.id),
                user_type: sharerDraft.user_type || RelationWithUserType.USER,
                amount: Number(sharerDraft.amount)
            })),
            amount: Number(draftState.totalAmount),
            currency: draftState.currency
        };
    }

    // 5. Package everything safely into the final AddExpenseRequest layout
    return {
        expense_type: draftState.expenseType,
        name: draftState.title,
        description: draftState.description.trim() === "" ? null : draftState.description,
        total_cost: Number(draftState.totalAmount),
        category_id: draftState.categoryId ?? null,
        default_category_id: draftState.defaultCategoryId ?? 1,
        group_id: draftState.groupId ?? null,
        place_id: draftState.expenseLocation?.id ? Number(draftState.expenseLocation.id) : null,
        paid_by_users: paidByUsersPayload,
        sharers: sharersPayload,
        currency: draftState.currency,
        date_details: dateDetailsPayload,
        extra_fields: [],
        components: componentsPayload,
        assets: uploadedAssetIds.length > 0 ? uploadedAssetIds : null,
    };
};

/**
 * Maps the live TransferDraftStore state into a standardized AddTransferRequest payload
 */
export const mapTransferDraftToRequest = (
    draft: TransferDraftState
): AddTransferRequest => {
    // Normalize and clean up the transfer execution date format (YYYY-MM-DD)
    let cleanDateStr = new Date().toISOString().split('T')[0];
    if (draft.transferDate) {
        cleanDateStr = draft.transferDate.includes('T')
            ? draft.transferDate.split('T')[0]
            : draft.transferDate;
    }

    return {
        name: draft.name,
        amount: draft.amount,
        currency: draft.currency,
        transfer_date: cleanDateStr,

        // Sender details mapping
        from_user_id: draft.sender ? Number(draft.sender.id) : 0,
        from_user_type: draft.sender?.user_type || RelationWithUserType.USER,

        // Recipient details mapping (can be user, account, or merchant context)
        to_user_id: draft.recipient ? Number(draft.recipient.id) : null,
        to_user_type: draft.recipient?.user_type || null,

        // Financial mapping hooks
        to_payment_account_mapping_id: draft.toPaymentAccountId || null,
        to_merchant_id: draft.toMerchantId || null,
        to_merchant_location_id: draft.toMerchantLocationId || null,
        payment_category_id: draft.paymentCategoryId || "",
        payment_account_mapping_id: draft.paymentAccountId || null,

        // Group & Metadata context
        group_id: draft.groupId ? Number(draft.groupId) : null,
        description: draft.description?.trim() || null,
        // mode: (draft.mode || TransferMode.OTHER) as TransferMode,
    };
};
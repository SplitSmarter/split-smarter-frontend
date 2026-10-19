import {
    AddExpenseRequest,
    DateComponent,
    ExpensePaidByDto,
    ExpenseSharersDto,
    ItemComponent,
} from "@/src/api/dto/expense/expense";
import {RelationWithUserType} from "@/src/api/dto/constants";
import {PaidTowards} from "@/src/api/dto/expense/constant";
import {ExpenseDraftState, PayerUser, ExpenseItem} from "@/src/store/draft/expenseDraftStore";
import {RecurringDateComponent as UiRecurringDateComponent} from "@/src/constants/expense/schedule";
import {systemStore} from "@/src/store/systemStore";
import {AddTransferRequest} from "@/src/api/dto/expense/transfer";
import {TransferDraftState} from "@/src/store/draft/transferDraftStore";
import {sanitizeRecurringDetailsForApi} from "@/src/utils/expense/recurringDateMapper";
import {
    allocationWithinTolerance,
    distributeProportionalAmounts,
} from "@/src/utils/expense/expenseCalculations";

/**
 * Transforms UI-centric scheduling and recurring details into the strict
 * backend DTO format. Backend requires:
 * - one-time: expense_date set, recurring_details null
 * - recurring: expense_date null, recurring_details with lowercase period + union selected_values
 */
const mapDraftDateDetailsToPayload = (
    isRecurringDraft: boolean,
    expenseDateDraft: string,
    recurringDetailsDraft: UiRecurringDateComponent | null
): DateComponent => {
    const formattedDate = expenseDateDraft ? expenseDateDraft.split('T')[0] : null;

    if (!isRecurringDraft || !recurringDetailsDraft) {
        return {
            expense_date: formattedDate,
            is_recurring: false,
            recurring_details: null,
        };
    }

    return {
        expense_date: null,
        is_recurring: true,
        recurring_details: sanitizeRecurringDetailsForApi(recurringDetailsDraft),
    };
};


/**
 * Builds line_items for AddExpenseRequest.
 * When the user selected nothing, falls back to the system default expense item
 * loaded at startup via GetSystemDefaultsApi.
 */
const buildLineItems = (draftState: ExpenseDraftState): ItemComponent[] => {
    if (draftState.expenseItems && draftState.expenseItems.length > 0) {
        return draftState.expenseItems.map((itemDraft: ExpenseItem): ItemComponent => ({
            expense_item_id: Number(itemDraft.id),
            quantity: Math.max(1, Number(itemDraft.quantity || 1)),
            unit_cost: Number(itemDraft.cost),
            currency: draftState.currency,
            shared_between:
                itemDraft.sharedBetween && itemDraft.sharedBetween.length > 0
                    ? itemDraft.sharedBetween.map((s) => ({
                          user_id: Number(s.user_id),
                          user_type: s.user_type || RelationWithUserType.USER,
                          amount: Number(s.amount),
                      }))
                    : null,
            paid_between:
                itemDraft.paidBetween && itemDraft.paidBetween.length > 0
                    ? itemDraft.paidBetween.map((s) => ({
                          user_id: Number(s.user_id),
                          user_type: s.user_type || RelationWithUserType.USER,
                          amount: Number(s.amount),
                      }))
                    : null,
        }));
    }

    const fallbackItemId = systemStore.getState().defaults.defaultExpenseItem?.id;
    if (!fallbackItemId) {
        throw new Error(
            "Default expense item is not loaded yet. Wait for system defaults, or select an item."
        );
    }

    return [
        {
            expense_item_id: fallbackItemId,
            quantity: 1,
            unit_cost: Number(draftState.totalAmount),
            currency: draftState.currency,
            shared_between: null,
            paid_between: null,
        },
    ];
};

/**
 * Transforms the client-side Zustand form draft state into a strictly-typed
 * payload required by the FastAPI Pydantic AddExpenseRequest schema.
 */
export const mapExpenseDraftToRequest = (
    draftState: ExpenseDraftState,
    uploadedAssetIds: string[] = []
): AddExpenseRequest => {
    const dateDetailsPayload = mapDraftDateDetailsToPayload(
        draftState.isRecurring,
        draftState.expenseDate,
        draftState.recurringDetails
    );

    const lineItems = buildLineItems(draftState);
    const itemsSum = lineItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unit_cost),
        0,
    );
    // Backend requires total_cost === Σ(line items) === paid_by === sharers.
    // Prefer catalog line sum when it diverges from a stale draft total.
    const totalCost =
        lineItems.length > 0 &&
        !allocationWithinTolerance(itemsSum, Number(draftState.totalAmount))
            ? itemsSum
            : Number(draftState.totalAmount);

    const payersForPayload = allocationWithinTolerance(
        draftState.payers.reduce((s, p) => s + Number(p.amount || 0), 0),
        totalCost,
    )
        ? draftState.payers
        : distributeProportionalAmounts(draftState.payers, totalCost);

    const sharersForPayload = allocationWithinTolerance(
        draftState.splitParticipants.reduce((s, p) => s + Number(p.amount || 0), 0),
        totalCost,
    )
        ? draftState.splitParticipants
        : distributeProportionalAmounts(draftState.splitParticipants, totalCost);

    const paidByUsersPayload: ExpensePaidByDto[] = payersForPayload.map((payerDraft: PayerUser) => ({
        user_id: Number(payerDraft.id),
        user_type: payerDraft.user_type || RelationWithUserType.USER,
        amount: Number(payerDraft.amount)
    }));

    const sharersPayload: ExpenseSharersDto[] = sharersForPayload.map((sharerDraft: PayerUser) => ({
        user_id: Number(sharerDraft.id),
        user_type: sharerDraft.user_type || RelationWithUserType.USER,
        amount: Number(sharerDraft.amount),
        shared_towards: PaidTowards.TOTAL,
        shared_item_id: null
    }));

    const defaultCategoryId =
        draftState.defaultCategoryId
        ?? systemStore.getState().defaults.defaultExpenseCategory?.id
        ?? 1;

    return {
        name: draftState.title,
        description: draftState.description.trim() === "" ? null : draftState.description,
        total_cost: totalCost,
        category_id: draftState.categoryId ?? null,
        default_category_id: defaultCategoryId,
        group_id: draftState.groupId ?? null,
        place_id: draftState.expenseLocation?.id ? Number(draftState.expenseLocation.id) : null,
        paid_by_users: paidByUsersPayload,
        sharers: sharersPayload,
        currency: draftState.currency,
        date_details: dateDetailsPayload,
        extra_fields: [],
        line_items: lineItems,
        assets: uploadedAssetIds.length > 0 ? uploadedAssetIds : null,
        add_missing_members_to_group: Boolean(
            draftState.shouldAddPendingMembersOnSubmit && draftState.groupId,
        ),
    };
};

/**
 * Maps the live TransferDraftStore state into backend AddTransferRequest.
 * Enforces user XOR merchant on each side (and matching payment-mapping fields).
 */
export const mapTransferDraftToRequest = (
    draft: TransferDraftState,
    uploadedAssetIds: string[] = []
): AddTransferRequest => {
    let cleanDateStr = new Date().toISOString().split('T')[0];
    if (draft.transferDate) {
        cleanDateStr = draft.transferDate.includes('T')
            ? draft.transferDate.split('T')[0]
            : draft.transferDate;
    }

    if (!draft.sender || !draft.recipient) {
        throw new Error('Transfer requires both sender and recipient.');
    }
    if (!draft.paymentCategoryId) {
        throw new Error('Transfer requires a payment category.');
    }

    const fromIsMerchant = draft.sender.kind === 'merchant';
    const toIsMerchant = draft.recipient.kind === 'merchant';
    const fromAccount = draft.paymentAccountId || null;
    const toAccount = draft.toPaymentAccountId || null;

    const autoName =
        draft.name.trim() ||
        `Transfer to ${draft.recipient.name}`.slice(0, 80);

    return {
        name: autoName,
        amount: draft.amount,
        currency: draft.currency,
        transfer_date: cleanDateStr,

        from_user_id: fromIsMerchant ? null : Number(draft.sender.id),
        from_user_type: fromIsMerchant
            ? null
            : draft.sender.user_type || RelationWithUserType.USER,
        from_merchant_id: fromIsMerchant ? Number(draft.sender.id) : null,
        from_merchant_location_id: fromIsMerchant
            ? draft.sender.merchantLocationId ?? null
            : null,
        from_user_payment_account_mapping_id: fromIsMerchant ? null : fromAccount,
        from_merchant_payment_account_mapping_id: fromIsMerchant ? fromAccount : null,

        to_user_id: toIsMerchant ? null : Number(draft.recipient.id),
        to_user_type: toIsMerchant
            ? null
            : draft.recipient.user_type || RelationWithUserType.USER,
        to_merchant_id: toIsMerchant ? Number(draft.recipient.id) : null,
        to_merchant_location_id: toIsMerchant
            ? draft.recipient.merchantLocationId ?? null
            : null,
        to_user_payment_account_mapping_id: toIsMerchant ? null : toAccount,
        to_merchant_payment_account_mapping_id: toIsMerchant ? toAccount : null,

        payment_category_id: draft.paymentCategoryId,
        group_id: draft.groupId ? Number(draft.groupId) : null,
        description: draft.description?.trim() || null,
        assets: uploadedAssetIds.length > 0 ? uploadedAssetIds : null,
    };
};

import {create} from 'zustand';
import {RelationWithUserType} from "@/src/api/dto/constants";
import {ExpenseComponentType} from "@/src/api/dto/expense/constant";
// import {CurrencyType} from "@/src/constants/expense"; // 👈 UPDATED: Swapped for global app types
import {userStore} from "@/src/store/userStore";
import {DateComponentPayload} from "@/src/constants/expense/schedule";
import {ImageInfo} from "@/src/constants/user/asset"; // 👈 ADDED: For initial user context pull
import {CurrencyCode} from "@/src/constants/expense/currency";
import {DraftValidationErrorKey, ValidationErrorMap} from "@/src/interfaces/expense/draft_validation";
import {BasicUserDetails} from "@/src/api/dto/user/user";
import {BaseGroupDetails} from "@/src/api/dto/user/group";
import {GetGroupsApi, GetMyGroupPermissionsApi} from "@/src/api/group/group";
import {BatchAddGroupMembershipsApi} from "@/src/api/group/membership";
import {BatchMembershipResultStatus} from "@/src/api/dto/user/group/batchAddMembership";
import {SelectUser} from "@/src/api/dto/constants";
import {getMissingGroupMembers, UniqueUserIdentity} from "@/src/utils/expense/validation/group_members";
import {
    allocationWithinTolerance,
    itemCostSum,
    sumParticipantAmounts,
} from "@/src/utils/expense/expenseCalculations";
import { getDefaultExpenseItemDraft } from "@/src/utils/expense/defaultExpenseItem";

export type AddMissingMembersResult = {
    ok: boolean;
    reason?: string;
    /** True when every missing user ended as ADDED or ALREADY_MEMBER */
    fullyResolved?: boolean;
    invitedCount?: number;
    skippedCount?: number;
};

export type ExpenseLocationType = 'current' | 'place' | 'none';

/** How Paid By / Split Between amounts are edited — remembered across screen revisits */
export type DraftSplitMode = 'equal' | 'amount' | 'percentage' | 'shares';

export interface User {
    id: string;
    user_type: RelationWithUserType;
    name: string;
    avatar: ImageInfo | null;
}

export interface PayerUser extends User {
    amount: number;
    shares?: number;
    isLocked?: boolean;
}

export interface ExpenseItemSharer {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
}

export interface ExpenseItem {
    id: string;
    title: string;
    cost: number;
    quantity: number;
    iconUrl?: string | null;
    /** Who owes on this line (split). Empty = everyone in split. */
    sharedBetween: ExpenseItemSharer[];
    /** Who funded this line (paid by). Empty = everyone in paid by. */
    paidBetween: ExpenseItemSharer[];
}

export interface ExpenseLocation {
    id: string;
    name?: string;
}

export interface ExpenseDraftState {
    expenseType: ExpenseComponentType;
    title: string;
    description: string;
    totalAmount: number;
    currency: CurrencyCode; // 👈 UPDATED
    categoryId: number | undefined;
    defaultCategoryId: number | undefined;
    groupId: number | undefined;
    payers: PayerUser[];
    splitParticipants: PayerUser[];
    /** Last calculation mode used on Paid By */
    paidBySplitMode: DraftSplitMode;
    /** Last calculation mode used on Split Between */
    splitBetweenSplitMode: DraftSplitMode;
    expenseDate: string;
    expenseLocationMode: ExpenseLocationType;
    expenseLocation: ExpenseLocation | undefined;
    expenseItems: ExpenseItem[];
    isRecurring: boolean;
    recurringDetails: DateComponentPayload['recurring_details'] | null; // 👈 ADDED
    localAttachmentUris: string[];

    validationErrors: ValidationErrorMap;
    isValidating: boolean;

    /** Users to invite into the selected group when the expense is submitted */
    pendingGroupMemberAdds: UniqueUserIdentity[];
    shouldAddPendingMembersOnSubmit: boolean;
    /** One-shot signal for CGLSelector to reopen the group picker */
    requestOpenGroupPicker: boolean;

    /** Group-add permission / batch-membership UX */
    isFetchingGroupAddPermission: boolean;
    isAddingMissingMembers: boolean;
    groupAddPermissionDeniedReason: string | null;
    /** null = unknown / not fetched yet */
    canAddMissingMembers: boolean | null;
    /** Last batch-add partial summary shown in the modal */
    lastGroupAddPartialMessage: string | null;

    // Form Setters
    setExpenseType: (type: ExpenseComponentType) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setTotalAmount: (amount: number) => void;
    setCurrency: (currency: CurrencyCode) => void; // 👈 UPDATED
    setCategoryId: (id: number | undefined) => void;
    setDefaultCategoryId: (id: number) => void;
    setGroupId: (id: number | undefined) => void;
    setPayers: (payers: PayerUser[]) => void;
    setSplitParticipants: (participants: PayerUser[]) => void;
    setPaidBySplitMode: (mode: DraftSplitMode) => void;
    setSplitBetweenSplitMode: (mode: DraftSplitMode) => void;
    setExpenseDate: (date: string) => void;
    setExpenseLocationMode: (mode: ExpenseLocationType) => void;
    setExpenseLocation: (location: ExpenseLocation | undefined) => void;
    setExpenseItems: (items: ExpenseItem[]) => void;
    setIsRecurring: (value: boolean) => void;
    setRecurringDetails: (details: DateComponentPayload['recurring_details'] | null) => void;
    setLocalAttachmentUris: (localAttachmentUris: string[]) => void,
    dismissError: (errorKey: DraftValidationErrorKey) => void;
    clearAllErrors: () => void;
    fetchGroupAddPermission: () => Promise<void>;
    addMissingMembersToGroup: () => Promise<AddMissingMembersResult>;
    clearGroupForReselect: () => void;
    consumeOpenGroupPickerRequest: () => void;
    runIntegrityValidation: (keysToValidate?: DraftValidationErrorKey | DraftValidationErrorKey[]) => Promise<void>;
    resetDraft: () => void;
}

// 👈 HELPER: Function to construct initial self-split user arrays
const getInitialUserContext = (): PayerUser[] => {
    const currentUser = userStore.getState().user;
    if (!currentUser) return [];

    return [{
        id: String(currentUser.id),
        name: "You",
        avatar: currentUser.avatar ? {
            id: String(currentUser.avatar.id),
            name: '',
            url: currentUser.avatar.url,
            extension: ''
        } : null,
        amount: 0.0,
        shares: 1,
        isLocked: false,
        user_type: RelationWithUserType.USER // Adjust with your active enum case reference (e.g., 'user' or 'USER')
    }];
};

export const useExpenseDraftStore = create<ExpenseDraftState>((set, get) => ({
    expenseType: ExpenseComponentType.ITEM,
    title: '',
    description: '',
    totalAmount: 0.0,
    currency: (userStore.getState().user?.currency as CurrencyCode) || 'INR', // Falls back to user's native currency choice
    categoryId: undefined,
    defaultCategoryId: undefined,
    groupId: undefined,
    payers: getInitialUserContext(),
    splitParticipants: getInitialUserContext(),
    paidBySplitMode: 'equal',
    splitBetweenSplitMode: 'equal',
    expenseDate: new Date().toISOString(),
    expenseLocationMode: 'none',
    expenseLocation: undefined,
    expenseItems: (() => {
        const item = getDefaultExpenseItemDraft(0);
        return item ? [item] : [];
    })(),
    isRecurring: false,
    recurringDetails: null,
    localAttachmentUris: [],
    validationErrors: {},
    isValidating: false,
    pendingGroupMemberAdds: [],
    shouldAddPendingMembersOnSubmit: false,
    requestOpenGroupPicker: false,
    isFetchingGroupAddPermission: false,
    isAddingMissingMembers: false,
    groupAddPermissionDeniedReason: null,
    canAddMissingMembers: null,
    lastGroupAddPartialMessage: null,

    setExpenseType: (expenseType) => set({expenseType}),
    setTitle: (title) => set({title}),
    setDescription: (description) => set({description}),
    setTotalAmount: (totalAmount) => set({totalAmount}),
    setCurrency: (currency) => set({currency}),
    setCategoryId: (categoryId) => set({categoryId}),
    setDefaultCategoryId: (defaultCategoryId) => set({defaultCategoryId}),
    setGroupId: (groupId) => set({
        groupId,
        pendingGroupMemberAdds: [],
        shouldAddPendingMembersOnSubmit: false,
        isFetchingGroupAddPermission: false,
        isAddingMissingMembers: false,
        groupAddPermissionDeniedReason: null,
        canAddMissingMembers: null,
        lastGroupAddPartialMessage: null,
    }),
    setPayers: (payers) => set({payers}),
    setSplitParticipants: (splitParticipants) => set({splitParticipants}),
    setPaidBySplitMode: (paidBySplitMode) => set({paidBySplitMode}),
    setSplitBetweenSplitMode: (splitBetweenSplitMode) => set({splitBetweenSplitMode}),
    setExpenseDate: (expenseDate) => set({expenseDate}),
    setExpenseLocationMode: (expenseLocationMode) => set({expenseLocationMode}),
    setExpenseLocation: (location) => set({expenseLocation: location}),
    setExpenseItems: (expenseItems) => set({expenseItems}),
    setIsRecurring: (isRecurring) => set({isRecurring}),
    setRecurringDetails: (recurringDetails) => set({ recurringDetails }),
    setLocalAttachmentUris: (localAttachmentUris) => set({localAttachmentUris}),

    dismissError: (errorKey) => set((state) => {
        const nextErrors = {...state.validationErrors};
        delete nextErrors[errorKey];
        return {validationErrors: nextErrors};
    }),

    clearAllErrors: () => set({validationErrors: {}}),

    fetchGroupAddPermission: async () => {
        const state = get();
        const mismatch = state.validationErrors[DraftValidationErrorKey.GROUP_MISMATCH];
        const groupId = mismatch?.data?.group?.id ?? state.groupId;

        if (!groupId) {
            set({
                canAddMissingMembers: false,
                groupAddPermissionDeniedReason: 'No group selected.',
                isFetchingGroupAddPermission: false,
            });
            return;
        }

        if (state.isFetchingGroupAddPermission) return;

        set({
            isFetchingGroupAddPermission: true,
            groupAddPermissionDeniedReason: null,
            canAddMissingMembers: null,
        });

        try {
            const response = await GetMyGroupPermissionsApi(groupId);
            const canAdd = Boolean(response?.data?.permissions?.can_add_member);
            const accepting = response?.data?.settings?.accepting_new_members !== false;

            if (!canAdd) {
                set({
                    canAddMissingMembers: false,
                    groupAddPermissionDeniedReason:
                        'You do not have permission to add members to this group.',
                });
                return;
            }

            if (!accepting) {
                set({
                    canAddMissingMembers: false,
                    groupAddPermissionDeniedReason: 'Group is not accepting new members',
                });
                return;
            }

            set({
                canAddMissingMembers: true,
                groupAddPermissionDeniedReason: null,
            });
        } catch (error: any) {
            set({
                canAddMissingMembers: false,
                groupAddPermissionDeniedReason:
                    error?.message || 'Unable to verify permission to add members.',
            });
        } finally {
            set({isFetchingGroupAddPermission: false});
        }
    },

    addMissingMembersToGroup: async () => {
        const state = get();

        if (state.isAddingMissingMembers) {
            return {ok: false, reason: 'Already adding members…'};
        }

        const mismatch = state.validationErrors[DraftValidationErrorKey.GROUP_MISMATCH];
        const groupId = mismatch?.data?.group?.id ?? state.groupId;
        const missingUsers = mismatch?.data?.missingUsers ?? [];

        if (!groupId || missingUsers.length === 0) {
            return {ok: false, reason: 'No missing members to add.'};
        }

        set({isAddingMissingMembers: true, lastGroupAddPartialMessage: null});

        try {
            // Refresh permission if unknown or previously denied
            if (state.canAddMissingMembers !== true) {
                await get().fetchGroupAddPermission();
            }

            const afterPerm = get();
            if (afterPerm.canAddMissingMembers !== true) {
                const reason =
                    afterPerm.groupAddPermissionDeniedReason ||
                    'You do not have permission to add members to this group.';
                return {ok: false, reason};
            }

            const users: SelectUser[] = missingUsers.map((user) => ({
                id: user.id,
                type: user.user_type,
            }));

            const response = await BatchAddGroupMembershipsApi({
                group_id: groupId,
                users,
            });

            const results = response.data.results ?? [];
            const resolvedKeys = new Set<string>();
            let invitedCount = 0;
            let skippedCount = 0;
            const residualMessages: string[] = [];

            results.forEach((result) => {
                const key = `${result.user_id}_${result.user_type}`;
                if (
                    result.status === BatchMembershipResultStatus.ADDED ||
                    result.status === BatchMembershipResultStatus.ALREADY_MEMBER
                ) {
                    resolvedKeys.add(key);
                } else if (result.status === BatchMembershipResultStatus.INVITED) {
                    invitedCount += 1;
                    residualMessages.push(
                        result.message || 'Invited — not in the group until they accept.',
                    );
                } else {
                    skippedCount += 1;
                    residualMessages.push(result.message || 'Could not add this user.');
                }
            });

            const remainingUsers = missingUsers.filter(
                (user) => !resolvedKeys.has(`${user.id}_${user.user_type}`),
            );

            if (remainingUsers.length === 0) {
                const nextErrors = {...get().validationErrors};
                delete nextErrors[DraftValidationErrorKey.GROUP_MISMATCH];
                set({
                    validationErrors: nextErrors,
                    pendingGroupMemberAdds: [],
                    shouldAddPendingMembersOnSubmit: false,
                    lastGroupAddPartialMessage: null,
                    groupAddPermissionDeniedReason: null,
                });
                await get().runIntegrityValidation(DraftValidationErrorKey.GROUP_MISMATCH);
                return {ok: true, fullyResolved: true, invitedCount: 0, skippedCount: 0};
            }

            // Partial: keep warning for users still not members (invited/skipped)
            const nextErrors = {...get().validationErrors};
            const groupMeta = mismatch!.data!.group;
            nextErrors[DraftValidationErrorKey.GROUP_MISMATCH] = {
                message:
                    invitedCount > 0
                        ? `${invitedCount} user${invitedCount === 1 ? '' : 's'} invited but not in the group yet. Expense requires membership.`
                        : `${remainingUsers.map((u) => u.name).join(', ')} could not be added to the group.`,
                data: {
                    group: groupMeta,
                    missingUsers: remainingUsers,
                },
            };

            const pendingGroupMemberAdds: UniqueUserIdentity[] = remainingUsers.map((user) => ({
                user_id: user.id,
                user_type: user.user_type,
            }));

            const partialMessage =
                residualMessages[0] ||
                'Some users were invited or skipped and are not group members yet.';

            set({
                validationErrors: nextErrors,
                pendingGroupMemberAdds,
                // Invited users are not members — do not auto-add on submit
                shouldAddPendingMembersOnSubmit: false,
                lastGroupAddPartialMessage: partialMessage,
            });

            return {
                ok: false,
                reason: partialMessage,
                fullyResolved: false,
                invitedCount,
                skippedCount,
            };
        } catch (error: any) {
            const reason =
                error?.message || 'Failed to add users to the group. Please try again.';
            const accessDenied =
                typeof reason === 'string' &&
                (/permission/i.test(reason) ||
                    /not accepting/i.test(reason) ||
                    /limit reached/i.test(reason) ||
                    error?.status === 403);

            set({
                lastGroupAddPartialMessage: reason,
                ...(accessDenied
                    ? {
                          groupAddPermissionDeniedReason: reason,
                          canAddMissingMembers: false,
                      }
                    : {}),
            });
            return {ok: false, reason};
        } finally {
            set({isAddingMissingMembers: false});
        }
    },

    clearGroupForReselect: () => {
        const nextErrors = {...get().validationErrors};
        delete nextErrors[DraftValidationErrorKey.GROUP_MISMATCH];
        set({
            groupId: undefined,
            pendingGroupMemberAdds: [],
            shouldAddPendingMembersOnSubmit: false,
            requestOpenGroupPicker: true,
            validationErrors: nextErrors,
            isFetchingGroupAddPermission: false,
            isAddingMissingMembers: false,
            groupAddPermissionDeniedReason: null,
            canAddMissingMembers: null,
            lastGroupAddPartialMessage: null,
        });
    },

    consumeOpenGroupPickerRequest: () => set({requestOpenGroupPicker: false}),

    runIntegrityValidation: async (keysToValidate) => {
        console.log("running integrity validation");
        const state = get();

        // Normalize input down to a definitive list of target execution keys
        const targetKeys: DraftValidationErrorKey[] = keysToValidate
            ? Array.isArray(keysToValidate) ? keysToValidate : [keysToValidate]
            : Object.values(DraftValidationErrorKey);

        // Retain existing errors for keys that we are NOT evaluating during this execution path
        const nextErrors: ValidationErrorMap = {...state.validationErrors};
        targetKeys.forEach(key => delete nextErrors[key]);

        // --- 1. TITLE VALIDATOR ENGINE ---
        if (targetKeys.includes(DraftValidationErrorKey.TITLE_REQUIRED)) {
            if (!state.title?.trim()) {
                nextErrors[DraftValidationErrorKey.TITLE_REQUIRED] = {
                    message: "Please provide a valid Expense Name before saving."
                };
            }
        }

        // --- 2. AMOUNT VALIDATOR ENGINE ---
        if (targetKeys.includes(DraftValidationErrorKey.AMOUNT_INVALID)) {
            if (state.totalAmount <= 0) {
                nextErrors[DraftValidationErrorKey.AMOUNT_INVALID] = {
                    message: "Total expenditure must be greater than 0."
                };
            }
        }

        // --- 2b. ALLOCATION SUM CHECK (items / Paid By / Split vs total) ---
        if (targetKeys.includes(DraftValidationErrorKey.ALLOCATION_MISMATCH)) {
            const paidSum = sumParticipantAmounts(state.payers);
            const splitSum = sumParticipantAmounts(state.splitParticipants);
            const total = state.totalAmount;
            const itemsSum = itemCostSum(state.expenseItems);
            const paidOk =
                state.payers.length === 0 || allocationWithinTolerance(paidSum, total);
            const splitOk =
                state.splitParticipants.length === 0 ||
                allocationWithinTolerance(splitSum, total);
            const itemsOk =
                state.expenseItems.length === 0 ||
                allocationWithinTolerance(itemsSum, total);

            if (!paidOk || !splitOk || !itemsOk) {
                const mismatchCount =
                    Number(!paidOk) + Number(!splitOk) + Number(!itemsOk);
                const side =
                    mismatchCount > 1
                        ? 'both'
                        : !itemsOk
                          ? 'items'
                          : !paidOk
                            ? 'paidBy'
                            : 'split';
                const parts: string[] = [];
                if (!itemsOk) {
                    parts.push(
                        `Items sum to ${itemsSum.toFixed(2)} but expense total is ${total.toFixed(2)}`
                    );
                }
                if (!paidOk) {
                    parts.push(
                        `Paid By sums to ${paidSum.toFixed(2)} but expense total is ${total.toFixed(2)}`
                    );
                }
                if (!splitOk) {
                    parts.push(
                        `Split Between sums to ${splitSum.toFixed(2)} but expense total is ${total.toFixed(2)}`
                    );
                }
                nextErrors[DraftValidationErrorKey.ALLOCATION_MISMATCH] = {
                    message: `${parts.join('. ')}. Update Amount from items, or adjust Paid By / Split Between.`,
                    side,
                };
            }
        }

        // --- 3. GROUP MISMATCH VALIDATOR ENGINE (ASYNCHRONOUS) ---
        let pendingGroupMemberAdds = state.pendingGroupMemberAdds;
        let shouldAddPendingMembersOnSubmit = state.shouldAddPendingMembersOnSubmit;

        if (targetKeys.includes(DraftValidationErrorKey.GROUP_MISMATCH)) {
            if (state.groupId && (state.payers.length > 0 || state.splitParticipants.length > 0)) {
                set({isValidating: true});
                try {
                    // Combine all involved users into a single deduplicated unique identity list
                    const unifiedUserMap = new Map<string, UniqueUserIdentity>();

                    const collectUser = (u: User) => {
                        const compoundKey = `${u.id}_${u.user_type}`;
                        if (!unifiedUserMap.has(compoundKey)) {
                            unifiedUserMap.set(compoundKey, {
                                user_id: Number(u.id),
                                user_type: u.user_type
                            });
                        }
                    };

                    state.payers.forEach(collectUser);
                    state.splitParticipants.forEach(collectUser);
                    const checkingUsers = Array.from(unifiedUserMap.values());

                    // Execute remote validation check and fetch group context in parallel
                    const [validationResult, groupsResult] = await Promise.all([
                        getMissingGroupMembers(checkingUsers, state.groupId),
                        GetGroupsApi({group_ids: [state.groupId], limit: 1})
                    ]);

                    if (validationResult.success && validationResult.missingMembers.length > 0 && groupsResult?.data?.[0]) {
                        const groupMeta: BaseGroupDetails = groupsResult.data[0];
                        const missingKeys = new Set(
                            validationResult.missingMembers.map(m => `${m.user_id}_${m.user_type}`)
                        );

                        // Extract full user contexts matching missing keys across both local arrays
                        const allCombinedLocalUsers = [...state.payers, ...state.splitParticipants];
                        const deduplicatedMissingUsers = new Map<string, BasicUserDetails>();

                        allCombinedLocalUsers.forEach(p => {
                            const matchKey = `${p.id}_${p.user_type}`;
                            if (missingKeys.has(matchKey) && !deduplicatedMissingUsers.has(matchKey)) {
                                deduplicatedMissingUsers.set(matchKey, {
                                    id: Number(p.id),
                                    name: p.name,
                                    user_type: p.user_type,
                                    avatar: p.avatar ? {id: Number(p.avatar.id), url: p.avatar.url} : (null as any)
                                });
                            }
                        });

                        const missingUsersPayload = Array.from(deduplicatedMissingUsers.values());
                        const pendingAdds: UniqueUserIdentity[] = missingUsersPayload.map((user) => ({
                            user_id: user.id,
                            user_type: user.user_type,
                        }));

                        // User already opted to add missing members on submit — keep flag, refresh list, no warning.
                        if (state.shouldAddPendingMembersOnSubmit) {
                            pendingGroupMemberAdds = pendingAdds;
                        } else {
                            nextErrors[DraftValidationErrorKey.GROUP_MISMATCH] = {
                                message: `${missingUsersPayload.map(u => u.name).join(', ')} ${missingUsersPayload.length === 1 ? 'is' : 'are'} not in this group. Add them to the group or choose a different group.`,
                                data: {
                                    group: groupMeta,
                                    missingUsers: missingUsersPayload
                                }
                            };
                        }
                    } else if (validationResult.success && validationResult.missingMembers.length === 0) {
                        pendingGroupMemberAdds = [];
                        shouldAddPendingMembersOnSubmit = false;
                    }
                } catch (err) {
                    console.error("Unified background group integrity check failed:", err);
                } finally {
                    set({isValidating: false});
                }
            } else if (!state.groupId) {
                pendingGroupMemberAdds = [];
                shouldAddPendingMembersOnSubmit = false;
            }
        }

        set({
            validationErrors: nextErrors,
            pendingGroupMemberAdds,
            shouldAddPendingMembersOnSubmit,
        });
    },

    resetDraft: () => {
        const defaultItem = getDefaultExpenseItemDraft(0);
        set({
            expenseType: ExpenseComponentType.ITEM,
            title: '',
            description: '',
            totalAmount: 0,
            currency: (userStore.getState().user?.currency as CurrencyCode) || 'INR',
            categoryId: undefined,
            defaultCategoryId: undefined,
            groupId: undefined,
            payers: getInitialUserContext(), // 👈 RESET: Safe reversion back to your profile state index
            splitParticipants: getInitialUserContext(),
            paidBySplitMode: 'equal',
            splitBetweenSplitMode: 'equal',
            expenseDate: new Date().toISOString(),
            expenseLocationMode: 'none',
            expenseLocation: undefined,
            expenseItems: defaultItem ? [defaultItem] : [],
            isRecurring: false,
            recurringDetails: null,
            localAttachmentUris: [],
            validationErrors: {},
            isValidating: false,
            pendingGroupMemberAdds: [],
            shouldAddPendingMembersOnSubmit: false,
            requestOpenGroupPicker: false,
            isFetchingGroupAddPermission: false,
            isAddingMissingMembers: false,
            groupAddPermissionDeniedReason: null,
            canAddMissingMembers: null,
            lastGroupAddPartialMessage: null,
        });
    },
}));

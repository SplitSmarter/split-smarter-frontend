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
import {GetGroupsApi} from "@/src/api/group/group";
import {GetGroupMembershipsApi} from "@/src/api/group/membership";
import {getMissingGroupMembers, UniqueUserIdentity} from "@/src/utils/expense/validation/group_members";

export type ExpenseLocationType = 'current' | 'place' | 'none';

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
    sharedBetween: ExpenseItemSharer[];
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
    expenseDate: string;
    expenseLocationMode: ExpenseLocationType;
    expenseLocation: ExpenseLocation | undefined;
    expenseItems: ExpenseItem[];
    isRecurring: boolean;
    recurringDetails: DateComponentPayload['recurring_details'] | null; // 👈 ADDED
    localAttachmentUris: string[];

    validationErrors: ValidationErrorMap;
    isValidating: boolean;

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
    setExpenseDate: (date: string) => void;
    setExpenseLocationMode: (mode: ExpenseLocationType) => void;
    setExpenseLocation: (location: ExpenseLocation | undefined) => void;
    setExpenseItems: (items: ExpenseItem[]) => void;
    setIsRecurring: (value: boolean) => void;
    setLocalAttachmentUris: (localAttachmentUris: string[]) => void,
    dismissError: (errorKey: DraftValidationErrorKey) => void;
    clearAllErrors: () => void;
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
    expenseDate: new Date().toISOString(),
    expenseLocationMode: 'none',
    expenseLocation: undefined,
    expenseItems: [],
    isRecurring: false,
    recurringDetails: null,
    localAttachmentUris: [],
    validationErrors: {},
    isValidating: false,

    setExpenseType: (expenseType) => set({expenseType}),
    setTitle: (title) => set({title}),
    setDescription: (description) => set({description}),
    setTotalAmount: (totalAmount) => set({totalAmount}),
    setCurrency: (currency) => set({currency}),
    setCategoryId: (categoryId) => set({categoryId}),
    setDefaultCategoryId: (defaultCategoryId) => set({defaultCategoryId}),
    setGroupId: (groupId) => set({groupId}),
    setPayers: (payers) => set({payers}),
    setSplitParticipants: (splitParticipants) => set({splitParticipants}),
    setExpenseDate: (expenseDate) => set({expenseDate}),
    setExpenseLocationMode: (expenseLocationMode) => set({expenseLocationMode}),
    setExpenseLocation: (location) => set({expenseLocation: location}),
    setExpenseItems: (expenseItems) => set({expenseItems}),
    setIsRecurring: (isRecurring) => set({isRecurring}),
    setLocalAttachmentUris: (localAttachmentUris) => set({localAttachmentUris}),

    dismissError: (errorKey) => set((state) => {
        const nextErrors = {...state.validationErrors};
        delete nextErrors[errorKey];
        return {validationErrors: nextErrors};
    }),

    clearAllErrors: () => set({validationErrors: {}}),

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

        // --- 3. GROUP MISMATCH VALIDATOR ENGINE (ASYNCHRONOUS) ---
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

                        nextErrors[DraftValidationErrorKey.GROUP_MISMATCH] = {
                            message: `${missingUsersPayload.map(u => u.name).join(', ')} missing from group profile.`,
                            data: {
                                group: groupMeta,
                                missingUsers: missingUsersPayload
                            }
                        };
                    }
                } catch (err) {
                    console.error("Unified background group integrity check failed:", err);
                } finally {
                    set({isValidating: false});
                }
            }
        }

        set({validationErrors: nextErrors});
    },

    resetDraft: () => set({
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
        expenseDate: new Date().toISOString(),
        expenseLocationMode: 'none',
        expenseLocation: undefined,
        expenseItems: [],
        isRecurring: false,
        recurringDetails: null,
        localAttachmentUris: [],
        validationErrors: {},
        isValidating: false,
    }),
}));

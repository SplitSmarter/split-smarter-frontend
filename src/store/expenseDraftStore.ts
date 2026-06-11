import { create } from 'zustand';
import { RelationWithUserType } from "@/src/api/dto/constants";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";
import { CurrencyType } from "@/src/constants/expense"; // 👈 UPDATED: Swapped for global app types
import { userStore } from "@/src/store/userStore";
import {DateComponentPayload} from "@/src/constants/expense/schedule";     // 👈 ADDED: For initial user context pull

export type ExpenseLocationType = 'current' | 'place' | 'none';

export interface BasicImage {
    id: string;
    name: string;
    url: string;
    extension: string;
}

export interface User {
    id: string;
    user_type: RelationWithUserType;
    name: string;
    avatar: BasicImage | null;
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
    currency: CurrencyType; // 👈 UPDATED
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
    // Form Setters
    setExpenseType: (type: ExpenseComponentType) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setTotalAmount: (amount: number) => void;
    setCurrency: (currency: CurrencyType) => void; // 👈 UPDATED
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

export const useExpenseDraftStore = create<ExpenseDraftState>((set) => ({
    expenseType: ExpenseComponentType.TRANSFER,
    title: '',
    description: '',
    totalAmount: 0.0,
    currency: (userStore.getState().user?.currency as CurrencyType) || 'INR', // Falls back to user's native currency choice
    categoryId: undefined,
    defaultCategoryId: undefined,
    groupId: undefined,
    payers: getInitialUserContext(), // 👈 SEEDED: Automatically populates self-as-payer
    splitParticipants: getInitialUserContext(), // 👈 SEEDED: Automatically populates self-as-sharer
    expenseDate: new Date().toISOString(),
    expenseLocationMode: 'none',
    expenseLocation: undefined,
    expenseItems: [],
    isRecurring: false,
    recurringDetails: null,

    setExpenseType: (expenseType) => set({ expenseType }),
    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setTotalAmount: (totalAmount) => set({ totalAmount }),
    setCurrency: (currency) => set({ currency }),
    setCategoryId: (categoryId) => set({ categoryId }),
    setDefaultCategoryId: (defaultCategoryId) => set({ defaultCategoryId }),
    setGroupId: (groupId) => set({ groupId }),
    setPayers: (payers) => set({ payers }),
    setSplitParticipants: (splitParticipants) => set({ splitParticipants }),
    setExpenseDate: (expenseDate) => set({ expenseDate }),
    setExpenseLocationMode: (expenseLocationMode) => set({ expenseLocationMode }),
    setExpenseLocation: (location) => set({ expenseLocation: location }),
    setExpenseItems: (expenseItems) => set({ expenseItems }),
    setIsRecurring: (isRecurring) => set({ isRecurring }),

    resetDraft: () => set({
        expenseType: ExpenseComponentType.TRANSFER,
        title: '',
        description: '',
        totalAmount: 0,
        currency: (userStore.getState().user?.currency as CurrencyType) || 'INR',
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
    }),
}));

import { create } from 'zustand';
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from "@/src/constants/expense/currency"; // 👈 UPDATED: Importing the object and type
import { userStore } from "@/src/store/userStore";
import { ImageInfo } from "@/src/constants/user/asset";
import {TransferMode} from "@/src/api/dto/expense/constant";

export interface TransferParticipant {
    id: string;
    user_type: RelationWithUserType;
    name: string;
    avatar: ImageInfo | null;
}

export interface TransferDraftState {
    amount: number;
    currency: CurrencyCode; // 👈 UPDATED: Using the keyof type
    transferDate: string;
    sender: TransferParticipant | null;
    recipient: TransferParticipant | null;
    groupId: number | undefined;
    description: string;
    mode: TransferMode;

    // Core Form Setters
    setAmount: (amount: number) => void;
    setCurrency: (currency: CurrencyCode) => void; // 👈 UPDATED
    setTransferDate: (date: string) => void;
    setSender: (sender: TransferParticipant | null) => void;
    setRecipient: (recipient: TransferParticipant | null) => void;
    setGroupId: (id: number | undefined) => void;
    setDescription: (description: string) => void;
    setMode: (mode: TransferMode) => void;
    resetDraft: () => void;
}

// 👈 HELPER: Resolves current active authenticated session profile context
const getInitialUserContext = (): TransferParticipant | null => {
    const currentUser = userStore.getState().user;
    if (!currentUser) return null;

    return {
        id: String(currentUser.id),
        name: "You",
        avatar: currentUser.avatar || null,
        user_type: RelationWithUserType.USER
    };
};

export const useTransferDraftStore = create<TransferDraftState>((set) => ({
    amount: 0.0,
    // Safely cast user currency or default to INR
    currency: (userStore.getState().user?.currency as CurrencyCode) || 'INR',
    transferDate: new Date().toISOString(),
    sender: getInitialUserContext(),
    recipient: null,
    groupId: undefined,
    description: '',
    mode: TransferMode.OTHER,

    setAmount: (amount) => set({ amount }),
    setCurrency: (currency) => set({ currency }),
    setTransferDate: (transferDate) => set({ transferDate }),
    setSender: (sender) => set({ sender }),
    setRecipient: (recipient) => set({ recipient }),
    setGroupId: (groupId) => set({ groupId }),
    setDescription: (description) => set({ description }),
    setMode: (mode) => set({ mode }),

    resetDraft: () => set({
        amount: 0.0,
        currency: (userStore.getState().user?.currency as CurrencyCode) || 'INR',
        transferDate: new Date().toISOString(),
        sender: getInitialUserContext(),
        recipient: null,
        groupId: undefined,
        description: '',
        mode: TransferMode.OTHER,
    }),
}));
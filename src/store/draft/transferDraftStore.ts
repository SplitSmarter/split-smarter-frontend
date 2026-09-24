import {create} from 'zustand';
import {RelationWithUserType} from "@/src/api/dto/constants";
import {CurrencyCode} from "@/src/constants/expense/currency";
import {userStore} from "@/src/store/userStore";
import {ImageInfo} from "@/src/constants/user/asset";
import {TransferMode} from "@/src/api/dto/expense/constant";

// ============================================================================
// Transfer Store State & Draft Interfaces
// ============================================================================

export interface TransferParticipant {
    id: string;
    user_type: RelationWithUserType;
    name: string;
    avatar: ImageInfo | null;
}

export interface TransferDraftState {
    name: string;
    amount: number;
    currency: CurrencyCode;
    transferDate: string;
    sender: TransferParticipant | null;
    recipient: TransferParticipant | null;
    groupId: number | undefined;
    description: string;

    // Additional tracking fields
    paymentAccountId: string | null;
    toPaymentAccountId: string | null;
    toMerchantId: number | null;
    toMerchantLocationId: number | null;
    paymentCategoryId: string | null;

    // Core Form Setters
    setName: (name: string) => void;
    setAmount: (amount: number) => void;
    setCurrency: (currency: CurrencyCode) => void;
    setTransferDate: (date: string) => void;
    setSender: (sender: TransferParticipant | null) => void;
    setRecipient: (recipient: TransferParticipant | null) => void;
    setGroupId: (id: number | undefined) => void;
    setDescription: (description: string) => void;

    // Setter updates for missing context parameters
    setPaymentAccountId: (id: string | null) => void;
    setToPaymentAccountId: (id: string | null) => void;
    setToMerchantId: (id: number | null) => void;
    setToMerchantLocationId: (id: number | null) => void;
    setPaymentCategoryId: (id: string | null) => void;

    resetDraft: () => void;
}

// Helper: Resolves current active authenticated session profile context
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
    name: '',
    amount: 0.0,
    currency: (userStore.getState().user?.currency as CurrencyCode) || 'INR',
    transferDate: new Date().toISOString(),
    sender: getInitialUserContext(),
    recipient: null,
    groupId: undefined,
    description: '',
    mode: TransferMode.OTHER,

    paymentAccountId: null,
    toPaymentAccountId: null,
    toMerchantId: null,
    toMerchantLocationId: null,
    paymentCategoryId: null,

    setName: (name) => set({name}),
    setAmount: (amount) => set({amount}),
    setCurrency: (currency) => set({currency}),
    setTransferDate: (transferDate) => set({transferDate}),
    setSender: (sender) => set({sender}),
    setRecipient: (recipient) => set({recipient}),
    setGroupId: (groupId) => set({groupId}),
    setDescription: (description) => set({description}),

    setPaymentAccountId: (paymentAccountId) => set({paymentAccountId}),
    setToPaymentAccountId: (toPaymentAccountId) => set({toPaymentAccountId}),
    setToMerchantId: (toMerchantId) => set({toMerchantId}),
    setToMerchantLocationId: (toMerchantLocationId) => set({toMerchantLocationId}),
    setPaymentCategoryId: (paymentCategoryId) => set({paymentCategoryId}),

    resetDraft: () => set({
        name: '',
        amount: 0.0,
        currency: (userStore.getState().user?.currency as CurrencyCode) || 'INR',
        transferDate: new Date().toISOString(),
        sender: getInitialUserContext(),
        recipient: null,
        groupId: undefined,
        description: '',
        paymentAccountId: null,
        toPaymentAccountId: null,
        toMerchantId: null,
        toMerchantLocationId: null,
        paymentCategoryId: null,
    }),
}));
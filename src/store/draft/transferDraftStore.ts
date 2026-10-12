import {create} from 'zustand';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {CurrencyCode} from '@/src/constants/expense/currency';
import {userStore} from '@/src/store/userStore';
import {ImageInfo} from '@/src/constants/user/asset';

export type TransferParticipantKind = 'user' | 'merchant';

export interface TransferParticipant {
    id: string;
    kind: TransferParticipantKind;
    /** Required when kind === 'user' */
    user_type: RelationWithUserType | null;
    name: string;
    avatar: ImageInfo | null;
    /** Optional when kind === 'merchant' */
    merchantLocationId?: number | null;
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

    /** From-side payment account mapping id (user or merchant, based on sender.kind) */
    paymentAccountId: string | null;
    /** To-side payment account mapping id */
    toPaymentAccountId: string | null;
    paymentCategoryId: string | null;

    setName: (name: string) => void;
    setAmount: (amount: number) => void;
    setCurrency: (currency: CurrencyCode) => void;
    setTransferDate: (date: string) => void;
    setSender: (sender: TransferParticipant | null) => void;
    setRecipient: (recipient: TransferParticipant | null) => void;
    setGroupId: (id: number | undefined) => void;
    setDescription: (description: string) => void;
    setPaymentAccountId: (id: string | null) => void;
    setToPaymentAccountId: (id: string | null) => void;
    setPaymentCategoryId: (id: string | null) => void;

    resetDraft: () => void;
}

const getInitialUserContext = (): TransferParticipant | null => {
    const currentUser = userStore.getState().user;
    if (!currentUser) return null;

    return {
        id: String(currentUser.id),
        kind: 'user',
        name: 'You',
        avatar: currentUser.avatar || null,
        user_type: RelationWithUserType.USER,
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

    paymentAccountId: null,
    toPaymentAccountId: null,
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
    setPaymentCategoryId: (paymentCategoryId) => set({paymentCategoryId}),

    resetDraft: () =>
        set({
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
            paymentCategoryId: null,
        }),
}));

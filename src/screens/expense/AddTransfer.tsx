import React, { useEffect, useState, useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/src/components/common/AppText';
import { AppInput } from '@/src/components/common/AppInput';
import { themeStore } from "@/src/store/themeStore";
import { userStore } from "@/src/store/userStore";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from "@/src/constants/expense/currency";
import { useTransferDraftStore, TransferParticipant } from "@/src/store/draft/transferDraftStore";
import { SelectSinglePeopleBottomSheet } from "@/src/components/user/SelectSinglePeopleBottomSheet";

const QUICK_AMOUNTS = [100, 200, 500, 1000];

const AddTransfer = () => {
    const { t } = useTranslation();
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    const draft = useTransferDraftStore();
    const currentUser = userStore((state) => state.user);

    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [activeSelectionTarget, setActiveSelectionTarget] = useState<'sender' | 'recipient' | null>(null);

    // Synchronize rendering strings clean structure matching layout variables
    const amountString = useMemo(() => {
        return draft.amount === 0 ? "" : draft.amount.toString();
    }, [draft.amount]);

    useEffect(() => {
        if (!draft.sender && currentUser) {
            draft.setSender({
                id: String(currentUser.id),
                name: "You",
                avatar: currentUser.avatar || null,
                user_type: RelationWithUserType.USER
            });
        }
    }, [currentUser, draft.sender]);

    const handleAmountChange = (text: string) => {
        const parsed = parseFloat(text);
        draft.setAmount(isNaN(parsed) || parsed < 0 ? 0 : parsed);
    };

    const handleQuickAmountSelect = (amount: number) => {
        draft.setAmount(amount);
    };

    const toggleCurrency = () => {
        const nextCurrency: CurrencyCode = draft.currency === 'INR' ? 'USD' : 'INR';
        draft.setCurrency(nextCurrency);
    };

    const handleSwapParticipants = () => {
        const currentSender = draft.sender;
        const currentRecipient = draft.recipient;

        if (!currentSender || !currentRecipient) return;

        const currentUserIdStr = currentUser ? String(currentUser.id) : null;

        const isSenderSelf = currentSender.id === currentUserIdStr && currentSender.user_type === RelationWithUserType.USER;
        const isRecipientSelf = currentRecipient.id === currentUserIdStr && currentRecipient.user_type === RelationWithUserType.USER;

        if (!isSenderSelf && !isRecipientSelf && currentUser) {
            const selfContext: TransferParticipant = {
                id: String(currentUser.id),
                name: "You",
                avatar: currentUser.avatar || null,
                user_type: RelationWithUserType.USER
            };
            draft.setSender(selfContext);
            draft.setRecipient(currentSender);
            return;
        }

        draft.setSender(currentRecipient);
        draft.setRecipient(currentSender);
    };

    const openSelectorFor = (target: 'sender' | 'recipient') => {
        const participant = target === 'sender' ? draft.sender : draft.recipient;
        const currentUserIdStr = currentUser ? String(currentUser.id) : null;

        if (participant && participant.id === currentUserIdStr && participant.user_type === RelationWithUserType.USER) {
            return;
        }

        setActiveSelectionTarget(target);
        setBottomSheetOpen(true);
    };

    const getCurrentlySelectedId = (): number | undefined => {
        if (!activeSelectionTarget) return undefined;
        const participant = activeSelectionTarget === 'sender' ? draft.sender : draft.recipient;
        return participant ? Number(participant.id) : undefined;
    };

    const getCurrentlySelectedType = (): RelationWithUserType | undefined => {
        if (!activeSelectionTarget) return undefined;
        return activeSelectionTarget === 'sender' ? draft.sender?.user_type : draft.recipient?.user_type;
    };

    const handleUserSelected = (userId: number, userType: RelationWithUserType, relations: any[], globalUsers: any[]) => {
        if (!activeSelectionTarget) return;

        const matchedRelation = relations.find(r => r.with_user.id === userId && r.with_user.user_type === userType);
        let selectedParticipant: TransferParticipant | null = null;

        if (matchedRelation) {
            selectedParticipant = {
                id: String(matchedRelation.with_user.id),
                name: matchedRelation.with_user.name,
                avatar: matchedRelation.with_user.avatar || null,
                user_type: matchedRelation.with_user.user_type
            };
        } else {
            const matchedGlobal = globalUsers.find(u => u.id === userId);
            if (matchedGlobal) {
                selectedParticipant = {
                    id: String(matchedGlobal.id),
                    name: matchedGlobal.name,
                    avatar: matchedGlobal.avatar || null,
                    user_type: userType
                };
            }
        }

        if (selectedParticipant) {
            if (activeSelectionTarget === 'sender') {
                draft.setSender(selectedParticipant);
            } else {
                draft.setRecipient(selectedParticipant);
            }
        }

        setBottomSheetOpen(false);
        setActiveSelectionTarget(null);
    };

    const isUserSelf = (participant: TransferParticipant | null): boolean => {
        if (!participant || !currentUser) return false;
        return participant.id === String(currentUser.id) && participant.user_type === RelationWithUserType.USER;
    };

    const activeCurrencyConfig = Currency[draft.currency];

    return (
        <>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                <View className="gap-y-6">
                    {/* 1. Interactive Flow Participant Card Matrix */}
                    <View className="flex-row items-center justify-between bg-bg-primary p-5 rounded-2xl border border-bg-secondary-lighter shadow-sm">
                        {/* Source Payer Box */}
                        <Pressable onPress={() => openSelectorFor('sender')} className="flex-1 items-center active:opacity-75">
                            <View className="w-12 h-12 rounded-full bg-emerald-500/10 items-center justify-center mb-2 border border-emerald-500/20">
                                <Iconify icon="heroicons:user-minus" size={22} color="#2D6A4F" />
                            </View>
                            <AppText variant="caption-xs" className="text-text-secondary opacity-60 font-semibold uppercase tracking-wider">{t('transfer.from', 'Sender')}</AppText>
                            <AppText variant="body-base" className="font-bold text-text-primary text-center mt-1" numberOfLines={1}>
                                {draft.sender ? (isUserSelf(draft.sender) ? t('transfer.you', 'You') : draft.sender.name) : t('transfer.select_user', 'Me')}
                            </AppText>
                        </Pressable>

                        {/* Flow Direction Vector */}
                        <View className="px-2 items-center justify-center">
                            <Pressable
                                onPress={handleSwapParticipants}
                                className="bg-bg-primary p-2.5 rounded-full border border-bg-secondary-lighter shadow-sm active:bg-gray-100 dark:active:bg-zinc-800"
                            >
                                <Iconify icon="heroicons:arrows-right-left" size={18} color="#2D6A4F" />
                            </Pressable>
                        </View>

                        {/* Target Recipient Box */}
                        <Pressable onPress={() => openSelectorFor('recipient')} className="flex-1 items-center active:opacity-75">
                            <View className="w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center mb-2 border border-blue-500/20">
                                <Iconify icon="heroicons:user-plus" size={22} color="#3B82F6" />
                            </View>
                            <AppText variant="caption-xs" className="text-text-secondary opacity-60 font-semibold uppercase tracking-wider">{t('transfer.to', 'Recipient')}</AppText>
                            <AppText variant="body-base" className="font-bold text-text-primary text-center mt-1" numberOfLines={1}>
                                {draft.recipient ? (isUserSelf(draft.recipient) ? t('transfer.you', 'You') : draft.recipient.name) : t('transfer.choose_recipient', 'Select Peer')}
                            </AppText>
                        </Pressable>
                    </View>

                    {/* 2. Amount Input Field Box */}
                    <View>
                        <AppInput
                            label={t('transfer.amount_label', 'Amount')}
                            value={amountString}
                            onChangeText={handleAmountChange}
                            placeholder="0.00"
                            placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                            className="flex-1 border-0 h-full p-0"
                            keyboardType="numeric"
                            renderLeftIcon={() => (
                                <Pressable onPress={toggleCurrency} className="flex-row items-center mr-2 pr-2 border-r border-bg-secondary-lighter">
                                    <AppText className="text-green-increase text-heading-h3 font-bold">
                                        {activeCurrencyConfig?.symbol ?? '₹'}
                                    </AppText>
                                    <Iconify icon="heroicons:chevron-down" size={14} color="#2D6A4F" className="ml-1" />
                                </Pressable>
                            )}
                            renderRightIcon={() => (
                                <Pressable onPress={() => draft.setAmount(0)}>
                                    <AppText variant="body-small" className="text-green-increase font-medium">Clear</AppText>
                                </Pressable>
                            )}
                        />
                    </View>

                    {/* 3. Quick-Select Amount Pill Chips Matrix */}
                    <View className="flex-row justify-between pt-1">
                        {QUICK_AMOUNTS.map((amt) => {
                            const isSelected = draft.amount === amt;
                            return (
                                <Pressable
                                    key={amt}
                                    onPress={() => handleQuickAmountSelect(amt)}
                                    className={`flex-1 mx-1 py-3 rounded-xl items-center border transition-all ${
                                        isSelected
                                            ? 'bg-bg-secondary/10 border-bg-secondary/30'
                                            : 'bg-bg-primary border-bg-secondary-lighter shadow-xs'
                                    }`}
                                >
                                    <AppText variant="body-small" className={`font-semibold ${isSelected ? 'text-green-increase' : 'text-text-secondary'}`}>
                                        +{activeCurrencyConfig?.symbol ?? ''}{amt}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* 4. Descriptive Notes Input Box */}
                    <View>
                        <AppInput
                            label={t('transfer.description_label', 'Memo / Notes')}
                            placeholder={t('transfer.description_placeholder', 'What is this settlement payment for?')}
                            placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                            value={draft.description}
                            onChangeText={(text) => draft.setDescription(text)}
                            multiline={true}
                            numberOfLines={3}
                            textAlignVertical="top"
                            maxLength={150}
                            renderLeftIcon={() => (
                                <View className="mt-0.5 mr-1">
                                    <Iconify icon="heroicons:document-text" size={20} color="rgb(var(--color-icon-secondary-lighter))" />
                                </View>
                            )}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Shared Single Picker Sheet Modal Component */}
            <SelectSinglePeopleBottomSheet
                visible={bottomSheetOpen}
                selectedId={getCurrentlySelectedId()}
                selectedType={getCurrentlySelectedType()}
                onClose={() => {
                    setBottomSheetOpen(false);
                    setActiveSelectionTarget(null);
                }}
                onSelect={handleUserSelected}
            />
        </>
    );
};

export default AddTransfer;
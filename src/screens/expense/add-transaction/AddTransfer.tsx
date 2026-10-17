import {RelationWithUserType} from "@/src/api/dto/constants";
import {UserMerchantDetails} from "@/src/api/dto/expense/merchant";
import {AppInput} from '@/src/components/common/AppInput';
import {AppText} from '@/src/components/common/AppText';
import {SelectEntityBottomSheet} from "@/src/components/user/SelectEntityBottomSheet";
import {COLORS} from "@/src/constants/colors";
import {Currency, CurrencyCode} from "@/src/constants/expense/currency";
import {CurrencyBottomSheet} from "@/src/screens/onboarding/components/CurrencyBottomSheet";
import {TransferParticipant, useTransferDraftStore} from "@/src/store/draft/transferDraftStore";
import {themeStore} from "@/src/store/themeStore";
import {userStore} from "@/src/store/userStore";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {PaymentCategorySelector} from "@/src/components/user/transfer/PaymentCategorySelector";
import {ScheduleDateChip} from './components/ScheduleDateChip';
import {useAddTransactionActions} from './context/AddTransactionActionsContext';
import {useRegisterOverlayDismiss} from '@/src/hooks/useBackDismissStack';

const QUICK_AMOUNTS = [100, 200, 500, 1000];

const AddTransfer = () => {
    const {t} = useTranslation();
    const {theme} = themeStore();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

    const draft = useTransferDraftStore();
    const currentUser = userStore((state) => state.user);
    const {openDatePicker} = useAddTransactionActions();

    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
    const [activeSelectionTarget, setActiveSelectionTarget] = useState<'sender' | 'recipient' | null>(null);

    useRegisterOverlayDismiss(bottomSheetOpen, () => setBottomSheetOpen(false));
    useRegisterOverlayDismiss(currencySheetOpen, () => setCurrencySheetOpen(false));

    const amountString = useMemo(() => {
        return draft.amount === 0 ? "" : draft.amount.toString();
    }, [draft.amount]);

    const amountDateLabel = useMemo(() => {
        const d = new Date(draft.transferDate);
        if (Number.isNaN(d.getTime())) return 'Pick date';
        return d.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short'});
    }, [draft.transferDate]);

    useEffect(() => {
        if (!draft.sender && currentUser) {
            draft.setSender({
                id: String(currentUser.id),
                kind: 'user',
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

    const handleCurrencySelect = (code: string) => {
        draft.setCurrency(code as CurrencyCode);
        setCurrencySheetOpen(false);
    };

    const handleSwapParticipants = () => {
        const currentSender = draft.sender;
        const currentRecipient = draft.recipient;

        if (!currentSender || !currentRecipient) return;

        const currentUserIdStr = currentUser ? String(currentUser.id) : null;
        const isSenderSelf =
            currentSender.kind === 'user' &&
            currentSender.id === currentUserIdStr &&
            currentSender.user_type === RelationWithUserType.USER;
        const isRecipientSelf =
            currentRecipient.kind === 'user' &&
            currentRecipient.id === currentUserIdStr &&
            currentRecipient.user_type === RelationWithUserType.USER;

        if (!isSenderSelf && !isRecipientSelf && currentUser) {
            const selfContext: TransferParticipant = {
                id: String(currentUser.id),
                kind: 'user',
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

        if (
            participant &&
            participant.kind === 'user' &&
            participant.id === currentUserIdStr &&
            participant.user_type === RelationWithUserType.USER
        ) {
            return;
        }

        setActiveSelectionTarget(target);
        setBottomSheetOpen(true);
    };

    const getCurrentlySelectedId = (): number | undefined => {
        if (!activeSelectionTarget) return undefined;
        const participant = activeSelectionTarget === 'sender' ? draft.sender : draft.recipient;
        if (!participant || participant.kind !== 'user') return undefined;
        return Number(participant.id);
    };

    const getCurrentlySelectedMerchantId = (): number | undefined => {
        if (!activeSelectionTarget) return undefined;
        const participant = activeSelectionTarget === 'sender' ? draft.sender : draft.recipient;
        if (!participant || participant.kind !== 'merchant') return undefined;
        return Number(participant.id);
    };

    const getCurrentlySelectedType = useCallback(() => {
        if (!activeSelectionTarget) return undefined;
        const participant = activeSelectionTarget === 'sender' ? draft.sender : draft.recipient;
        if (!participant || participant.kind !== 'user') return undefined;
        return participant.user_type ?? undefined;
    }, [activeSelectionTarget, draft]);

    const handleUserSelected = useCallback((userId: number, userType: RelationWithUserType, relations: any[], globalUsers: any[]) => {
        if (!activeSelectionTarget) return;

        const matchedRelation = relations.find(r => r.with_user.id === userId && r.with_user.user_type === userType);
        let selectedParticipant: TransferParticipant | null = null;

        if (matchedRelation) {
            selectedParticipant = {
                id: String(matchedRelation.with_user.id),
                kind: 'user',
                name: matchedRelation.with_user.name,
                avatar: matchedRelation.with_user.avatar || null,
                user_type: matchedRelation.with_user.user_type
            };
        } else {
            const matchedGlobal = globalUsers.find(u => u.id === userId);
            if (matchedGlobal) {
                selectedParticipant = {
                    id: String(matchedGlobal.id),
                    kind: 'user',
                    name: matchedGlobal.name,
                    avatar: matchedGlobal.avatar || null,
                    user_type: userType
                };
            }
        }

        if (selectedParticipant) {
            const target = activeSelectionTarget;
            const oppositeTarget = target === 'sender' ? 'recipient' : 'sender';
            const currentOpposite = target === 'sender' ? draft.recipient : draft.sender;

            // If the selected user is already in the opposite slot, clear the opposite slot
            if (
                currentOpposite &&
                currentOpposite.kind === 'user' &&
                currentOpposite.id === selectedParticipant.id &&
                currentOpposite.user_type === selectedParticipant.user_type
            ) {
                if (target === 'sender') {
                    draft.setRecipient(null);
                } else {
                    draft.setSender(null);
                }
            }

            if (target === 'sender') {
                draft.setSender(selectedParticipant);
            } else {
                draft.setRecipient(selectedParticipant);
            }
        }

        setBottomSheetOpen(false);
        setActiveSelectionTarget(null);
    }, [activeSelectionTarget, draft]);

    const handleMerchantSelected = useCallback((merchantId: number, merchant: UserMerchantDetails) => {
        if (!activeSelectionTarget) return;

        const selectedParticipant: TransferParticipant = {
            id: String(merchant.id),
            kind: 'merchant',
            name: merchant.name,
            avatar: merchant.logo || null,
            user_type: null,
            merchantLocationId: null,
        };

        const target = activeSelectionTarget;
        const currentOpposite = target === 'sender' ? draft.recipient : draft.sender;

        // Clear opposite slot if the merchant matches the opposite participant
        if (
            currentOpposite &&
            currentOpposite.kind === 'merchant' &&
            currentOpposite.id === selectedParticipant.id
        ) {
            if (target === 'sender') {
                draft.setRecipient(null);
            } else {
                draft.setSender(null);
            }
        }

        if (target === 'sender') {
            draft.setSender(selectedParticipant);
        } else {
            draft.setRecipient(selectedParticipant);
        }

        setBottomSheetOpen(false);
        setActiveSelectionTarget(null);
    }, [activeSelectionTarget, draft]);
    const isUserSelf = (participant: TransferParticipant | null): boolean => {
        if (!participant || !currentUser) return false;
        return (
            participant.kind === 'user' &&
            participant.id === String(currentUser.id) &&
            participant.user_type === RelationWithUserType.USER
        );
    };

    const activeCurrencyConfig = Currency[draft.currency];

    return (
        <>
            <View className="gap-y-6">
                {/* 1. Interactive Flow Participant Card Matrix */}
                <View className="flex-row items-center justify-between p-5 rounded-2xl">
                    <Pressable onPress={() => openSelectorFor('sender')}
                               className="flex-1 items-center active:opacity-75">
                        <View
                            className="w-12 h-12 rounded-full bg-bg-primary-lighter items-center justify-center mb-2 border border-border-input">
                            <Iconify icon="heroicons:user-minus" size={22}
                                     color={colors.icon.primary}/>
                        </View>
                        <AppText variant="caption-xs"
                                 className="text-text-primary opacity-60 font-semibold uppercase tracking-wider">{t('transfer.from', 'Sender')}</AppText>
                        <AppText variant="body-base" className="font-bold text-text-primary text-center mt-1"
                                 numberOfLines={1}>
                            {draft.sender ? (isUserSelf(draft.sender) ? t('transfer.you', 'You') : draft.sender.name) : t('transfer.select_user', 'Me')}
                        </AppText>
                    </Pressable>

                    <View className="px-2 items-center justify-center">
                        <Pressable
                            onPress={handleSwapParticipants}
                            className="rounded-full border p-2.5 shadow-sm active:opacity-80"
                            style={{
                                backgroundColor: colors.bg.primary,
                                borderColor: colors.status.border,
                            }}
                        >
                            <Iconify icon="heroicons:arrows-right-left" size={18}
                                     color={colors.icon.primary}/>
                        </Pressable>
                    </View>

                    <Pressable onPress={() => openSelectorFor('recipient')}
                               className="flex-1 items-center active:opacity-75">
                        <View
                            className="mb-2 h-12 w-12 items-center justify-center rounded-full border bg-accent-sky-bg border-accent-sky/40">
                            <Iconify
                                icon="heroicons:user-plus"
                                size={22}
                                color={colors.accent.sky}
                            />
                        </View>
                        <AppText variant="caption-xs"
                                 className="text-text-primary opacity-60 font-semibold uppercase tracking-wider">{t('transfer.to', 'Recipient')}</AppText>
                        <AppText variant="body-base" className="font-bold text-text-primary text-center mt-1"
                                 numberOfLines={1}>
                            {draft.recipient ? (isUserSelf(draft.recipient) ? t('transfer.you', 'You') : draft.recipient.name) : t('transfer.choose_recipient', 'Select Peer')}
                        </AppText>
                    </Pressable>
                </View>

                {/* 2. Amount Input Field Box */}
                <View className="gap-y-2">
                    <AppText variant="body-base" className="font-semibold text-text-primary">
                        {t('transfer.amount_label', 'Amount')}
                    </AppText>
                    <View className="flex-row items-center gap-x-2">
                        <View className="flex-1 min-w-0">
                            <AppInput
                                value={amountString}
                                onChangeText={handleAmountChange}
                                placeholder="0.00"
                                placeholderTextColor={colors.text.placeholder}
                                keyboardType="numeric"
                                renderLeftIcon={() => (
                                    <Pressable
                                        onPress={() => setCurrencySheetOpen(true)}
                                        className="flex-row items-center mr-2 pr-2 border-r border-border-input"
                                    >
                                        <AppText className="text-green-increase text-heading-h3 font-bold">
                                            {activeCurrencyConfig?.symbol ?? '₹'}
                                        </AppText>
                                        <Iconify icon="heroicons:chevron-down" size={14}
                                                 color={colors.icon.primary}
                                                 className="ml-1"/>
                                    </Pressable>
                                )}
                                renderRightIcon={() => (
                                    <Pressable onPress={() => draft.setAmount(0)}>
                                        <AppText variant="body-small"
                                                 className="text-green-increase font-medium">Clear</AppText>
                                    </Pressable>
                                )}
                            />
                        </View>
                        <ScheduleDateChip
                            label={amountDateLabel}
                            mode="once"
                            onPress={openDatePicker}
                        />
                    </View>
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
                                        ? 'bg-accent-sky-bg border-accent-sky'
                                        : 'bg-bg-primary border-border-input shadow-xs'
                                }`}
                            >
                                <AppText variant="body-small"
                                         className={`font-semibold ${isSelected ? 'text-accent-sky' : 'text-text-primary-lighter'}`}>
                                    +{activeCurrencyConfig?.symbol ?? ''}{amt}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* 4. Horizontal Scrollable Payment Categories Component */}
                <PaymentCategorySelector/>

                {/* 5. Name field */}
                <View>
                    <AppInput
                        label={t('transfer.name_label', 'Transfer Name')}
                        placeholder={t('transfer.name_placeholder', 'Enter transfer name')}
                        placeholderTextColor={colors.text.placeholder}
                        value={draft.name}
                        onChangeText={(text) => draft.setName(text)}
                        maxLength={100}
                        renderLeftIcon={() => (
                            <View className="mt-0.5 mr-1">
                                <Iconify icon="heroicons:tag" size={20}
                                         color={colors.icon.primary}/>
                            </View>
                        )}
                    />
                </View>
            </View>

            <SelectEntityBottomSheet
                visible={bottomSheetOpen}
                initialTab="people"
                selectedId={getCurrentlySelectedId()}
                selectedType={getCurrentlySelectedType()}
                selectedMerchantId={getCurrentlySelectedMerchantId()}
                onClose={() => {
                    setBottomSheetOpen(false);
                    setActiveSelectionTarget(null);
                }}
                onSelectPerson={handleUserSelected}
                onSelectMerchant={handleMerchantSelected}
            />

            <CurrencyBottomSheet
                isVisible={currencySheetOpen}
                currentCurrency={draft.currency}
                onSelect={handleCurrencySelect}
                onClose={() => setCurrencySheetOpen(false)}
            />
        </>
    );
};

export default AddTransfer;
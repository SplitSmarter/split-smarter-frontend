import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { PlatinumFormHeader } from '@/src/components/common/PlatinumFormHeader';
import { COLORS, PLATINUM_HEADER } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';
import {
    useExpenseDraftStore,
    type ExpenseItem,
    type ExpenseItemSharer,
    type PayerUser,
} from '@/src/store/draft/expenseDraftStore';
import { Currency } from '@/src/constants/expense/currency';
import { RelationWithUserType } from '@/src/api/dto/constants';
import {
    participantKey,
    sharesToLineAmounts,
    syncSettlementsWithItems,
} from '@/src/utils/expense/expenseCalculations';
import {
    SelectMultiPeopleBottomSheet,
    type SelectedUserEntity,
} from '@/src/components/user/SelectMultiPeopleBottomSheet';
import { SelectExpenseItemBottomSheet } from '@/src/components/expense/SelectExpenseItemBottomSheet';
import {
    getDefaultExpenseItemDraft,
} from '@/src/utils/expense/defaultExpenseItem';
import {
    AssignmentModeToggle,
    type AssignmentMode,
} from './components/AssignmentModeToggle';
import { AssignmentItemRow } from './components/AssignmentItemRow';

function filterSharersToParticipants(
    sharers: ExpenseItemSharer[],
    participantKeys: Set<string>,
): ExpenseItemSharer[] {
    return (sharers ?? []).filter((s) =>
        participantKeys.has(
            participantKey(s.user_id, s.user_type || RelationWithUserType.USER),
        ),
    );
}

function selectedEntityToType(
    userType: SelectedUserEntity['user_type'],
): RelationWithUserType {
    return userType === 'CUSTOM'
        ? RelationWithUserType.CUSTOM
        : RelationWithUserType.USER;
}

function payerToSelectedEntity(p: PayerUser): SelectedUserEntity {
    return {
        id: Number(p.id),
        name: p.name,
        user_type: (p.user_type === RelationWithUserType.CUSTOM
            ? 'CUSTOM'
            : 'USER') as SelectedUserEntity['user_type'],
        avatar: p.avatar ? { id: p.avatar.id, url: p.avatar.url } : null,
    };
}

function sharersToSelectedEntities(
    sharers: ExpenseItemSharer[],
    participants: PayerUser[],
): SelectedUserEntity[] {
    const byKey = new Map(
        participants.map((p) => [
            participantKey(Number(p.id), p.user_type || RelationWithUserType.USER),
            p,
        ]),
    );
    const out: SelectedUserEntity[] = [];
    for (const s of sharers ?? []) {
        const key = participantKey(
            s.user_id,
            s.user_type || RelationWithUserType.USER,
        );
        const p = byKey.get(key);
        if (p) {
            out.push(payerToSelectedEntity(p));
        } else {
            out.push({
                id: s.user_id,
                name: `User ${s.user_id}`,
                user_type: (s.user_type === RelationWithUserType.CUSTOM
                    ? 'CUSTOM'
                    : 'USER') as SelectedUserEntity['user_type'],
                avatar: null,
            });
        }
    }
    return out;
}

function ensureParticipantsOnSide(
    selected: SelectedUserEntity[],
    existing: PayerUser[],
): PayerUser[] {
    const next = [...existing];
    const keys = new Set(
        existing.map((p) =>
            participantKey(Number(p.id), p.user_type || RelationWithUserType.USER),
        ),
    );

    for (const u of selected) {
        const utype = selectedEntityToType(u.user_type);
        const key = participantKey(u.id, utype);
        if (keys.has(key)) continue;
        keys.add(key);
        next.push({
            id: String(u.id),
            name: u.name,
            user_type: utype,
            avatar: u.avatar?.url
                ? {
                      id: u.avatar.id || `avatar-${u.id}`,
                      name: '',
                      url: u.avatar.url,
                      extension: '',
                  }
                : null,
            amount: 0,
            shares: 1,
            isLocked: false,
        });
    }
    return next;
}

function rescaleSharers(
    sharers: ExpenseItemSharer[],
    lineTotal: number,
): ExpenseItemSharer[] {
    if (!sharers.length) return [];
    const drafts = sharers.map((s) => {
        const positive = sharers.map((x) => x.amount).filter((a) => a > 0);
        const min = positive.length ? Math.min(...positive) : 1;
        return {
            user_id: s.user_id,
            user_type: s.user_type,
            shares: Math.max(1, Math.round((s.amount || min) / (min || 1))),
        };
    });
    return sharesToLineAmounts(drafts, lineTotal);
}

export default function ItemAssignmentScreen() {
    const router = useRouter();
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const expenseItems = useExpenseDraftStore((s) => s.expenseItems);
    const payers = useExpenseDraftStore((s) => s.payers);
    const splitParticipants = useExpenseDraftStore((s) => s.splitParticipants);
    const currency = useExpenseDraftStore((s) => s.currency);
    const totalAmount = useExpenseDraftStore((s) => s.totalAmount);
    const setExpenseItems = useExpenseDraftStore((s) => s.setExpenseItems);
    const setPayers = useExpenseDraftStore((s) => s.setPayers);
    const setSplitParticipants = useExpenseDraftStore((s) => s.setSplitParticipants);
    const setTotalAmount = useExpenseDraftStore((s) => s.setTotalAmount);

    /** Persist items and realign expense total + Paid by + Split with attributions. */
    const commitItemsAndSyncSettlements = useCallback(
        (nextItems: ExpenseItem[]) => {
            const draft = useExpenseDraftStore.getState();
            const synced = syncSettlementsWithItems(
                draft.payers,
                draft.splitParticipants,
                draft.expenseItems,
                nextItems,
                draft.totalAmount,
            );
            setExpenseItems(nextItems);
            setTotalAmount(synced.totalAmount);
            setPayers(synced.payers);
            setSplitParticipants(synced.splitParticipants);
        },
        [setExpenseItems, setPayers, setSplitParticipants, setTotalAmount],
    );

    const [mode, setMode] = useState<AssignmentMode>('paidBy');
    const [assignItemId, setAssignItemId] = useState<string | null>(null);
    const assignItemIdRef = useRef<string | null>(null);
    const [peopleSheetVisible, setPeopleSheetVisible] = useState(false);
    const [itemSheetVisible, setItemSheetVisible] = useState(false);

    const currencySymbol = Currency[currency]?.symbol ?? '₹';
    const participants = mode === 'paidBy' ? payers : splitParticipants;

    const assignItem = useMemo(
        () => expenseItems.find((i) => i.id === assignItemId) ?? null,
        [expenseItems, assignItemId],
    );

    const initialSelectedUsers = useMemo(() => {
        if (!assignItem) return [] as SelectedUserEntity[];
        const sharers =
            mode === 'paidBy'
                ? assignItem.paidBetween ?? []
                : assignItem.sharedBetween ?? [];
        return sharersToSelectedEntities(sharers, participants);
    }, [assignItem, mode, participants]);

    const updateItemSharers = useCallback(
        (itemId: string, next: ExpenseItemSharer[], forMode: AssignmentMode = mode) => {
            const current = useExpenseDraftStore.getState().expenseItems;
            const nextItems = current.map((item) => {
                if (item.id !== itemId) return item;
                if (forMode === 'paidBy') {
                    return {...item, paidBetween: next};
                }
                return {...item, sharedBetween: next};
            });
            commitItemsAndSyncSettlements(nextItems);
        },
        [mode, commitItemsAndSyncSettlements],
    );

    const updateQuantity = useCallback(
        (itemId: string, delta: number) => {
            const current = useExpenseDraftStore.getState().expenseItems;
            const nextItems = current
                .map((item) => {
                    if (item.id !== itemId) return item;
                    const quantity = Math.max(1, (item.quantity || 1) + delta);
                    const lineTotal = item.cost * quantity;
                    const paidBetween = rescaleSharers(
                        item.paidBetween ?? [],
                        lineTotal,
                    );
                    const sharedBetween = rescaleSharers(
                        item.sharedBetween ?? [],
                        lineTotal,
                    );
                    return {...item, quantity, paidBetween, sharedBetween};
                })
                .filter((item) => item.quantity > 0);
            commitItemsAndSyncSettlements(nextItems);
        },
        [commitItemsAndSyncSettlements],
    );

    /** Edit line total; unit cost = lineTotal / quantity. Rescales assignee amounts. */
    const updateLineAmount = useCallback(
        (itemId: string, lineAmount: number) => {
            const safe = Math.max(0, lineAmount);
            const current = useExpenseDraftStore.getState().expenseItems;
            const nextItems = current.map((item) => {
                if (item.id !== itemId) return item;
                const quantity = Math.max(1, item.quantity || 1);
                const cost = Math.round((safe / quantity) * 100) / 100;
                const lineTotal = cost * quantity;
                return {
                    ...item,
                    cost,
                    paidBetween: rescaleSharers(item.paidBetween ?? [], lineTotal),
                    sharedBetween: rescaleSharers(item.sharedBetween ?? [], lineTotal),
                };
            });
            commitItemsAndSyncSettlements(nextItems);
        },
        [commitItemsAndSyncSettlements],
    );

    const deleteItem = useCallback(
        (itemId: string) => {
            const current = useExpenseDraftStore.getState().expenseItems;
            commitItemsAndSyncSettlements(
                current.filter((item) => item.id !== itemId),
            );
        },
        [commitItemsAndSyncSettlements],
    );

    const sanitizedItems: ExpenseItem[] = useMemo(
        () =>
            expenseItems.map((item) => ({
                ...item,
                paidBetween: filterSharersToParticipants(
                    item.paidBetween ?? [],
                    new Set(
                        payers.map((p) =>
                            participantKey(
                                Number(p.id),
                                p.user_type || RelationWithUserType.USER,
                            ),
                        ),
                    ),
                ),
                sharedBetween: filterSharersToParticipants(
                    item.sharedBetween ?? [],
                    new Set(
                        splitParticipants.map((p) =>
                            participantKey(
                                Number(p.id),
                                p.user_type || RelationWithUserType.USER,
                            ),
                        ),
                    ),
                ),
            })),
        [expenseItems, payers, splitParticipants],
    );

    const openAssignSheet = (itemId: string) => {
        assignItemIdRef.current = itemId;
        setAssignItemId(itemId);
        setPeopleSheetVisible(true);
    };

    const closePeopleSheet = useCallback(() => {
        setPeopleSheetVisible(false);
        assignItemIdRef.current = null;
        setAssignItemId(null);
    }, []);

    const handlePeopleConfirmed = useCallback(
        (selectedUsers: SelectedUserEntity[]) => {
            const itemId = assignItemIdRef.current;
            const draft = useExpenseDraftStore.getState();
            const item = draft.expenseItems.find((i) => i.id === itemId);
            if (!itemId || !item) {
                closePeopleSheet();
                return;
            }

            const lineTotal = item.cost * Math.max(1, item.quantity || 1);
            const activeMode = mode;

            // Ensure selected people exist on Paid by / Split before attributing lines.
            if (activeMode === 'paidBy') {
                setPayers(ensureParticipantsOnSide(selectedUsers, draft.payers));
            } else {
                setSplitParticipants(
                    ensureParticipantsOnSide(selectedUsers, draft.splitParticipants),
                );
            }

            const drafts = selectedUsers.map((u) => ({
                user_id: Number(u.id),
                user_type: selectedEntityToType(u.user_type),
                shares: 1,
            }));

            // sharesToLineAmounts returns [] when lineTotal <= 0 — still persist assignees.
            const next: ExpenseItemSharer[] =
                selectedUsers.length === 0
                    ? []
                    : lineTotal > 0
                      ? sharesToLineAmounts(drafts, lineTotal)
                      : drafts.map((d) => ({
                            user_id: d.user_id,
                            user_type: d.user_type,
                            amount: 0,
                        }));

            // updateItemSharers → commitItemsAndSyncSettlements (picks up ensureParticipantsOnSide)
            updateItemSharers(itemId, next, activeMode);
            closePeopleSheet();
        },
        [mode, setPayers, setSplitParticipants, updateItemSharers, closePeopleSheet],
    );

    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;

    return (
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <View className="flex-1" style={{backgroundColor: heroStatusBar}}>
                <PlatinumFormHeader
                    title="Assign items"
                    subtitle={
                        mode === 'paidBy'
                            ? 'Who funded each line'
                            : 'Who shares each line'
                    }
                    onBack={() => router.back()}
                    right={
                        <Pressable
                            onPress={() => {
                                commitItemsAndSyncSettlements(sanitizedItems);
                                router.back();
                            }}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel="Done"
                            className="h-10 items-center justify-center px-1 active:opacity-70"
                        >
                            <AppText
                                variant="body-small"
                                className="font-semibold text-white"
                            >
                                Done
                            </AppText>
                        </Pressable>
                    }
                />

                <View
                    className="flex-1 overflow-hidden"
                    style={{
                        marginTop: -20,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        backgroundColor: canvasBg,
                    }}
                >
                    <View className="px-4 pt-5">
                        <AssignmentModeToggle mode={mode} onChange={setMode} />
                        <AppText
                            variant="caption-xs"
                            className="mt-2 text-text-primary-lighter"
                        >
                            {mode === 'paidBy'
                                ? 'Assign who funded each item. Empty = everyone on Paid by.'
                                : 'Assign who shares each item. Empty = everyone on Split.'}
                        </AppText>
                    </View>

                    <ScrollView
                        className="flex-1 px-4 pt-4"
                        style={{backgroundColor: canvasBg}}
                        contentContainerStyle={{paddingBottom: 24}}
                        showsVerticalScrollIndicator={false}
                    >
                        {expenseItems.length === 0 ? (
                            <AppText
                                variant="body-small"
                                className="py-8 text-center text-text-primary-lighter"
                            >
                                No items yet. Use Select item below to add catalog lines.
                            </AppText>
                        ) : (
                            expenseItems.map((item) => (
                                <AssignmentItemRow
                                    key={item.id}
                                    item={item}
                                    mode={mode}
                                    participants={participants}
                                    currencySymbol={currencySymbol}
                                    isDark={isDark}
                                    onOpenPeople={() => openAssignSheet(item.id)}
                                    onUpdateSharers={(next) =>
                                        updateItemSharers(item.id, next)
                                    }
                                    onUpdateQuantity={(delta) =>
                                        updateQuantity(item.id, delta)
                                    }
                                    onUpdateLineAmount={(amount) =>
                                        updateLineAmount(item.id, amount)
                                    }
                                    onDelete={() => deleteItem(item.id)}
                                />
                            ))
                        )}
                    </ScrollView>

                    <View
                        className="border-t border-border-input px-4 pb-6 pt-3"
                        style={{backgroundColor: canvasBg}}
                    >
                        <AppButton
                            variant="secondary"
                            onPress={() => setItemSheetVisible(true)}
                            renderIcon={(c) => (
                                <Iconify icon="heroicons:shopping-bag" size={18} color={c} />
                            )}
                        >
                            Select item
                        </AppButton>
                    </View>
                </View>
            </View>

            <SelectMultiPeopleBottomSheet
                visible={peopleSheetVisible}
                initialSelectedUsers={initialSelectedUsers}
                allowedUserTypes={[
                    RelationWithUserType.USER,
                    RelationWithUserType.CUSTOM,
                ]}
                onClose={closePeopleSheet}
                onConfirmed={(selected) => handlePeopleConfirmed(selected)}
            />

            <SelectExpenseItemBottomSheet
                visible={itemSheetVisible}
                selectedItems={expenseItems}
                splitParticipants={splitParticipants}
                currencySymbol={currencySymbol}
                expenseTotalAmount={totalAmount}
                onClose={() => setItemSheetVisible(false)}
                onSave={(items, opts) => {
                    const resolved =
                        items.length > 0
                            ? items.map((i) => ({
                                  ...i,
                                  sharedBetween: i.sharedBetween ?? [],
                                  paidBetween: i.paidBetween ?? [],
                              }))
                            : (() => {
                                  const amount =
                                      typeof opts?.syncTotalAmount === 'number'
                                          ? opts.syncTotalAmount
                                          : totalAmount;
                                  const fallback = getDefaultExpenseItemDraft(amount);
                                  return fallback ? [fallback] : [];
                              })();
                    commitItemsAndSyncSettlements(resolved);
                    setItemSheetVisible(false);
                }}
                onAddNew={() => {
                    setItemSheetVisible(false);
                    router.push('/(authenticated)/expense/items/add');
                }}
            />
        </ScreenWrapper>
    );
}

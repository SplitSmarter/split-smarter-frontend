import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import {
    ExpenseItem,
    ExpenseItemSharer,
    PayerUser,
} from '@/src/store/draft/expenseDraftStore';
import { RelationWithUserType } from '@/src/api/dto/constants';
import {
    ItemShareDraft,
    participantKey,
    sharesToLineAmounts,
} from '@/src/utils/expense/expenseCalculations';
import { ItemAssigneeChips } from './ItemAssigneeChips';
import type { AssignmentMode } from './AssignmentModeToggle';
import { COLORS } from '@/src/constants/colors';

interface AssignmentItemRowProps {
    item: ExpenseItem;
    mode: AssignmentMode;
    participants: PayerUser[];
    currencySymbol: string;
    isDark: boolean;
    onOpenPeople: () => void;
    onUpdateSharers: (next: ExpenseItemSharer[]) => void;
    onUpdateQuantity: (delta: number) => void;
    onUpdateLineAmount: (amount: number) => void;
    onDelete: () => void;
}

function draftsFromAmounts(sharers: ExpenseItemSharer[]): ItemShareDraft[] {
    if (!sharers?.length) return [];
    const positive = sharers.map((s) => s.amount).filter((a) => a > 0);
    const min = positive.length > 0 ? Math.min(...positive) : 0;
    if (min <= 0) {
        return sharers.map((s) => ({
            user_id: s.user_id,
            user_type: s.user_type,
            shares: 1,
        }));
    }
    return sharers.map((s) => ({
        user_id: s.user_id,
        user_type: s.user_type,
        shares: Math.max(1, Math.round(s.amount / min)),
    }));
}

export function AssignmentItemRow({
    item,
    mode,
    participants,
    currencySymbol,
    isDark,
    onOpenPeople,
    onUpdateSharers,
    onUpdateQuantity,
    onUpdateLineAmount,
    onDelete,
}: AssignmentItemRowProps) {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const lineTotal = item.cost * Math.max(1, item.quantity || 1);
    const activeSharers =
        mode === 'paidBy' ? item.paidBetween ?? [] : item.sharedBetween ?? [];

    const [amountText, setAmountText] = useState(
        lineTotal > 0 ? String(lineTotal) : '',
    );

    useEffect(() => {
        const next = lineTotal > 0 ? String(Math.round(lineTotal * 100) / 100) : '';
        setAmountText((prev) => {
            const parsed = parseFloat(prev || '0');
            if (!isNaN(parsed) && Math.abs(parsed - lineTotal) < 0.009) return prev;
            return next;
        });
    }, [lineTotal]);

    const commitAmount = () => {
        const parsed = parseFloat(amountText || '0');
        if (isNaN(parsed) || parsed < 0) {
            setAmountText(lineTotal > 0 ? String(lineTotal) : '');
            return;
        }
        onUpdateLineAmount(parsed);
    };

    const drafts = useMemo(
        () => draftsFromAmounts(activeSharers),
        [activeSharers],
    );

    /** Include assignee stubs so chips render even before payers/split lists catch up. */
    const displayParticipants = useMemo(() => {
        const map = new Map(
            participants.map((p) => [
                participantKey(
                    Number(p.id),
                    p.user_type || RelationWithUserType.USER,
                ),
                p,
            ]),
        );
        for (const s of activeSharers) {
            const key = participantKey(
                s.user_id,
                s.user_type || RelationWithUserType.USER,
            );
            if (map.has(key)) continue;
            map.set(key, {
                id: String(s.user_id),
                name: `User ${s.user_id}`,
                user_type: s.user_type || RelationWithUserType.USER,
                avatar: null,
                amount: 0,
                shares: 1,
            });
        }
        return Array.from(map.values());
    }, [participants, activeSharers]);

    const handleChange = (next: ItemShareDraft[]) => {
        if (lineTotal <= 0) {
            onUpdateSharers(
                next.map((d) => ({
                    user_id: d.user_id,
                    user_type: d.user_type,
                    amount: 0,
                })),
            );
            return;
        }
        onUpdateSharers(sharesToLineAmounts(next, lineTotal));
    };

    return (
        <View className="mb-3 rounded-2xl border border-border-input bg-bg-lighter p-3">
            {/* Title row: icon + name | amount · qty · delete */}
            <View className="mb-2 flex-row items-center">
                <AppImageV2
                    id={`assign-item-${item.id}`}
                    url={item.iconUrl ?? null}
                    style={{ width: 36, height: 36 }}
                    className="rounded-full"
                    contentFit="contain"
                    fallbackComponent={
                        <EntityFallbackIcon
                            kind="expenseItem"
                            size={16}
                            color={colors.icon.primary}
                        />
                    }
                />
                <AppText
                    variant="body-small"
                    className="ml-2 flex-1 font-semibold text-text-primary"
                    numberOfLines={1}
                >
                    {item.title}
                </AppText>

                <View className="ml-2 flex-row items-center gap-2">
                    <View className="min-w-[72px] max-w-[100px] flex-row items-center rounded-lg border border-border-input bg-bg-primary px-1.5 py-0.5">
                        <AppText
                            variant="caption-xs"
                            className="mr-0.5 font-semibold text-green-increase"
                        >
                            {currencySymbol}
                        </AppText>
                        <TextInput
                            value={amountText}
                            onChangeText={setAmountText}
                            onBlur={commitAmount}
                            onSubmitEditing={commitAmount}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                            placeholder="0"
                            placeholderTextColor={colors.text.placeholder}
                            className="flex-1 py-0.5 text-right font-semibold text-green-increase"
                            style={{
                                fontSize: 12,
                                color: colors.status.success,
                                minWidth: 40,
                                padding: 0,
                            }}
                            accessibilityLabel="Item amount"
                        />
                    </View>

                    <View className="flex-row items-center rounded-lg border border-border-input bg-bg-primary px-1">
                        <Pressable
                            onPress={() => onUpdateQuantity(-1)}
                            className="p-1"
                            hitSlop={6}
                            accessibilityLabel="Decrease quantity"
                        >
                            <Iconify
                                icon="heroicons:minus"
                                size={14}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                        <AppText className="mx-1 min-w-[16px] text-center font-bold text-text-primary">
                            {item.quantity}
                        </AppText>
                        <Pressable
                            onPress={() => onUpdateQuantity(1)}
                            className="p-1"
                            hitSlop={6}
                            accessibilityLabel="Increase quantity"
                        >
                            <Iconify
                                icon="heroicons:plus"
                                size={14}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={onDelete}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.title}`}
                        className="rounded-lg p-1"
                    >
                        <Iconify
                            icon="heroicons:trash"
                            size={18}
                            color={colors.status.error}
                        />
                    </Pressable>
                </View>
            </View>

            <ItemAssigneeChips
                drafts={drafts}
                participants={displayParticipants}
                lineTotal={lineTotal}
                currencySymbol={currencySymbol}
                isDark={isDark}
                onChange={handleChange}
                onAddPeople={onOpenPeople}
            />
        </View>
    );
}

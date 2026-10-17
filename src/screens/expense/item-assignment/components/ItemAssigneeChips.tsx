import React from 'react';
import { View, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { RelationWithUserType } from '@/src/api/dto/constants';
import { PayerUser } from '@/src/store/draft/expenseDraftStore';
import {
    ItemShareDraft,
    participantKey,
    sharesToLineAmounts,
} from '@/src/utils/expense/expenseCalculations';
import { COLORS } from '@/src/constants/colors';

interface ItemAssigneeChipsProps {
    /** People currently assigned (with shares). */
    drafts: ItemShareDraft[];
    /** Lookup for name / avatar. */
    participants: PayerUser[];
    lineTotal: number;
    currencySymbol: string;
    isDark: boolean;
    onChange: (next: ItemShareDraft[]) => void;
    onAddPeople: () => void;
}

export function ItemAssigneeChips({
    drafts,
    participants,
    lineTotal,
    currencySymbol,
    isDark,
    onChange,
    onAddPeople,
}: ItemAssigneeChipsProps) {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const preview = sharesToLineAmounts(drafts, lineTotal);

    const byKey = new Map(
        participants.map((p) => [
            participantKey(Number(p.id), p.user_type || RelationWithUserType.USER),
            p,
        ]),
    );

    const adjustShares = (
        userId: number,
        userType: RelationWithUserType,
        delta: number,
    ) => {
        onChange(
            drafts
                .map((d) => {
                    if (d.user_id !== userId || d.user_type !== userType) return d;
                    return { ...d, shares: d.shares + delta };
                })
                .filter((d) => d.shares > 0),
        );
    };

    const removeUser = (userId: number, userType: RelationWithUserType) => {
        onChange(
            drafts.filter(
                (d) =>
                    !(d.user_id === userId && d.user_type === userType),
            ),
        );
    };

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, alignItems: 'center', paddingRight: 4 }}
            className="flex-1"
        >
            {drafts.length === 0 ? (
                <Pressable
                    onPress={onAddPeople}
                    className="flex-row items-center rounded-xl border border-dashed border-border-input bg-bg-primary px-3 py-2"
                >
                    <AppText variant="caption-xs" className="text-text-primary-lighter">
                        Everyone · tap to assign
                    </AppText>
                </Pressable>
            ) : (
                drafts.map((d) => {
                    const key = participantKey(d.user_id, d.user_type);
                    const person = byKey.get(key);
                    const previewAmt = preview.find(
                        (x) => participantKey(x.user_id, x.user_type) === key,
                    )?.amount;

                    return (
                        <View
                            key={key}
                            className="items-center rounded-xl border border-accent-sky bg-accent-sky-bg px-2 py-1.5"
                            style={{ minWidth: 72 }}
                        >
                            <Pressable
                                onLongPress={() => removeUser(d.user_id, d.user_type)}
                                accessibilityLabel="Long press to remove"
                            >
                                <View className="mb-1 items-center overflow-hidden rounded-full bg-bg-primary">
                                    <AppImageV2
                                        id={`assign-avatar-${key}`}
                                        url={person?.avatar?.url ?? null}
                                        style={{ width: 28, height: 28 }}
                                        className="rounded-full"
                                        contentFit="cover"
                                        fallbackComponent={
                                            <EntityFallbackIcon
                                                kind="user"
                                                size={14}
                                                color={colors.accent.sky}
                                            />
                                        }
                                    />
                                </View>
                                <AppText
                                    variant="caption-xs"
                                    className="max-w-[64px] text-center font-semibold text-accent-sky"
                                    numberOfLines={1}
                                >
                                    {person?.name?.split(' ')[0] ?? `#${d.user_id}`}
                                </AppText>
                            </Pressable>
                            <View className="mt-0.5 flex-row items-center">
                                <Pressable
                                    onPress={() =>
                                        adjustShares(d.user_id, d.user_type, -1)
                                    }
                                    className="p-0.5"
                                    hitSlop={6}
                                >
                                    <Iconify
                                        icon="heroicons:minus"
                                        size={12}
                                        color={colors.icon.primary}
                                    />
                                </Pressable>
                                <AppText
                                    variant="caption-xs"
                                    className="mx-0.5 font-bold text-text-primary"
                                >
                                    {d.shares}
                                </AppText>
                                <Pressable
                                    onPress={() =>
                                        adjustShares(d.user_id, d.user_type, 1)
                                    }
                                    className="p-0.5"
                                    hitSlop={6}
                                >
                                    <Iconify
                                        icon="heroicons:plus"
                                        size={12}
                                        color={colors.icon.primary}
                                    />
                                </Pressable>
                            </View>
                            {previewAmt != null && (
                                <AppText
                                    variant="caption-xs"
                                    className="text-text-primary-lighter"
                                >
                                    {currencySymbol}
                                    {previewAmt.toFixed(0)}
                                </AppText>
                            )}
                        </View>
                    );
                })
            )}
            <Pressable
                onPress={onAddPeople}
                className="h-10 w-10 items-center justify-center rounded-full border border-border-input bg-bg-primary"
                accessibilityRole="button"
                accessibilityLabel="Add or change people"
            >
                <Iconify
                    icon="heroicons:user-plus"
                    size={18}
                    color={colors.icon.primary}
                />
            </Pressable>
        </ScrollView>
    );
}

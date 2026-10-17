import React from 'react';
import {View, Pressable} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {PayerUser} from '@/src/store/draft/expenseDraftStore';
import {
    ItemShareDraft,
    participantKey,
    sharesToLineAmounts,
} from '@/src/utils/expense/expenseCalculations';
import {COLORS} from '@/src/constants/colors';

interface ItemShareAssigneesProps {
    splitParticipants: PayerUser[];
    drafts: ItemShareDraft[];
    lineTotal: number;
    currencySymbol: string;
    isDark: boolean;
    onChange: (next: ItemShareDraft[]) => void;
}

export const ItemShareAssignees: React.FC<ItemShareAssigneesProps> = ({
    splitParticipants,
    drafts,
    lineTotal,
    currencySymbol,
    isDark,
    onChange,
}) => {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const preview = sharesToLineAmounts(drafts, lineTotal);

    const toggleUser = (p: PayerUser) => {
        const uid = Number(p.id);
        const utype = p.user_type || RelationWithUserType.USER;
        const key = participantKey(uid, utype);
        const exists = drafts.some((d) => participantKey(d.user_id, d.user_type) === key);
        if (exists) {
            onChange(drafts.filter((d) => participantKey(d.user_id, d.user_type) !== key));
        } else {
            onChange([...drafts, {user_id: uid, user_type: utype, shares: 1}]);
        }
    };

    const adjustShares = (userId: number, userType: RelationWithUserType, delta: number) => {
        onChange(
            drafts
                .map((d) => {
                    if (d.user_id !== userId || d.user_type !== userType) return d;
                    return {...d, shares: d.shares + delta};
                })
                .filter((d) => d.shares > 0)
        );
    };

    if (splitParticipants.length === 0) {
        return (
            <AppText variant="caption-xs" className="mt-2 text-text-primary-lighter">
                Add people in Split Between to assign this item
            </AppText>
        );
    }

    return (
        <View className="mt-2 w-full">
            <AppText variant="caption-xs" className="mb-1 font-semibold text-text-primary-lighter">
                Shared by {drafts.length === 0 ? '(everyone)' : ''}
            </AppText>
            <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 6}}
            >
                {splitParticipants.map((p) => {
                    const uid = Number(p.id);
                    const utype = p.user_type || RelationWithUserType.USER;
                    const key = participantKey(uid, utype);
                    const draft = drafts.find((d) => participantKey(d.user_id, d.user_type) === key);
                    const selected = !!draft;
                    const previewAmt = preview.find(
                        (x) => participantKey(x.user_id, x.user_type) === key
                    )?.amount;

                    return (
                        <View
                            key={key}
                            className={`rounded-xl border px-2 py-1.5 ${
                                selected
                                    ? 'border-accent-sky bg-accent-sky-bg'
                                    : 'border-border-input bg-bg-primary'
                            }`}
                        >
                            <Pressable onPress={() => toggleUser(p)} className="active:opacity-80">
                                <AppText
                                    variant="caption-xs"
                                    className={`font-semibold ${
                                        selected ? 'text-accent-sky' : 'text-text-primary'
                                    }`}
                                    numberOfLines={1}
                                >
                                    {p.name}
                                </AppText>
                            </Pressable>
                            {selected && draft ? (
                                <View className="mt-1 flex-row items-center">
                                    <Pressable
                                        onPress={() => adjustShares(uid, utype, -1)}
                                        className="p-0.5"
                                    >
                                        <Iconify
                                            icon="heroicons:minus"
                                            size={12}
                                            color={colors.icon.primary}
                                        />
                                    </Pressable>
                                    <AppText variant="caption-xs" className="mx-1 font-bold text-text-primary">
                                        {draft.shares}
                                    </AppText>
                                    <Pressable
                                        onPress={() => adjustShares(uid, utype, 1)}
                                        className="p-0.5"
                                    >
                                        <Iconify
                                            icon="heroicons:plus"
                                            size={12}
                                            color={colors.icon.primary}
                                        />
                                    </Pressable>
                                    {previewAmt != null && (
                                        <AppText
                                            variant="caption-xs"
                                            className="ml-1 text-text-primary-lighter"
                                        >
                                            {currencySymbol}
                                            {previewAmt.toFixed(0)}
                                        </AppText>
                                    )}
                                </View>
                            ) : null}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

import React, {useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {BudgetAudienceType} from '@/src/api/dto/expense/constant';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {userStore} from '@/src/store/userStore';
import {SelectedUserEntity} from '@/src/components/user/SelectMultiPeopleBottomSheet';
import {AUDIENCE_OPTIONS} from '../types';
import {getElevatedCardStyle} from '../styles/elevatedCard';
import {BudgetSectionHeader} from './BudgetSectionHeader';

type Props = {
    audienceType: BudgetAudienceType;
    groupName: string | null;
    members: SelectedUserEntity[];
    onAudienceChange: (a: BudgetAudienceType) => void;
    onOpenGroup: () => void;
    onOpenMembers: () => void;
    onRemoveMember: (id: number) => void;
};

function isSelfMember(
    member: SelectedUserEntity,
    currentUserId?: number | null,
): boolean {
    if (currentUserId == null) return false;
    return (
        String(member.id) === String(currentUserId) &&
        String(member.user_type).toUpperCase() === RelationWithUserType.USER
    );
}

export function BudgetAudienceSection({
    audienceType,
    groupName,
    members,
    onAudienceChange,
    onOpenGroup,
    onOpenMembers,
    onRemoveMember,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const currentUser = userStore((s) => s.user);

    const displayMembers = useMemo(() => {
        if (audienceType !== BudgetAudienceType.USER_SHARED) return members;
        if (!currentUser) return members;

        const peers = members.filter((m) => !isSelfMember(m, currentUser.id));
        const selfFromList = members.find((m) => isSelfMember(m, currentUser.id));
        const self: SelectedUserEntity = selfFromList ?? {
            id: currentUser.id,
            name: 'You',
            user_type: RelationWithUserType.USER,
            avatar: currentUser.avatar ?? null,
        };
        return [{...self, name: 'You'}, ...peers];
    }, [audienceType, members, currentUser]);

    const peerCount = displayMembers.filter(
        (m) => !isSelfMember(m, currentUser?.id),
    ).length;

    return (
        <View>
            <BudgetSectionHeader
                title="Who"
                hint="Ownership"
                renderIcon={(c) => <Iconify icon="heroicons:users" size={18} color={c} />}
            />
            <View className="rounded-3xl border p-4" style={getElevatedCardStyle(isDark)}>
            <View className="mb-4 flex-row gap-2">
                {AUDIENCE_OPTIONS.map((opt) => {
                    const selected = audienceType === opt.value;
                    return (
                        <Pressable
                            key={opt.value}
                            onPress={() => onAudienceChange(opt.value)}
                            className={`flex-1 rounded-2xl border p-3 ${
                                selected
                                    ? 'border-accent-sky bg-accent-sky-bg'
                                    : 'border-border-input bg-bg-primary'
                            }`}
                        >
                            {opt.value === BudgetAudienceType.USER ? (
                                <Iconify
                                    icon="heroicons:user"
                                    size={18}
                                    color={selected ? colors.accent.sky : colors.icon.lighter}
                                />
                            ) : opt.value === BudgetAudienceType.USER_SHARED ? (
                                <Iconify
                                    icon="heroicons:users"
                                    size={18}
                                    color={selected ? colors.accent.sky : colors.icon.lighter}
                                />
                            ) : (
                                <Iconify
                                    icon="heroicons:user-group"
                                    size={18}
                                    color={selected ? colors.accent.sky : colors.icon.lighter}
                                />
                            )}
                            <AppText
                                variant="caption-xs"
                                className={`mt-2 font-bold ${
                                    selected ? 'text-accent-sky' : 'text-text-primary'
                                }`}
                            >
                                {opt.label}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5 text-text-primary-lighter"
                                numberOfLines={2}
                            >
                                {opt.description}
                            </AppText>
                        </Pressable>
                    );
                })}
            </View>

            {audienceType === BudgetAudienceType.USER_SHARED && (
                <View className="rounded-2xl border border-border-input bg-bg-primary p-4">
                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                            <AppText className="font-bold text-text-primary">
                                Shared members
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5 text-text-primary-lighter"
                            >
                                {peerCount > 0
                                    ? `You + ${peerCount} other${peerCount === 1 ? '' : 's'}`
                                    : 'You are included — add at least one person'}
                            </AppText>
                        </View>
                        <Pressable
                            onPress={onOpenMembers}
                            className="flex-row items-center gap-1 rounded-xl border border-accent-sky bg-accent-sky-bg px-3 py-1.5"
                        >
                            <Iconify
                                icon="heroicons:user-plus"
                                size={14}
                                color={colors.accent.sky}
                            />
                            <AppText
                                variant="caption-xs"
                                className="font-semibold text-accent-sky"
                            >
                                Add
                            </AppText>
                        </Pressable>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                        {displayMembers.map((m) => {
                            const isSelf = isSelfMember(m, currentUser?.id);
                            return (
                                <View
                                    key={`${m.user_type}-${m.id}`}
                                    className={`flex-row items-center gap-2 rounded-full border px-2.5 py-1.5 ${
                                        isSelf
                                            ? 'border-accent-sky bg-accent-sky-bg'
                                            : 'border-border-input bg-bg-canvas'
                                    }`}
                                >
                                    <View className="h-6 w-6 overflow-hidden rounded-full">
                                        <AppImageV2
                                            id={m.avatar?.id ?? `budget-member-${m.id}`}
                                            url={m.avatar?.url}
                                            contentFit="cover"
                                            style={{width: '100%', height: '100%'}}
                                            fallbackComponent={
                                                <EntityFallbackIcon
                                                    kind="user"
                                                    size={14}
                                                    color={
                                                        isSelf
                                                            ? colors.accent.sky
                                                            : colors.icon.lighter
                                                    }
                                                />
                                            }
                                        />
                                    </View>
                                    <AppText
                                        variant="caption-xs"
                                        className={`max-w-[100px] font-semibold ${
                                            isSelf ? 'text-accent-sky' : 'text-text-primary'
                                        }`}
                                        numberOfLines={1}
                                    >
                                        {isSelf ? 'You' : m.name}
                                    </AppText>
                                    {isSelf ? null : (
                                        <Pressable
                                            onPress={() => onRemoveMember(m.id)}
                                            hitSlop={8}
                                        >
                                            <Iconify
                                                icon="heroicons:x-mark"
                                                size={14}
                                                color={colors.icon.lighter}
                                            />
                                        </Pressable>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            {audienceType === BudgetAudienceType.GROUP && (
                <Pressable
                    onPress={onOpenGroup}
                    className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-primary px-4 py-3.5 active:opacity-80"
                >
                    <View className="flex-1 pr-3">
                        <AppText
                            variant="caption-xs"
                            className="mb-0.5 font-semibold text-text-primary-lighter"
                        >
                            Target group
                        </AppText>
                        <AppText className="font-semibold text-text-primary">
                            {groupName || 'Select group'}
                        </AppText>
                    </View>
                    {groupName ? (
                        <Iconify
                            icon="heroicons:check-circle"
                            size={20}
                            color={colors.accent.sky}
                        />
                    ) : (
                        <Iconify
                            icon="heroicons:chevron-right"
                            size={18}
                            color={colors.icon.lighter}
                        />
                    )}
                </Pressable>
            )}
            </View>
        </View>
    );
}

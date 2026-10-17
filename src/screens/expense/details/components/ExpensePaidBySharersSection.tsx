import React, {useMemo} from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import type {
    ExpensePaidByDetail,
    ExpenseSharerDetail,
    PaymentLinkSummary,
} from '@/src/api/dto/expense/expense';
import type {PaymentLinkDetails} from '@/src/api/dto/expense/payment_link';
import type {Currency} from '@/src/api/dto/constants';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';

type LinkRow = PaymentLinkDetails | PaymentLinkSummary;

type ExpensePaidBySharersSectionProps = {
    paidBy: ExpensePaidByDetail[];
    sharers: ExpenseSharerDetail[];
    currency: Currency;
    paymentLinks: LinkRow[];
    viewerId: number | null;
    isViewerPayer: boolean;
};

function Avatar({
    name,
    avatarId,
    avatarUrl,
    size = 28,
}: {
    name: string;
    avatarId?: string;
    avatarUrl?: string;
    size?: number;
}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    return (
        <View
            className="overflow-hidden rounded-full bg-bg-primary border border-border-input"
            style={{width: size, height: size}}
        >
            <AppImageV2
                id={avatarId ?? name}
                url={avatarUrl}
                style={{width: '100%', height: '100%'}}
                contentFit="cover"
                fallbackComponent={
                    <EntityFallbackIcon kind="user" size={size * 0.45} color={colors.icon.lighter} />
                }
            />
        </View>
    );
}

export function ExpensePaidBySharersSection({
    paidBy,
    sharers,
    currency,
    paymentLinks,
    viewerId,
    isViewerPayer,
}: ExpensePaidBySharersSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const coverTotal = useMemo(
        () =>
            paymentLinks.reduce(
                (sum, link) => sum + (link.covered_amount ?? link.amount_inr ?? 0),
                0,
            ),
        [paymentLinks],
    );

    const viewerPaidAmount = useMemo(() => {
        if (viewerId == null) return 0;
        return paidBy.find((p) => p.id === viewerId)?.amount ?? 0;
    }, [paidBy, viewerId]);

    const coverPct =
        viewerPaidAmount > 0
            ? Math.min(100, (coverTotal / viewerPaidAmount) * 100)
            : 0;

    if (paidBy.length === 0 && sharers.length === 0) return null;

    const peopleCount = new Set([
        ...paidBy.map((p) => p.id),
        ...sharers.map((s) => s.id),
    ]).size;

    const paidDeclared = paidBy.reduce((sum, p) => sum + p.amount, 0);

    return (
        <View className="gap-y-3">
            <View className="flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Paid By vs Sharers
                </AppText>
                <AppText
                    variant="body-small"
                    className="font-semibold"
                    style={{color: colors.text.lighter}}
                >
                    {peopleCount} People
                </AppText>
            </View>

            {paidBy.length > 0 ? (
                <View
                    className="gap-y-2.5 rounded-3xl border p-4"
                    style={{
                        backgroundColor: colors.bg.lighter,
                        borderColor: colors.status.border,
                        shadowColor: COLORS.light.brand.primary,
                        shadowOpacity: isDark ? 0.35 : 0.08,
                        shadowRadius: 12,
                        shadowOffset: {width: 0, height: 4},
                        elevation: 3,
                    }}
                >
                    <View className="flex-row items-center justify-between border-b border-border-input pb-2">
                        <View className="flex-row items-center gap-1.5">
                            <Iconify
                                icon="heroicons:credit-card"
                                size={14}
                                color={colors.accent.sky}
                            />
                            <AppText
                                variant="caption-xs"
                                className="font-bold uppercase tracking-wider text-text-primary"
                            >
                                Paid By
                            </AppText>
                        </View>
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            {formatExpenseMoney(paidDeclared, currency)} Declared
                        </AppText>
                    </View>

                    {paidBy.map((payer) => {
                        const isMe = viewerId != null && payer.id === viewerId;
                        return (
                            <View key={`paid-${payer.id}`} className="gap-y-2">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-2 min-w-0 flex-1 pr-2">
                                        <Avatar
                                            name={payer.name}
                                            avatarId={payer.avatar?.id}
                                            avatarUrl={payer.avatar?.url}
                                        />
                                        <AppText
                                            variant="body-xs"
                                            className="font-bold text-text-primary"
                                            numberOfLines={1}
                                        >
                                            {isMe ? `${payer.name} (You)` : payer.name}
                                        </AppText>
                                    </View>
                                    <AppText
                                        variant="body-xs"
                                        className="font-bold text-text-primary"
                                    >
                                        {formatExpenseMoney(payer.amount, currency)}
                                    </AppText>
                                </View>

                                {isMe && isViewerPayer ? (
                                    <View className="gap-y-1">
                                        <View className="flex-row justify-between">
                                            <AppText
                                                variant="caption-xs"
                                                className="text-text-primary-lighter"
                                            >
                                                Payment Cover
                                            </AppText>
                                            <AppText
                                                variant="caption-xs"
                                                className={
                                                    coverPct >= 99.5
                                                        ? 'text-green-increase font-bold'
                                                        : 'text-accent-sky'
                                                }
                                            >
                                                {coverPct.toFixed(0)}% Covered (
                                                {formatExpenseMoney(coverTotal, currency)})
                                            </AppText>
                                        </View>
                                        <View className="h-1.5 rounded-full overflow-hidden bg-bg-primary border border-border-input">
                                            <View
                                                style={{
                                                    width: `${coverPct}%`,
                                                    height: '100%',
                                                    backgroundColor: colors.accent.sky,
                                                    borderRadius: 999,
                                                }}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        );
                    })}

                    {isViewerPayer ? (
                        <View className="pt-3 border-t border-border-input gap-y-2">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-1">
                                    <Iconify
                                        icon="heroicons:arrows-right-left"
                                        size={12}
                                        color={colors.accent.sky}
                                    />
                                    <AppText
                                        variant="caption-xs"
                                        className="font-bold uppercase tracking-wider text-text-primary-lighter"
                                    >
                                        Linked Payment Cover
                                    </AppText>
                                </View>
                                <AppText
                                    variant="caption-xs"
                                    className="font-semibold text-accent-sky"
                                >
                                    {paymentLinks.length} Transfer
                                    {paymentLinks.length === 1 ? '' : 's'}
                                </AppText>
                            </View>

                            {paymentLinks.length === 0 ? (
                                <AppText
                                    variant="caption-xs"
                                    className="text-text-primary-lighter"
                                >
                                    No payment links covering your payout yet.
                                </AppText>
                            ) : (
                                paymentLinks.map((link) => (
                                    <View
                                        key={link.id}
                                        className="rounded-xl border border-border-input bg-bg-primary p-2.5 flex-row items-center justify-between"
                                    >
                                        <View className="min-w-0 flex-1 pr-2">
                                            <View className="flex-row items-center gap-1.5">
                                                <AppText
                                                    variant="caption-xs"
                                                    className="font-semibold text-text-primary"
                                                    numberOfLines={1}
                                                >
                                                    Transfer #{link.transfer_id}
                                                </AppText>
                                                <View className="rounded border border-accent-sky bg-accent-sky-bg px-1.5">
                                                    <AppText
                                                        variant="caption-xs"
                                                        className="text-[9px] font-bold text-accent-sky"
                                                    >
                                                        PAYOUT
                                                    </AppText>
                                                </View>
                                            </View>
                                            <AppText
                                                variant="caption-xs"
                                                className="text-text-primary-lighter mt-0.5"
                                            >
                                                Covers your paid-by row
                                            </AppText>
                                        </View>
                                        <AppText
                                            variant="caption-xs"
                                            className="font-bold text-accent-sky"
                                        >
                                            {formatExpenseMoney(
                                                link.covered_amount ?? link.amount_inr,
                                                link.transfer_currency ?? currency,
                                            )}
                                        </AppText>
                                    </View>
                                ))
                            )}
                        </View>
                    ) : null}
                </View>
            ) : null}

            {sharers.length > 0 ? (
                <View
                    className="gap-y-2 rounded-3xl border p-4"
                    style={{
                        backgroundColor: colors.bg.lighter,
                        borderColor: colors.status.border,
                        shadowColor: COLORS.light.brand.primary,
                        shadowOpacity: isDark ? 0.35 : 0.08,
                        shadowRadius: 12,
                        shadowOffset: {width: 0, height: 4},
                        elevation: 3,
                    }}
                >
                    <View className="flex-row items-center justify-between border-b border-border-input pb-2">
                        <View className="flex-row items-center gap-1.5">
                            <Iconify
                                icon="heroicons:users"
                                size={14}
                                color={colors.accent.orbIndigo}
                            />
                            <AppText
                                variant="caption-xs"
                                className="font-bold uppercase tracking-wider text-text-primary"
                            >
                                Sharers
                            </AppText>
                        </View>
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            {sharers.length} Share{sharers.length === 1 ? '' : 's'}
                        </AppText>
                    </View>

                    {sharers.map((sharer) => {
                        const paidRow = paidBy.find((p) => p.id === sharer.id);
                        const net = (paidRow?.amount ?? 0) - sharer.amount;
                        const isMe = viewerId != null && sharer.id === viewerId;
                        return (
                            <View
                                key={`share-${sharer.id}`}
                                className="rounded-xl border border-border-input bg-bg-primary p-2.5 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center gap-2 min-w-0 flex-1 pr-2">
                                    <Avatar
                                        name={sharer.name}
                                        avatarId={sharer.avatar?.id}
                                        avatarUrl={sharer.avatar?.url}
                                        size={24}
                                    />
                                    <AppText
                                        variant="caption-xs"
                                        className="font-medium text-text-primary"
                                        numberOfLines={1}
                                    >
                                        {isMe ? `${sharer.name} (You)` : sharer.name}
                                    </AppText>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <AppText
                                        variant="caption-xs"
                                        className="text-text-primary-lighter"
                                    >
                                        Share: {formatExpenseMoney(sharer.amount, currency)}
                                    </AppText>
                                    {net > 0.005 ? (
                                        <AppText
                                            variant="caption-xs"
                                            className="font-bold text-green-increase"
                                        >
                                            +{formatExpenseMoney(net, currency)}
                                        </AppText>
                                    ) : net < -0.005 ? (
                                        <AppText
                                            variant="caption-xs"
                                            className="font-bold text-red-decrease"
                                        >
                                            owes {formatExpenseMoney(Math.abs(net), currency)}
                                        </AppText>
                                    ) : (
                                        <AppText
                                            variant="caption-xs"
                                            className="text-text-primary-lighter"
                                        >
                                            Even
                                        </AppText>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

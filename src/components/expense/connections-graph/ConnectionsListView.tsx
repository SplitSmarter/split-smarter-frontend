import React, {useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {PaymentLinkSummary} from '@/src/api/dto/expense/expense';
import type {PaymentLinkDetails} from '@/src/api/dto/expense/payment_link';
import {buildItemColorMap} from '@/src/components/expense/connections-graph/itemColors';
import type {ConnectionsEditTarget} from '@/src/components/expense/connections-graph/ConnectionsEditChooserModal';
import {
    personKeyOf,
    type ExpenseSplitGraphData,
} from '@/src/components/expense/connections-graph/types';

type LinkRow = PaymentLinkDetails | PaymentLinkSummary;

export type ConnectionsListViewProps = {
    data: ExpenseSplitGraphData;
    /** Highlight the current user in paid-by / split rows. */
    viewerId?: number | null;
    isViewerPayer?: boolean;
    paymentLinks?: LinkRow[];
    /** Always render Paid by / Items / Split between (empty placeholders when needed). */
    showAllSections?: boolean;
    /** Section header chevron → direct edit. */
    onEditSection?: (target: ConnectionsEditTarget) => void;
};

function money(symbol: string, amount: number) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
}

function PersonAvatar({
    name,
    url,
    size = 36,
}: {
    name: string;
    url?: string | null;
    size?: number;
}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    return (
        <View
            className="items-center justify-center overflow-hidden rounded-2xl border"
            style={{
                width: size,
                height: size,
                backgroundColor: colors.bg.primary,
                borderColor: colors.status.border,
            }}
        >
            <AppImageV2
                id={url ?? name}
                url={url ?? undefined}
                style={{width: '100%', height: '100%'}}
                contentFit="cover"
                fallbackComponent={
                    <EntityFallbackIcon
                        kind="user"
                        size={size * 0.42}
                        color={colors.icon.lighter}
                    />
                }
            />
        </View>
    );
}

function SectionLabel({
    title,
    meta,
    accent,
    onPress,
}: {
    title: string;
    meta?: string;
    accent: string;
    onPress?: () => void;
}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const body = (
        <>
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <View
                    className="h-1.5 w-1.5 rounded-full"
                    style={{backgroundColor: accent}}
                />
                <AppText
                    variant="caption-xs"
                    className="font-bold uppercase tracking-wider"
                    style={{color: colors.text.lighter}}
                >
                    {title}
                </AppText>
            </View>
            <View className="flex-row items-center gap-1">
                {meta ? (
                    <AppText
                        variant="caption-xs"
                        className="font-semibold"
                        style={{color: colors.text.lighter}}
                    >
                        {meta}
                    </AppText>
                ) : null}
                {onPress ? (
                    <Iconify
                        icon="heroicons:chevron-right"
                        size={16}
                        color={colors.icon.primary}
                    />
                ) : null}
            </View>
        </>
    );

    if (onPress) {
        return (
            <Pressable
                className="mb-2 mt-1 flex-row items-center justify-between active:opacity-70"
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${title}`}
            >
                {body}
            </Pressable>
        );
    }

    return (
        <View className="mb-2 mt-1 flex-row items-center justify-between">{body}</View>
    );
}

function EmptySectionBody({message}: {message: string}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    return (
        <View
            className="overflow-hidden rounded-2xl border px-3.5 py-4"
            style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.status.border,
            }}
        >
            <AppText variant="caption-xs" style={{color: colors.text.lighter}}>
                {message}
            </AppText>
        </View>
    );
}

/**
 * Flat list for Connections (paid-by / split / items) — sits inside ExpenseSplitGraph.
 */
export function ConnectionsListView({
    data,
    viewerId = null,
    isViewerPayer = false,
    paymentLinks = [],
    showAllSections = false,
    onEditSection,
}: ConnectionsListViewProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const sym = data.currencySymbol;

    const itemColors = useMemo(
        () => buildItemColorMap(
            data.items.map((i) => i.id),
            isDark,
        ),
        [data.items, isDark],
    );

    const splitByKey = useMemo(() => {
        const map = new Map<string, (typeof data.splitUsers)[number]>();
        for (const u of data.splitUsers) map.set(personKeyOf(u), u);
        return map;
    }, [data.splitUsers]);

    const paidByKey = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of data.payers) map.set(personKeyOf(p), p.amount);
        return map;
    }, [data.payers]);

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
        return (
            data.payers.find((p) => String(p.id) === String(viewerId))?.amount ?? 0
        );
    }, [data.payers, viewerId]);

    const coverPct =
        viewerPaidAmount > 0
            ? Math.min(100, (coverTotal / viewerPaidAmount) * 100)
            : 0;

    const paidTotal = data.payers.reduce((s, p) => s + p.amount, 0);

    if (
        !showAllSections &&
        data.payers.length === 0 &&
        data.splitUsers.length === 0 &&
        data.items.length === 0
    ) {
        return (
            <AppText variant="body-small" style={{color: colors.text.lighter}}>
                No connections yet.
            </AppText>
        );
    }

    const showPaidBy = showAllSections || data.payers.length > 0;
    const showItems = showAllSections || data.items.length > 0;
    const showSplit = showAllSections || data.splitUsers.length > 0;

    return (
        <View className="gap-y-4">
            {showPaidBy ? (
                <View>
                    <SectionLabel
                        title="Paid by"
                        meta={
                            data.payers.length > 0
                                ? money(sym, paidTotal)
                                : undefined
                        }
                        accent={colors.accent.sky}
                        onPress={
                            onEditSection
                                ? () => onEditSection('paidBy')
                                : undefined
                        }
                    />
                    {data.payers.length === 0 ? (
                        <EmptySectionBody message="No payers yet" />
                    ) : null}
                    {data.payers.length > 0 ? (
                    <View
                        className="overflow-hidden rounded-2xl border"
                        style={{
                            backgroundColor: colors.bg.primary,
                            borderColor: colors.status.border,
                        }}
                    >
                        {data.payers.map((payer, index) => {
                            const isMe =
                                viewerId != null &&
                                String(payer.id) === String(viewerId);
                            const isLast = index === data.payers.length - 1;
                            return (
                                <View
                                    key={`payer-${personKeyOf(payer)}`}
                                    className="px-3.5 py-3"
                                    style={
                                        isLast && !isViewerPayer
                                            ? undefined
                                            : {
                                                  borderBottomWidth: 1,
                                                  borderBottomColor: colors.status.border,
                                              }
                                    }
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-2">
                                            <PersonAvatar
                                                name={payer.name}
                                                url={payer.avatarUrl}
                                            />
                                            <View className="min-w-0 flex-1">
                                                <AppText
                                                    variant="body-small"
                                                    className="font-semibold"
                                                    style={{color: colors.text.primary}}
                                                    numberOfLines={1}
                                                >
                                                    {isMe ? `${payer.name} (You)` : payer.name}
                                                </AppText>
                                                <AppText
                                                    variant="caption-xs"
                                                    className="mt-0.5"
                                                    style={{color: colors.text.lighter}}
                                                >
                                                    Payer
                                                </AppText>
                                            </View>
                                        </View>
                                        <AppText
                                            variant="body-small"
                                            className="font-bold"
                                            style={{color: colors.text.primary}}
                                        >
                                            {money(sym, payer.amount)}
                                        </AppText>
                                    </View>

                                    {isMe && isViewerPayer && coverTotal > 0.005 ? (
                                        <View className="mt-2.5 gap-y-1.5">
                                            <View className="flex-row items-center justify-between">
                                                <AppText
                                                    variant="caption-xs"
                                                    style={{color: colors.text.lighter}}
                                                >
                                                    Payment cover
                                                </AppText>
                                                <AppText
                                                    variant="caption-xs"
                                                    className="font-bold"
                                                    style={{
                                                        color:
                                                            coverPct >= 99.5
                                                                ? colors.status.success
                                                                : colors.accent.sky,
                                                    }}
                                                >
                                                    {coverPct.toFixed(0)}% ·{' '}
                                                    {money(sym, coverTotal)}
                                                </AppText>
                                            </View>
                                            <View
                                                className="h-1.5 overflow-hidden rounded-full"
                                                style={{
                                                    backgroundColor: colors.bg.darker,
                                                }}
                                            >
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${coverPct}%`,
                                                        backgroundColor: colors.accent.sky,
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    ) : null}
                                </View>
                            );
                        })}

                        {isViewerPayer ? (
                            <View className="gap-y-2 px-3.5 py-3">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-1.5">
                                        <Iconify
                                            icon="heroicons:arrows-right-left"
                                            size={12}
                                            color={colors.accent.sky}
                                        />
                                        <AppText
                                            variant="caption-xs"
                                            className="font-bold uppercase tracking-wider"
                                            style={{color: colors.text.lighter}}
                                        >
                                            Linked cover
                                        </AppText>
                                    </View>
                                    <AppText
                                        variant="caption-xs"
                                        className="font-semibold"
                                        style={{color: colors.accent.sky}}
                                    >
                                        {paymentLinks.length} transfer
                                        {paymentLinks.length === 1 ? '' : 's'}
                                    </AppText>
                                </View>

                                {paymentLinks.length === 0 ? (
                                    <AppText
                                        variant="caption-xs"
                                        style={{color: colors.text.lighter}}
                                    >
                                        No payment links covering your payout yet.
                                    </AppText>
                                ) : (
                                    paymentLinks.map((link) => (
                                        <View
                                            key={link.id}
                                            className="flex-row items-center justify-between rounded-xl border px-3 py-2"
                                            style={{
                                                backgroundColor: colors.bg.lighter,
                                                borderColor: colors.status.border,
                                            }}
                                        >
                                            <View className="min-w-0 flex-1 pr-2">
                                                <AppText
                                                    variant="caption-xs"
                                                    className="font-semibold"
                                                    style={{color: colors.text.primary}}
                                                    numberOfLines={1}
                                                >
                                                    Transfer #{link.transfer_id}
                                                </AppText>
                                                <AppText
                                                    variant="caption-xs"
                                                    className="mt-0.5"
                                                    style={{color: colors.text.lighter}}
                                                >
                                                    Covers your paid-by row
                                                </AppText>
                                            </View>
                                            <AppText
                                                variant="caption-xs"
                                                className="font-bold"
                                                style={{color: colors.accent.sky}}
                                            >
                                                {money(
                                                    sym,
                                                    link.covered_amount ??
                                                        link.amount_inr ??
                                                        0,
                                                )}
                                            </AppText>
                                        </View>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>
                    ) : null}
                </View>
            ) : null}

            {showItems ? (
                <View>
                    <SectionLabel
                        title="Items"
                        meta={
                            data.items.length > 0
                                ? `${data.items.length} item${
                                      data.items.length === 1 ? '' : 's'
                                  }`
                                : undefined
                        }
                        accent={colors.accent.teal}
                        onPress={
                            onEditSection
                                ? () => onEditSection('assignItems')
                                : undefined
                        }
                    />
                    {data.items.length === 0 ? (
                        <EmptySectionBody message="No items yet — default item may apply" />
                    ) : (
                    <View
                        className="overflow-hidden rounded-2xl border"
                        style={{
                            backgroundColor: colors.bg.primary,
                            borderColor: colors.status.border,
                        }}
                    >
                        {data.items.map((item, index) => {
                            const tint = itemColors[item.id];
                            const assigneeNames =
                                item.assigneeIds.length === 0
                                    ? 'Everyone'
                                    : item.assigneeIds
                                          .map((id) => splitByKey.get(id)?.name)
                                          .filter(Boolean)
                                          .join(', ') || '—';
                            const isLast = index === data.items.length - 1;
                            return (
                                <View
                                    key={`item-${item.id}`}
                                    className="flex-row items-center justify-between px-3.5 py-3"
                                    style={
                                        isLast
                                            ? undefined
                                            : {
                                                  borderBottomWidth: 1,
                                                  borderBottomColor: colors.status.border,
                                              }
                                    }
                                >
                                    <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-2">
                                        <View
                                            className="h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border"
                                            style={{
                                                backgroundColor:
                                                    tint?.fill ?? colors.bg.lighter,
                                                borderColor:
                                                    tint?.stroke ?? colors.status.border,
                                            }}
                                        >
                                            {item.iconUrl ? (
                                                <AppImageV2
                                                    id={item.id}
                                                    url={item.iconUrl}
                                                    style={{width: '70%', height: '70%'}}
                                                    contentFit="contain"
                                                    fallbackComponent={
                                                        <EntityFallbackIcon
                                                            kind="expenseItem"
                                                            size={16}
                                                            color={
                                                                tint?.stroke ??
                                                                colors.icon.lighter
                                                            }
                                                        />
                                                    }
                                                />
                                            ) : (
                                                <EntityFallbackIcon
                                                    kind="expenseItem"
                                                    size={16}
                                                    color={
                                                        tint?.stroke ?? colors.icon.lighter
                                                    }
                                                />
                                            )}
                                        </View>
                                        <View className="min-w-0 flex-1">
                                            <AppText
                                                variant="body-small"
                                                className="font-semibold"
                                                style={{color: colors.text.primary}}
                                                numberOfLines={2}
                                            >
                                                {item.title}
                                            </AppText>
                                            <AppText
                                                variant="caption-xs"
                                                className="mt-0.5"
                                                style={{color: colors.text.lighter}}
                                                numberOfLines={1}
                                            >
                                                Shared by {assigneeNames}
                                            </AppText>
                                        </View>
                                    </View>
                                    <AppText
                                        variant="body-small"
                                        className="font-bold"
                                        style={{color: colors.text.primary}}
                                    >
                                        {money(sym, item.amount)}
                                    </AppText>
                                </View>
                            );
                        })}
                    </View>
                    )}
                </View>
            ) : null}

            {showSplit ? (
                <View>
                    <SectionLabel
                        title="Split between"
                        meta={
                            data.splitUsers.length > 0
                                ? `${data.splitUsers.length} ${
                                      data.splitUsers.length === 1 ? 'person' : 'people'
                                  }`
                                : undefined
                        }
                        accent={colors.accent.orbIndigo}
                        onPress={
                            onEditSection
                                ? () => onEditSection('split')
                                : undefined
                        }
                    />
                    {data.splitUsers.length === 0 ? (
                        <EmptySectionBody message="Nobody selected for the split" />
                    ) : (
                    <View
                        className="overflow-hidden rounded-2xl border"
                        style={{
                            backgroundColor: colors.bg.primary,
                            borderColor: colors.status.border,
                        }}
                    >
                        {data.splitUsers.map((sharer, index) => {
                            const key = personKeyOf(sharer);
                            const paid = paidByKey.get(key) ?? 0;
                            const net = paid - sharer.amount;
                            const isMe =
                                viewerId != null &&
                                String(sharer.id) === String(viewerId);
                            const isLast = index === data.splitUsers.length - 1;

                            let statusLabel = 'Even';
                            let statusColor = colors.text.lighter;
                            if (net > 0.005) {
                                statusLabel = `+${money(sym, net)}`;
                                statusColor = colors.status.success;
                            } else if (net < -0.005) {
                                statusLabel = `owes ${money(sym, Math.abs(net))}`;
                                statusColor = colors.status.decrease;
                            }

                            return (
                                <View
                                    key={`split-${key}`}
                                    className="flex-row items-center justify-between px-3.5 py-3"
                                    style={
                                        isLast
                                            ? undefined
                                            : {
                                                  borderBottomWidth: 1,
                                                  borderBottomColor: colors.status.border,
                                              }
                                    }
                                >
                                    <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-2">
                                        <PersonAvatar
                                            name={sharer.name}
                                            url={sharer.avatarUrl}
                                        />
                                        <View className="min-w-0 flex-1">
                                            <AppText
                                                variant="body-small"
                                                className="font-semibold"
                                                style={{color: colors.text.primary}}
                                                numberOfLines={1}
                                            >
                                                {isMe
                                                    ? `${sharer.name} (You)`
                                                    : sharer.name}
                                            </AppText>
                                            <AppText
                                                variant="caption-xs"
                                                className="mt-0.5"
                                                style={{color: colors.text.lighter}}
                                            >
                                                Share {money(sym, sharer.amount)}
                                            </AppText>
                                        </View>
                                    </View>
                                    <AppText
                                        variant="caption-xs"
                                        className="font-bold"
                                        style={{color: statusColor}}
                                    >
                                        {statusLabel}
                                    </AppText>
                                </View>
                            );
                        })}
                    </View>
                    )}
                </View>
            ) : null}
        </View>
    );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { COLORS } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';
import { useNodeLayouts } from './useNodeLayouts';
import {
    itemNodeId,
    payerNodeId,
    personKeyOf,
    splitNodeId,
    type ExpenseSplitGraphData,
    type GraphColumn,
    type GraphEdge,
    type GraphSelection,
} from './types';
import {
    computeGraphViewState,
    selectionCaption,
} from './computeHighlight';
import { buildItemColorMap } from './itemColors';
import { ConnectionLayer } from './ConnectionLayer';
import {
    ConnectionsEditChooserModal,
    type ConnectionsEditTarget,
} from './ConnectionsEditChooserModal';
import { ConnectionsHelpModal } from './ConnectionsHelpModal';
import { GraphNodeChip } from './GraphNodeChip';
import { useRegisterOverlayDismiss } from '@/src/hooks/useBackDismissStack';

const COLUMN_GAP = 20;
/** Floor so a single short column still has room for SVG paths. */
const GRAPH_MIN_HEIGHT = 72;

function formatAmount(symbol: string, amount: number) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
}

function firstName(name: string) {
    return name.split(' ')[0] ?? name;
}

export type ConnectionsViewMode = 'list' | 'graph';

export interface ExpenseSplitGraphProps {
    data: ExpenseSplitGraphData;
    onEditTarget?: (target: ConnectionsEditTarget) => void;
    /** When set, header shows a list/graph toggle (before edit). */
    listContent?: React.ReactNode;
    /** Initial mode when `listContent` is provided. Defaults to graph. */
    initialViewMode?: ConnectionsViewMode;
}

export function ExpenseSplitGraph({
    data,
    onEditTarget,
    listContent,
    initialViewMode = 'graph',
}: ExpenseSplitGraphProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const [selection, setSelection] = useState<GraphSelection | null>(null);
    const [helpVisible, setHelpVisible] = useState(false);
    const [editChooserVisible, setEditChooserVisible] = useState(false);
    const [viewMode, setViewMode] = useState<ConnectionsViewMode>(initialViewMode);
    const canToggleView = listContent != null;
    const showGraph = !canToggleView || viewMode === 'graph';

    useRegisterOverlayDismiss(helpVisible, () => setHelpVisible(false));
    useRegisterOverlayDismiss(editChooserVisible, () => setEditChooserVisible(false));

    useEffect(() => {
        if (!showGraph) setSelection(null);
    }, [showGraph]);

    const dataFingerprint = useMemo(
        () =>
            JSON.stringify({
                t: data.totalAmount,
                i: data.items.map((x) => `${x.id}:${x.amount}:${x.assigneeIds.join(',')}`),
                p: data.payers.map((x) => `${personKeyOf(x)}:${x.amount}`),
                s: data.splitUsers.map((x) => `${personKeyOf(x)}:${x.amount}`),
            }),
        [data],
    );

    // Clear highlight when draft amounts / membership change
    useEffect(() => {
        setSelection(null);
    }, [dataFingerprint]);

    const {
        containerRef,
        layouts,
        containerSize,
        onContainerLayout,
        bindNodeRef,
        onNodeLayout,
        resetLayouts,
    } = useNodeLayouts();

    // Remeasure links when membership / amounts change (height expands or contracts).
    useEffect(() => {
        resetLayouts();
    }, [dataFingerprint, resetLayouts]);

    const viewState = useMemo(
        () => computeGraphViewState(data, selection),
        [data, selection],
    );
    const { highlight, displayAmounts } = viewState;

    const maxEdgeAmount = useMemo(() => {
        let max = 0;
        for (const edge of data.edges) {
            if (edge.amount != null && edge.amount > max) max = edge.amount;
        }
        return max || 1;
    }, [data.edges]);

    const itemColors = useMemo(
        () =>
            buildItemColorMap(
                data.items.map((i) => i.id),
                isDark,
            ),
        [data.items, isDark],
    );

    const toggle = useCallback((column: GraphColumn, id: string) => {
        setSelection((prev) => {
            if (prev && prev.column === column && prev.id === id) return null;
            return { column, id };
        });
    }, []);

    const isSelected = (column: GraphColumn, id: string) =>
        selection?.column === column && selection.id === id;

    const isDimmed = (nodeKey: string) => {
        if (!highlight) return false;
        return !highlight.nodeIds.has(nodeKey);
    };

    const isHighlighted = (nodeKey: string) => {
        if (!highlight) return false;
        return highlight.nodeIds.has(nodeKey);
    };

    const resolveAmount = (nodeKey: string, lifetime: number) =>
        displayAmounts[nodeKey] ?? lifetime;

    const isAmountContextual = (
        nodeKey: string,
        lifetime: number,
        kind: 'person' | 'item',
    ) => {
        if (!selection || !highlight?.nodeIds.has(nodeKey)) return false;
        if (kind === 'item' && (selection.column === 'payer' || selection.column === 'split')) {
            return true;
        }
        if (nodeKey in displayAmounts && displayAmounts[nodeKey] !== lifetime) {
            return true;
        }
        return nodeKey in displayAmounts && selection.column !== 'item';
    };

    const getEndpoints = useCallback((edge: GraphEdge) => {
        if (edge.kind === 'payer-to-item') {
            return { fromSide: 'right' as const, toSide: 'left' as const };
        }
        return { fromSide: 'right' as const, toSide: 'left' as const };
    }, []);

    const { currencySymbol: sym } = data;
    const hasFlippedAmounts = selection != null && Object.keys(displayAmounts).length > 0;
    const caption = selection ? selectionCaption(data, selection) : null;

    const isEmpty =
        data.items.length === 0 && data.payers.length === 0 && data.splitUsers.length === 0;

    return (
        <View
            className="rounded-3xl border p-4"
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
            <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                    <AppText
                        variant="h4"
                        className="font-bold"
                        style={{ color: colors.text.primary }}
                    >
                        Connections
                    </AppText>
                    {showGraph ? (
                        <Pressable
                            onPress={() => setHelpVisible(true)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel="How Connections works"
                        >
                            <Iconify
                                icon="heroicons:information-circle"
                                size={20}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    ) : null}
                </View>
                <View className="flex-row items-center gap-2">
                    {canToggleView ? (
                        <Pressable
                            onPress={() =>
                                setViewMode((prev) => (prev === 'graph' ? 'list' : 'graph'))
                            }
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={
                                showGraph
                                    ? 'Switch to list view'
                                    : 'Switch to graph view'
                            }
                        >
                            {showGraph ? (
                                <Iconify
                                    icon="heroicons:queue-list"
                                    size={20}
                                    color={colors.icon.primary}
                                />
                            ) : (
                                <Iconify
                                    icon="heroicons:share"
                                    size={20}
                                    color={colors.icon.primary}
                                />
                            )}
                        </Pressable>
                    ) : null}
                    {onEditTarget ? (
                        <Pressable
                            onPress={() => setEditChooserVisible(true)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel="Edit Connections section"
                        >
                            <Iconify
                                icon="heroicons:pencil-square"
                                size={20}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    ) : null}
                </View>
            </View>

            <ConnectionsHelpModal
                visible={helpVisible}
                isDark={isDark}
                onClose={() => setHelpVisible(false)}
            />

            <ConnectionsEditChooserModal
                visible={editChooserVisible}
                isDark={isDark}
                onClose={() => setEditChooserVisible(false)}
                onSelect={(target) => {
                    onEditTarget?.(target);
                }}
            />

            {showGraph ? (
                <AppText variant="caption-xs" className="mb-3 text-text-primary-lighter">
                    {data.title} · tap a chip to trace the path
                </AppText>
            ) : (
                <AppText variant="caption-xs" className="mb-3 text-text-primary-lighter">
                    {data.title} · paid by, split, and items
                </AppText>
            )}

            {!showGraph ? (
                <View className="gap-3">{listContent}</View>
            ) : isEmpty ? (
                <AppText variant="body-small" className="py-6 text-center text-text-primary-lighter">
                    Add payers, items, or split participants to see connections
                </AppText>
            ) : (
                <>
                    <View className="mb-2 flex-row" style={{ gap: COLUMN_GAP }}>
                        {(
                            [
                                {
                                    column: 'payer' as const,
                                    label: 'Paid by',
                                    editTarget: 'paidBy' as ConnectionsEditTarget,
                                },
                                {
                                    column: 'item' as const,
                                    label: 'Items',
                                    editTarget: 'assignItems' as ConnectionsEditTarget,
                                },
                                {
                                    column: 'split' as const,
                                    label: 'Split between',
                                    editTarget: 'split' as ConnectionsEditTarget,
                                },
                            ] as const
                        ).map(({ column, label, editTarget }) => {
                            const active = selection?.column === column;
                            const onPath =
                                !!highlight &&
                                (column === 'item'
                                    ? data.items.some((i) =>
                                          highlight.nodeIds.has(itemNodeId(i.id)),
                                      )
                                    : column === 'payer'
                                      ? data.payers.some((p) =>
                                            highlight.nodeIds.has(
                                                payerNodeId(personKeyOf(p)),
                                            ),
                                        )
                                      : data.splitUsers.some((u) =>
                                            highlight.nodeIds.has(
                                                splitNodeId(personKeyOf(u)),
                                            ),
                                        ));
                            const labelClass = `uppercase tracking-wide ${
                                active
                                    ? 'font-bold text-accent-sky'
                                    : onPath
                                      ? 'font-semibold text-text-primary'
                                      : selection
                                        ? 'text-text-primary-lighter opacity-50'
                                        : 'text-text-primary-lighter'
                            }`;
                            const chevronColor = active
                                ? colors.accent.sky
                                : colors.icon.lighter;

                            if (onEditTarget) {
                                return (
                                    <Pressable
                                        key={column}
                                        className="flex-1 flex-row items-center gap-0.5 active:opacity-70"
                                        onPress={() => onEditTarget(editTarget)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Edit ${label}`}
                                    >
                                        <AppText
                                            variant="caption-xs"
                                            className={`min-w-0 flex-shrink ${labelClass}`}
                                            numberOfLines={1}
                                        >
                                            {label}
                                        </AppText>
                                        <Iconify
                                            icon="heroicons:chevron-right"
                                            size={14}
                                            color={chevronColor}
                                        />
                                    </Pressable>
                                );
                            }

                            return (
                                <View key={column} className="flex-1">
                                    <AppText
                                        variant="caption-xs"
                                        className={labelClass}
                                    >
                                        {label}
                                    </AppText>
                                </View>
                            );
                        })}
                    </View>

                    <View
                        ref={containerRef}
                        onLayout={onContainerLayout}
                        className="relative"
                        style={{ minHeight: GRAPH_MIN_HEIGHT }}
                    >
                        <ConnectionLayer
                            edges={data.edges}
                            layouts={layouts}
                            width={containerSize.width}
                            height={Math.max(containerSize.height, GRAPH_MIN_HEIGHT)}
                            highlight={highlight}
                            activeStroke={colors.accent.sky}
                            idleStroke={isDark ? '#64748B' : '#94A3B8'}
                            itemColors={itemColors}
                            maxEdgeAmount={maxEdgeAmount}
                            getEndpoints={getEndpoints}
                        />

                        <View
                            className="flex-row items-start"
                            style={{ gap: COLUMN_GAP }}
                            pointerEvents="box-none"
                        >
                            <View className="flex-1" pointerEvents="box-none">
                                {data.payers.map((payer) => {
                                    const personKey = personKeyOf(payer);
                                    const key = payerNodeId(personKey);
                                    const amount = resolveAmount(key, payer.amount);
                                    return (
                                        <GraphNodeChip
                                            key={key}
                                            kind="person"
                                            title={firstName(payer.name)}
                                            amountLabel={formatAmount(sym, amount)}
                                            imageUrl={payer.avatarUrl}
                                            selected={isSelected('payer', personKey)}
                                            highlighted={
                                                !isSelected('payer', personKey) &&
                                                isHighlighted(key)
                                            }
                                            dimmed={isDimmed(key)}
                                            isDark={isDark}
                                            amountIsContextual={isAmountContextual(
                                                key,
                                                payer.amount,
                                                'person',
                                            )}
                                            onPress={() => toggle('payer', personKey)}
                                            bindRef={bindNodeRef(key)}
                                            onLayout={onNodeLayout(key)}
                                        />
                                    );
                                })}
                            </View>

                            <View className="flex-1" pointerEvents="box-none">
                                {data.items.map((item) => {
                                    const key = itemNodeId(item.id);
                                    const selected = isSelected('item', item.id);
                                    const amount = resolveAmount(key, item.amount);
                                    return (
                                        <GraphNodeChip
                                            key={key}
                                            kind="item"
                                            title={item.title}
                                            amountLabel={formatAmount(sym, amount)}
                                            imageUrl={item.iconUrl}
                                            selected={selected}
                                            highlighted={!selected && isHighlighted(key)}
                                            dimmed={isDimmed(key)}
                                            isDark={isDark}
                                            itemColor={itemColors[item.id]}
                                            amountIsContextual={isAmountContextual(
                                                key,
                                                item.amount,
                                                'item',
                                            )}
                                            onPress={() => toggle('item', item.id)}
                                            bindRef={bindNodeRef(key)}
                                            onLayout={onNodeLayout(key)}
                                        />
                                    );
                                })}
                            </View>

                            <View className="flex-1" pointerEvents="box-none">
                                {data.splitUsers.map((user) => {
                                    const personKey = personKeyOf(user);
                                    const key = splitNodeId(personKey);
                                    const amount = resolveAmount(key, user.amount);
                                    return (
                                        <GraphNodeChip
                                            key={key}
                                            kind="person"
                                            title={firstName(user.name)}
                                            amountLabel={formatAmount(sym, amount)}
                                            imageUrl={user.avatarUrl}
                                            selected={isSelected('split', personKey)}
                                            highlighted={
                                                !isSelected('split', personKey) &&
                                                isHighlighted(key)
                                            }
                                            dimmed={isDimmed(key)}
                                            isDark={isDark}
                                            amountIsContextual={isAmountContextual(
                                                key,
                                                user.amount,
                                                'person',
                                            )}
                                            onPress={() => toggle('split', personKey)}
                                            bindRef={bindNodeRef(key)}
                                            onLayout={onNodeLayout(key)}
                                        />
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </>
            )}

            {showGraph ? (
                <View className="mt-3 border-t border-border-input pt-2">
                    {hasFlippedAmounts ? (
                        <AppText variant="caption-xs" className="text-text-primary">
                            {caption
                                ? `${caption} · amounts show highlighted path only`
                                : 'Amounts show the highlighted path only · tap again to clear'}
                        </AppText>
                    ) : caption ? (
                        <AppText variant="caption-xs" className="text-text-primary">
                            {caption}
                        </AppText>
                    ) : (
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            Solid = assigned · Dashed = pooled share
                        </AppText>
                    )}
                </View>
            ) : null}
        </View>
    );
}

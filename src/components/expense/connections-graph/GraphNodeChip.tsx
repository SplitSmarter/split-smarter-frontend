import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { COLORS } from '@/src/constants/colors';
import type { ItemColor } from './itemColors';

type NodeKind = 'person' | 'item';

interface GraphNodeChipProps {
    kind: NodeKind;
    title: string;
    amountLabel: string;
    imageUrl?: string | null;
    selected: boolean;
    /** True when this node is on the active highlight path (e.g. item lit via payer). */
    highlighted?: boolean;
    dimmed: boolean;
    isDark: boolean;
    /** Per-item identity color (items only). */
    itemColor?: ItemColor;
    /** Amount is path-relevant (not lifetime total). */
    amountIsContextual?: boolean;
    onPress: () => void;
    bindRef: (ref: View | null) => void;
    onLayout: () => void;
}

export function GraphNodeChip({
    kind,
    title,
    amountLabel,
    imageUrl,
    selected,
    highlighted = false,
    dimmed,
    isDark,
    itemColor,
    amountIsContextual = false,
    onPress,
    bindRef,
    onLayout,
}: GraphNodeChipProps) {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const fallbackKind = kind === 'person' ? 'user' : 'expenseItem';
    const emphasis = selected || highlighted;

    const borderColor = (() => {
        if (kind === 'item' && itemColor && emphasis) return itemColor.stroke;
        if (selected) return colors.accent.sky;
        if (kind === 'item' && itemColor) return itemColor.stroke;
        return colors.status.border;
    })();

    const backgroundColor = (() => {
        if (kind === 'item' && itemColor && emphasis) return itemColor.fill;
        if (selected) return isDark ? '#0C4A6E' : '#E0F2FE';
        return colors.bg.lighter;
    })();

    const titleColor = (() => {
        if (kind === 'item' && itemColor && emphasis) return itemColor.stroke;
        if (selected) return colors.accent.sky;
        return colors.text.primary;
    })();

    const amountColor = (() => {
        if (kind === 'item' && itemColor && emphasis) return itemColor.stroke;
        if (selected) return colors.accent.sky;
        return colors.status.success;
    })();

    const iconColor =
        kind === 'item' && itemColor
            ? itemColor.stroke
            : selected
              ? colors.accent.sky
              : colors.icon.lighter;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className="mb-3"
        >
            <View
                ref={bindRef}
                onLayout={onLayout}
                className="overflow-hidden rounded-xl border px-2.5 py-2.5"
                style={{
                    opacity: dimmed ? 0.28 : 1,
                    borderColor,
                    backgroundColor,
                    borderWidth: kind === 'item' && itemColor ? 1.5 : 1,
                }}
            >
                {kind === 'item' && itemColor ? (
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: itemColor.stroke,
                        }}
                    />
                ) : null}

                <View className="flex-row items-center gap-1.5">
                    <View
                        className="items-center justify-center overflow-hidden rounded-full"
                        style={{
                            width: 22,
                            height: 22,
                            backgroundColor: colors.bg.darker,
                        }}
                    >
                        <AppImageV2
                            id={`graph-node-${kind}-${title}`}
                            url={imageUrl}
                            style={{ width: 22, height: 22 }}
                            className={kind === 'person' ? 'rounded-full' : undefined}
                            contentFit="cover"
                            fallbackComponent={
                                <EntityFallbackIcon
                                    kind={fallbackKind}
                                    size={11}
                                    color={iconColor}
                                />
                            }
                        />
                    </View>
                    <AppText
                        variant="caption-xs"
                        className={`flex-1 ${emphasis ? 'font-semibold' : ''}`}
                        style={{ color: titleColor }}
                        numberOfLines={1}
                    >
                        {title}
                    </AppText>
                </View>
                <AppText
                    variant="caption-xs"
                    className={`mt-0.5 ${amountIsContextual ? 'font-semibold' : ''}`}
                    style={{ color: amountColor }}
                    numberOfLines={1}
                >
                    {amountLabel}
                </AppText>
            </View>
        </Pressable>
    );
}

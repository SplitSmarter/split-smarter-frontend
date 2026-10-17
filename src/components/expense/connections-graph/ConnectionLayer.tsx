import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { GraphEdge, HighlightSet, NodeLayouts } from './types';
import type { ItemColor } from './itemColors';

interface ConnectionLayerProps {
    edges: GraphEdge[];
    layouts: NodeLayouts;
    width: number;
    height: number;
    highlight: HighlightSet | null;
    /** Fallback when an edge has no item color map entry. */
    activeStroke: string;
    idleStroke: string;
    itemColors: Record<string, ItemColor>;
    maxEdgeAmount: number;
    getEndpoints: (edge: GraphEdge) => {
        fromSide: 'left' | 'right';
        toSide: 'left' | 'right';
    };
}

function anchor(
    layout: { x: number; y: number; width: number; height: number },
    side: 'left' | 'right',
): { x: number; y: number } {
    return {
        x: side === 'left' ? layout.x : layout.x + layout.width,
        y: layout.y + layout.height / 2,
    };
}

function cubicPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.max(Math.abs(x2 - x1) * 0.5, 36);
    const cx1 = x1 + (x2 >= x1 ? dx : -dx);
    const cx2 = x2 - (x2 >= x1 ? dx : -dx);
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
}

function strokeForAmount(amount: number | undefined, maxAmount: number, active: boolean): number {
    const base = active ? 2.25 : 1.15;
    if (!amount || maxAmount <= 0) return base;
    const t = Math.min(1, amount / maxAmount);
    return base + t * (active ? 1.75 : 1.1);
}

export function ConnectionLayer({
    edges,
    layouts,
    width,
    height,
    highlight,
    activeStroke,
    idleStroke,
    itemColors,
    maxEdgeAmount,
    getEndpoints,
}: ConnectionLayerProps) {
    const paths = useMemo(() => {
        return edges
            .map((edge) => {
                const from = layouts[edge.fromId];
                const to = layouts[edge.toId];
                if (!from || !to) return null;

                const { fromSide, toSide } = getEndpoints(edge);
                const a = anchor(from, fromSide);
                const b = anchor(to, toSide);
                const d = cubicPath(a.x, a.y, b.x, b.y);
                const isActive = highlight ? highlight.edgeIds.has(edge.id) : false;
                const isIdle = !highlight;
                const itemStroke = itemColors[edge.itemId]?.stroke ?? activeStroke;

                return {
                    id: edge.id,
                    d,
                    isActive,
                    isIdle,
                    isPool: !!edge.isPool,
                    itemStroke,
                    strokeWidth: strokeForAmount(edge.amount, maxEdgeAmount, isActive || isIdle),
                };
            })
            .filter(Boolean) as Array<{
            id: string;
            d: string;
            isActive: boolean;
            isIdle: boolean;
            isPool: boolean;
            itemStroke: string;
            strokeWidth: number;
        }>;
    }, [edges, layouts, highlight, getEndpoints, maxEdgeAmount, itemColors, activeStroke]);

    if (width <= 0 || height <= 0) return null;

    return (
        <Svg
            width={width}
            height={height}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {paths.map((p) => {
                const dash = p.isPool ? '6 5' : undefined;

                if (!p.isIdle && !p.isActive) {
                    return (
                        <Path
                            key={p.id}
                            d={p.d}
                            fill="none"
                            stroke={idleStroke}
                            strokeWidth={1}
                            strokeOpacity={0.04}
                            strokeDasharray={dash}
                        />
                    );
                }

                const opacity = p.isActive ? 1 : p.isPool ? 0.1 : 0.12;

                return (
                    <Path
                        key={p.id}
                        d={p.d}
                        fill="none"
                        stroke={p.isActive ? p.itemStroke : idleStroke}
                        strokeWidth={
                            p.isActive ? p.strokeWidth : Math.max(1, p.strokeWidth * 0.65)
                        }
                        strokeOpacity={opacity}
                        strokeDasharray={dash}
                    />
                );
            })}
        </Svg>
    );
}

import { useCallback, useRef, useState } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';
import type { NodeLayout, NodeLayouts } from './types';

/**
 * Tracks chip layouts relative to a shared container so SVG links can connect
 * node midpoints across columns.
 */
export function useNodeLayouts() {
    const containerRef = useRef<View>(null);
    const nodeRefs = useRef<Record<string, View | null>>({});
    const [layouts, setLayouts] = useState<NodeLayouts>({});
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const setNodeLayout = useCallback((id: string, layout: NodeLayout) => {
        setLayouts((prev) => {
            const existing = prev[id];
            if (
                existing &&
                existing.x === layout.x &&
                existing.y === layout.y &&
                existing.width === layout.width &&
                existing.height === layout.height
            ) {
                return prev;
            }
            return { ...prev, [id]: layout };
        });
    }, []);

    const measureNode = useCallback(
        (id: string) => {
            const container = containerRef.current;
            const node = nodeRefs.current[id];
            if (!container || !node) return;

            container.measureInWindow((cx, cy) => {
                node.measureInWindow((nx, ny, nw, nh) => {
                    if (nw === 0 && nh === 0) return;
                    setNodeLayout(id, {
                        x: nx - cx,
                        y: ny - cy,
                        width: nw,
                        height: nh,
                    });
                });
            });
        },
        [setNodeLayout],
    );

    const measureNodeRef = useRef(measureNode);
    measureNodeRef.current = measureNode;

    const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setContainerSize({ width, height });
        requestAnimationFrame(() => {
            Object.keys(nodeRefs.current).forEach((id) => measureNodeRef.current(id));
        });
    }, []);

    const bindNodeRef = useCallback(
        (id: string) => (ref: View | null) => {
            nodeRefs.current[id] = ref;
        },
        [],
    );

    const onNodeLayout = useCallback(
        (id: string) => () => {
            requestAnimationFrame(() => measureNode(id));
        },
        [measureNode],
    );

    const resetLayouts = useCallback(() => {
        setLayouts({});
        requestAnimationFrame(() => {
            Object.keys(nodeRefs.current).forEach((id) => measureNodeRef.current(id));
        });
    }, []);

    return {
        containerRef,
        layouts,
        containerSize,
        onContainerLayout,
        bindNodeRef,
        onNodeLayout,
        resetLayouts,
    };
}

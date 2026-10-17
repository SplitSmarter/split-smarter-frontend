export const ITEM_COLOR_PALETTE = [
    { stroke: '#0D9488', fill: '#CCFBF1' },
    { stroke: '#D97706', fill: '#FEF3C7' },
    { stroke: '#7C3AED', fill: '#EDE9FE' },
    { stroke: '#E11D48', fill: '#FFE4E6' },
    { stroke: '#0284C7', fill: '#E0F2FE' },
] as const;

export const ITEM_COLOR_PALETTE_DARK = [
    { stroke: '#2DD4BF', fill: '#134E4A' },
    { stroke: '#FBBF24', fill: '#78350F' },
    { stroke: '#A78BFA', fill: '#4C1D95' },
    { stroke: '#FB7185', fill: '#881337' },
    { stroke: '#38BDF8', fill: '#0C4A6E' },
] as const;

export type ItemColor = { stroke: string; fill: string };

export function getItemColor(index: number, isDark: boolean): ItemColor {
    const palette = isDark ? ITEM_COLOR_PALETTE_DARK : ITEM_COLOR_PALETTE;
    return palette[index % palette.length];
}

export function buildItemColorMap(
    itemIds: string[],
    isDark: boolean,
): Record<string, ItemColor> {
    const map: Record<string, ItemColor> = {};
    itemIds.forEach((id, index) => {
        map[id] = getItemColor(index, isDark);
    });
    return map;
}

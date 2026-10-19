const COICOP_PREFIX = 'COICOP_';

export function stripCoicopPrefix(ref?: string | null): string | null {
    if (!ref) return null;
    const token = ref.trim();
    if (!token.startsWith(COICOP_PREFIX)) return null;
    const code = token.slice(COICOP_PREFIX.length).trim();
    return code.length > 0 ? code : null;
}

export function isCoicopRef(ref?: string | null): boolean {
    return stripCoicopPrefix(ref) != null;
}

/** Display code without COICOP_ prefix (e.g. 01.1). */
export function formatCategoryCode(ref?: string | null): string | null {
    return stripCoicopPrefix(ref);
}

/** True when childRef is the same code as parentRef or a deeper descendant. */
export function isCoicopCoveredBy(parentRef: string, childRef: string): boolean {
    const parent = stripCoicopPrefix(parentRef);
    const child = stripCoicopPrefix(childRef);
    if (parent == null || child == null) return false;
    return child === parent || child.startsWith(`${parent}.`);
}

export function coversDescendants(ref?: string | null): boolean {
    return isCoicopRef(ref);
}

/** COICOP 2018 max depth: division → group → class → subclass. */
export const COICOP_MAX_LEVEL = 4;

/** Depth from ref code (`01` → 1, `01.1.1.0` → 4) or null if not COICOP. */
export function coicopDepth(ref?: string | null): number | null {
    const code = stripCoicopPrefix(ref);
    if (!code) return null;
    return code.split('.').filter(Boolean).length;
}

/** True when this node can have children (not at subclass / max level). */
export function canDrillCoicop(
    ref?: string | null,
    level?: number | null,
): boolean {
    const depth = level ?? coicopDepth(ref);
    if (depth == null) return false;
    return depth < COICOP_MAX_LEVEL;
}

/** True when browsing / rendering the leaf (subclass) tier. */
export function isCoicopLeafLevel(level?: number | null): boolean {
    return (level ?? 0) >= COICOP_MAX_LEVEL;
}

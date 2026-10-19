import {coversDescendants, isCoicopCoveredBy} from '@/src/components/expense/multi-level-category/coicopRef';
import {MultiLevelCategorySelection} from '@/src/components/expense/multi-level-category/types';

export function toggleCategorySelection(
    prev: Record<number, MultiLevelCategorySelection>,
    item: MultiLevelCategorySelection,
): Record<number, MultiLevelCategorySelection> {
    const next = {...prev};

    if (next[item.id]) {
        delete next[item.id];
        return next;
    }

    const itemRef = item.categoryRef;
    if (itemRef) {
        // Already covered by a selected parent — ignore add.
        for (const selected of Object.values(next)) {
            if (
                selected.categoryRef &&
                selected.id !== item.id &&
                isCoicopCoveredBy(selected.categoryRef, itemRef) &&
                selected.categoryRef !== itemRef
            ) {
                return prev;
            }
        }

        // Drop children that this parent covers.
        for (const selected of Object.values(next)) {
            if (
                selected.categoryRef &&
                selected.id !== item.id &&
                isCoicopCoveredBy(itemRef, selected.categoryRef) &&
                selected.categoryRef !== itemRef
            ) {
                delete next[selected.id];
            }
        }
    }

    next[item.id] = {
        ...item,
        coversDescendants: coversDescendants(item.categoryRef),
    };
    return next;
}

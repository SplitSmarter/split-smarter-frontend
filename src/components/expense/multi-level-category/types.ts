export type MultiLevelCategorySelection = {
    id: number;
    name: string;
    categoryRef?: string | null;
    level?: number | null;
    iconId?: string | null;
    iconUrl?: string | null;
    coversDescendants: boolean;
};

export type BrowseStackEntry = {
    level: number;
    parentRef: string | null;
    title: string;
    /** Set when drilled into a node — lets the user select that parent while viewing children. */
    categoryId?: number | null;
    description?: string | null;
    sourceType?: string | null;
    iconId?: string | null;
    iconUrl?: string | null;
};

export interface Relationship {
    id: number;
    title: string;
    description?: string;
    type: string; // could be "DEFAULT" | "CUSTOM"
    created_at?: string | null;
}

export interface GetMyRelationshipsResponse {
    relationships: Relationship[];
    count: number;
    offset: number;
    limit: number;
}

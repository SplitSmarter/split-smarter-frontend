// Request payload
export interface AddCustomUserRequest {
    name: string;
    relationship_id: number;
}

// Response payload
export interface AddCustomUserResponse {
    id: number;
    name: string;
    relation: string;
    created_by_id: number;
}

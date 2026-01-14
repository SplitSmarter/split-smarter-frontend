// request
export interface SaveGroupCategoryRequest {
    title: string;
    description: string;
}

// response
export interface SaveGroupCategoryResponse {
    id: number;
    title: string;
    description: string;
    category_type: string;
    owner_id: number;
}

// request
export interface SaveGroupRequest {
    title: string;
    description: string;
    icon_host_type: string; // matches your ImageHostType enum
    icon_name?: string;
    icon_url?: string;
    icon_host?: string;
    background_image_host_type: string; // matches your ImageHostType enum
    background_image_name?: string;
    background_image_url?: string;
    background_image_host?: string;
    category_id: number;
}

// response
export interface SaveGroupResponse {
    group: {
        id: number;
        uuid: string;
        title: string;
        description: string | null;
        status: string;
        category: {
            id: number;
            title: string;
        };
        created_at: string;
    };
}

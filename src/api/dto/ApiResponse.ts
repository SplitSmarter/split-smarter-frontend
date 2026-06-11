// @/src/api/dto/ApiResponse.ts

export interface PaginationResponse {
    total: number;
    returned: number;
    offset: number;
    limit: number;
    total_pages?: number;
    current_page?: number;
    has_next?: boolean;
    has_previous?: boolean;
}

export interface SuccessResponse<T = any, M = any> {
    success: true;
    message: string;
    data: T;
    pagination?: PaginationResponse; // Added to match Python Generic
    meta?: M;
}

export interface ErrorResponse<T = string, M = any> {
    success: false;
    message: string;
    error: T;
    meta?: M;
}
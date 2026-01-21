export interface SuccessResponse<T = any, M = any> {
    success: true;
    message: string;
    data: T;
    meta: M;
}

export interface ErrorResponse<T = string, M = any> {
    success: false;
    message: string;
    error: T; // This corresponds to your 'tag' or 'errorCode'
    meta: M;
}
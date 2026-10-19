import qs from 'qs';
import axiosUserInstance from "@/src/api/axiosUserServiceInstance"; // Adjust instance name as per your setup
import {PaginationResponse, SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddExpenseCategoryRequest,
    BrowseCoicopCategoriesParams,
    ExpenseCategoryCoicopBrowseResponse,
    ExpenseCategoryResponse,
    SearchExpenseCategoryRequest,
    SearchExpenseCategoryResponse,
} from "@/src/api/dto/expense/category";
import {ExpenseCategorySource} from "@/src/api/dto/constants";

const BASE_PATH = "/expense/category/v1"; // Adjust path based on your backend router prefix

/**
 * Creates a new custom expense category
 */
export const CreateExpenseCategoryApi = async (data: AddExpenseCategoryRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<ExpenseCategoryResponse>>(
            `${BASE_PATH}/`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Retrieves all expense categories (Default and Custom)
 */
export const GetExpenseCategoriesApi = async (
    category_type: ExpenseCategorySource[] = [ExpenseCategorySource.DEFAULT, ExpenseCategorySource.CUSTOM],
    offset = 0,
    limit = 100
) => {
    try {
        // Backend expects source_type with SYSTEM | CUSTOM (uppercase).
        const source_type = category_type.map((t) => {
            if (t === ExpenseCategorySource.CUSTOM) return 'CUSTOM';
            if (t === ExpenseCategorySource.DEFAULT) return 'SYSTEM';
            return String(t).toUpperCase();
        });
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseCategoryResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    source_type,
                    offset,
                    limit,
                },
                paramsSerializer: (query) => qs.stringify(query, {arrayFormat: 'repeat'}),
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse | undefined,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Retrieves a specific expense category by ID
 */
export const GetExpenseCategoryByIdApi = async (categoryId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseCategoryResponse>>(
            `${BASE_PATH}/${categoryId}`
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Local-only COICOP browse by exact hierarchy level.
 * Example: level=1 → divisions; level=2&parents=COICOP_01 → children of Food.
 */
export const BrowseCoicopCategoriesApi = async (params: BrowseCoicopCategoriesParams) => {
    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<ExpenseCategoryCoicopBrowseResponse>
        >(`${BASE_PATH}/coicop`, {
            params: {
                level: params.level,
                parents: params.parents,
                match: params.match ?? 'any',
                offset: params.offset ?? 0,
                limit: params.limit ?? 100,
            },
            paramsSerializer: (query) => qs.stringify(query, {arrayFormat: 'repeat'}),
        });

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse | undefined,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Search custom + master catalog categories (may materialize SYSTEM rows).
 */
export const SearchExpenseCategoriesApi = async (data: SearchExpenseCategoryRequest) => {
    try {
        const res = await axiosUserInstance.post<
            SuccessResponse<SearchExpenseCategoryResponse>
        >(`${BASE_PATH}/search`, {
            query: data.query,
            scope: data.scope ?? 'ALL',
            limit: data.limit ?? 20,
            offset: data.offset ?? 0,
        });

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse | undefined,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};
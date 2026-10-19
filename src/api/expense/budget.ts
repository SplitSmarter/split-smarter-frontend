import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {PaginationResponse, SuccessResponse} from "@/src/api/dto/ApiResponse";
import {
    AddBudgetRuleRequest,
    AddBudgetRuleResponse,
    ApplicableBudgetItem,
    ApplicableBudgetsRequest,
    BudgetMemberItem,
    BudgetRuleDetails,
    BudgetRuleListItem,
    ReplaceBudgetMembersRequest,
    UpdateBudgetRuleRequest,
    UpdateBudgetRuleResponse,
} from "@/src/api/dto/expense/budget";
import {BudgetAudienceType} from "@/src/api/dto/expense/constant";
import {handleApiError} from "@/src/api/utils/mapper";

const BASE_PATH = "/budget/v1";

/**
 * Creates a budget rule for the authenticated user.
 */
export const addBudgetRuleApi = async (data: AddBudgetRuleRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddBudgetRuleResponse>>(
            `${BASE_PATH}/rules`,
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

export interface ListBudgetRulesQueryParams {
    offset?: number;
    limit?: number;
    include_inactive?: boolean;
    audience_type?: BudgetAudienceType;
    group_id?: number;
}

/**
 * Lists budget rules the authenticated user can see.
 */
export const listBudgetRulesApi = async (params: ListBudgetRulesQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<BudgetRuleListItem[]>>(
            `${BASE_PATH}/rules`,
            {
                params: {
                    offset: params.offset ?? 0,
                    limit: params.limit ?? 100,
                    include_inactive: params.include_inactive ?? false,
                    audience_type: params.audience_type,
                    group_id: params.group_id,
                },
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Fetches one budget rule, including members, the current instance, and progress.
 */
export const getBudgetRuleByIdApi = async (ruleId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<BudgetRuleDetails>>(
            `${BASE_PATH}/rules/${ruleId}`
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
 * Updates mutable fields on a budget rule.
 */
export const updateBudgetRuleApi = async (ruleId: number, data: UpdateBudgetRuleRequest) => {
    try {
        const res = await axiosUserInstance.put<SuccessResponse<UpdateBudgetRuleResponse>>(
            `${BASE_PATH}/rules/${ruleId}`,
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
 * Replaces the full member list on a shared or group budget rule.
 */
export const replaceBudgetMembersApi = async (ruleId: number, data: ReplaceBudgetMembersRequest) => {
    try {
        const res = await axiosUserInstance.put<SuccessResponse<BudgetMemberItem[]>>(
            `${BASE_PATH}/rules/${ruleId}/members`,
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
 * Budgets that would apply to a draft expense (date + optional scope fields).
 */
export const listApplicableBudgetsApi = async (data: ApplicableBudgetsRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<ApplicableBudgetItem[]>>(
            `${BASE_PATH}/rules/applicable`,
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
 * Deactivates a budget rule. The response data is the deactivated rule id.
 */
export const deactivateBudgetRuleApi = async (ruleId: number) => {
    try {
        const res = await axiosUserInstance.delete<SuccessResponse<number>>(
            `${BASE_PATH}/rules/${ruleId}`
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

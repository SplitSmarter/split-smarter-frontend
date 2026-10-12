import qs from "qs";
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {AnalyticsSeriesResponse} from "@/src/api/dto/expense/analytics";
import {AnalyticsBucket, AnalyticsGroupBy} from "@/src/api/dto/expense/constant";
import {handleApiError} from "@/src/api/utils/mapper";

const BASE_PATH = "/expense/v1";

export interface AnalyticsSeriesQueryParams {
    start_date: string; // YYYY-MM-DD, inclusive
    end_date: string; // YYYY-MM-DD, inclusive
    bucket?: AnalyticsBucket;
    group_by?: AnalyticsGroupBy;
    category_ids?: number[];
    include_transfers?: boolean;
}

/**
 * Fetches obligation totals and a time series for the authenticated user.
 */
export const getAnalyticsSeriesApi = async (params: AnalyticsSeriesQueryParams) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<AnalyticsSeriesResponse>>(
            `${BASE_PATH}/analytics/series`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date,
                    bucket: params.bucket ?? AnalyticsBucket.MONTH,
                    group_by: params.group_by ?? AnalyticsGroupBy.NONE,
                    category_ids: params.category_ids,
                    include_transfers: params.include_transfers ?? false,
                },
                paramsSerializer: (query) => qs.stringify(query, {arrayFormat: "repeat"}),
            }
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

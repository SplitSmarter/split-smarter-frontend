import qs from 'qs';
import axiosUserInstance from '@/src/api/axiosUserServiceInstance';
import {SuccessResponse} from '@/src/api/dto/ApiResponse';
import {AnalyticsBucket} from '@/src/api/dto/expense/constant';
import {
    PlaceAnalyticsBundle,
    PlaceAnalyticsBundleQueryParams,
    PlaceAnalyticsQueryParams,
    PlaceAnalyticsSection,
    PlaceAnalyticsSectionData,
} from '@/src/api/dto/expense/place_analytics';
import {handleApiError} from '@/src/api/utils/mapper';

/** Backend: place_analytics_router @ /expense + /v1 */
const BASE_PATH = '/expense/v1';

function buildCommonParams(params: PlaceAnalyticsQueryParams) {
    return {
        start_date: params.start_date,
        end_date: params.end_date,
        bucket: params.bucket ?? AnalyticsBucket.MONTH,
        limit: params.limit ?? 10,
        activity_limit: params.activity_limit ?? 5,
    };
}

/**
 * GET /expense/v1/places/{place_id}/analytics
 * Bundle of one or more place analytics sections for a date range.
 */
export const getPlaceAnalyticsBundleApi = async (
    placeId: number,
    params: PlaceAnalyticsBundleQueryParams,
) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<PlaceAnalyticsBundle>>(
            `${BASE_PATH}/places/${placeId}/analytics`,
            {
                params: {
                    ...buildCommonParams(params),
                    include: params.include,
                },
                paramsSerializer: (query) => qs.stringify(query, {arrayFormat: 'repeat'}),
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * GET /expense/v1/places/{place_id}/analytics/{section}
 * Single place analytics section for a date range.
 */
export const getPlaceAnalyticsSectionApi = async <S extends PlaceAnalyticsSection>(
    placeId: number,
    section: S,
    params: PlaceAnalyticsQueryParams,
) => {
    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<PlaceAnalyticsSectionData<S>>
        >(`${BASE_PATH}/places/${placeId}/analytics/${section}`, {
            params: buildCommonParams(params),
            paramsSerializer: (query) => qs.stringify(query, {arrayFormat: 'repeat'}),
        });

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

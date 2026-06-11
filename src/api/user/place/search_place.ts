import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import { SearchPlaceRequest, LocationDetails } from "@/src/api/dto/user/place";
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { PlaceSource } from "@/src/api/dto/constants";

const BASE_PATH = "/place/v1"; // Place Router Prefix

/**
 * Search places by text query
 */
export const SearchPlaceApi = async (data: SearchPlaceRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<LocationDetails[]>>(
            `${BASE_PATH}/search`,
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
 * Fetch location details using a generic provider and provider_id
 */
export const GetPlaceDetailsByProviderApi = async (provider: PlaceSource, providerId: string | number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<LocationDetails>>(
            `${BASE_PATH}/details`,
            {
                params: {
                    provider,
                    provider_id: providerId,
                },
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

/**
 * Fetch dedicated Google Place details using a Google place_id string
 */
export const GetGooglePlaceDetailsApi = async (placeId: string) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<LocationDetails>>(
            `${BASE_PATH}/google/details`,
            {
                params: {
                    place_id: placeId,
                },
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
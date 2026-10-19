import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    SearchPlaceRequest,
    LocationDetails,
    ReverseGeocodeResponse,
} from "@/src/api/dto/user/place";
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
export const GetPlaceDetailsByProviderApi = async (provider: PlaceSource, providerId: number) => {
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

/**
 * Reverse-geocode lat/lon via user-service (region + optional nearby places).
 * Mirrors GET /place/v1/reverse.
 */
export const ReverseGeocodePlaceApi = async (params: {
    lat: number;
    lon: number;
    radius?: number;
    include_nearby?: boolean;
}) => {
    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<ReverseGeocodeResponse>
        >(`${BASE_PATH}/reverse`, {
            params: {
                lat: params.lat,
                lon: params.lon,
                radius: params.radius ?? 2000,
                include_nearby: params.include_nearby ?? false,
            },
        });

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
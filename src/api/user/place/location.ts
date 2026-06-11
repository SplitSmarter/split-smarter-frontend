import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddPlaceRequest,
    AddPlaceResponse,
    UserPlaceDetails
} from "@/src/api/dto/user/place";

export const CreatePlaceApi = async (data: AddPlaceRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddPlaceResponse>>(
            "/place/v1/",
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

export const GetUserPlaceByIdApi = async (placeId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<UserPlaceDetails>>(
            `/place/v1/${placeId}`
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

export const GetAllUserPlacesApi = async (offset = 0, limit = 20) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<UserPlaceDetails[]>>(
            "/place/v1/",
            {params: {offset, limit}}
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export const DeletePlaceApi = async (placeId: number) => {
    try {
        const res = await axiosUserInstance.delete(
            `/place/v1/${placeId}`
        );
        return {success: true};
    } catch (error: any) {
        return handleApiError(error);
    }
};
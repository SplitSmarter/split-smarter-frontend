// src/api/asset/details.ts
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {AssetDetailsDTO} from "@/src/api/dto/user/asset";

const BASE_PATH = "/asset/v1";

/**
 * Retrieves full details of a specific asset by its ID.
 * This includes metadata, the CDN URL, and owner information.
 */
export const GetImageDetailsApi = async (assetId: string) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<AssetDetailsDTO>>(
            `${BASE_PATH}/image/v1/${assetId}`
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
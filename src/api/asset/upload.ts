// src/api/asset/upload.ts
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import { ImageUploadResponse } from "@/src/api/dto/user/asset";

const BASE_PATH = "/asset/v1";

/**
 * Uploads an image to the media service.
 * Supports local storage or cloud upload via the to_cloud flag.
 * * @param fileUri - The local filesystem URI of the image
 * @param toCloud - If true, the asset is pushed to cloud storage (e.g., Cloudinary/S3)
 */
export const UploadImageApi = async (fileUri: string, toCloud: boolean = false) => {
    try {
        const formData = new FormData();

        // Prepare the filename and mime type for React Native FormData
        const filename = fileUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore - React Native's FormData requires an object with uri, name, and type
        formData.append('file', {
            uri: fileUri,
            name: filename,
            type: type,
        });

        const res = await axiosUserInstance.post<SuccessResponse<ImageUploadResponse>>(
            `${BASE_PATH}/upload/image`,
            formData,
            {
                params: { to_cloud: toCloud },
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data // Contains asset_id, name, and url
            };
        }

        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        // handleApiError already handles the error mapping for your global state
        return handleApiError(error);
    }
};
import {AssetStatus} from "@/src/api/dto/constants";
import {BasicUserDetails} from "@/src/api/dto/user/user";

export interface BasicImage {
    id: string;
    name: string;
    url: string;
    extension: string;
}

export interface ImageUploadResponse {
    asset_id: string;
    name: string;
    url: string;
}

export interface AssetDetailsDTO {
    asset_id: string;
    file_name: string;
    file_type: string;
    extension: string;
    status: AssetStatus;
    created_at: string; // ISO Date string
    url: string | null;
    created_by: BasicUserDetails | null;
}
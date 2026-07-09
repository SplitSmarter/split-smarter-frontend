import {GroupCategorySource} from "@/src/api/dto/constants";
import {BasicUserDetails} from "@/src/api/dto/user/user";
import {BasicImage} from "@/src/api/dto/user/asset";

export interface BasicGroupCategoryDetails {
    id: number;
    title: string;
    category_type: string;
    icon: BasicImage;
}

export interface GroupCategoryDetails {
    id: number;
    title: string;
    description: string;
    source_type: GroupCategorySource;
    owner?: BasicUserDetails | null;
    icon: BasicImage;
}

export interface AddGroupCategoryRequest {
    title: string;
    description: string;
    icon_asset_id: string; // UUID from your asset picker
}

export interface AddCategoryResponse {
    id: number;
}
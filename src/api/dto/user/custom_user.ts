// src/api/dto/user/customUser.ts

import {BasicImage} from "@/src/api/dto/user/asset";

export interface CustomUserDetails {
    id: number;
    name: string;
    avatar: BasicImage;
    created_on: string;
}

export interface AddCustomUserRequest {
    name: string;
    relationship_id: number;
    avatar_asset_id: string; // UUID
}

export interface AddCustomUserResponse {
    id: number;
    name: string;
    relation_title: string;
    created_by_id: number;
}

export interface UpdateCustomUserRequest {
    name?: string;
}

export interface UpdateCustomUserResponse {
    id: number;
    name: string;
    updated_fields: string[];
}
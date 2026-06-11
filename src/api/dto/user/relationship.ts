// src/api/dto/user/relationship.ts
import {BasicImage} from "@/src/api/dto/user/asset";
import {RelationshipSource} from "@/src/api/dto/constants";

export interface RelationshipDetails {
    id: number;
    title: string;
    description: string | null;
    type: RelationshipSource;
    icon: BasicImage;
    created_at: string;
}

export interface AddRelationshipRequest {
    title: string;
    description: string;
    icon_asset_id: string; // UUID
}

export interface AddRelationshipResponse {
    id: number;
    title: string;
    created_at: string;
}

export interface UpdateRelationshipRequest {
    title?: string;
    description?: string;
    icon_asset_id?: string; // UUID
}

export interface UpdateRelationshipResponse {
    id: number;
    updated_fields: string[];
}
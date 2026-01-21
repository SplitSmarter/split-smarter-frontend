import { RelationWithUserType } from "@/src/constants/expense";
import {ImageHostType} from "@/src/constants/images_old";

export interface RelationUser {
    id: number;
    name: string;
    avatar_name?: string;
    avatar_title?: string;
    avatar_url?: string;
    avatar_host?: string;
    avatar_host_type: ImageHostType;
    type: RelationWithUserType;
}

export interface RelationRelationship {
    id: number;
    title: string;
    type: string;
    description?: string;
}

export interface RelationItem {
    id: number;
    with_user: RelationUser;
    created_at: string;
    relationship: RelationRelationship | null;
}

export interface GetRelationsResponse {
    relations: RelationItem[];
    count: number;
    offset: number;
    limit: number;
}

import {RelationshipSource, RelationWithUserType} from "@/src/api/dto/constants";
import {BasicImage} from "@/src/api/dto/user/asset";

export interface BasicUserDetails {
    id: number;
    name: string;
    user_type: RelationWithUserType;
    avatar: BasicImage | null;
}

export interface RelationshipDetails {
    id: number;
    title: string;
    description?: string;
    type: RelationshipSource;
    icon: BasicImage;
    created_at: string; // ISO Date string
}

export interface RelationDetails {
    id: number;
    relationship: RelationshipDetails;
    with_user: BasicUserDetails;
}

export interface AddRelationRequest {
    user_id: number;
    user_type: RelationWithUserType;
    relationship_id: number;
}

export interface AddRelationResponse {
    id: number;
    with_user_id: number;
    relationship_id: number;
    created_at: string; // ISO String serialization format from back-end
}

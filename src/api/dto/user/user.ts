import {RelationWithUserType} from "@/src/api/dto/constants";
import {BasicImage} from "@/src/api/dto/user/asset";
import {RelationDetails} from "@/src/api/dto/user/relation";

export interface UserSearchResponse {
    id: number;
    name: string;
    user_type: RelationWithUserType;
    avatar: BasicImage;
    relation?: RelationDetails | null;
}

export interface BasicUserDetails {
    id: number;
    name: string;
    user_type: RelationWithUserType;
    avatar: BasicImage;
}

export interface UserProfileResponse{
    id: number;
    name: string
    email: string
    phone_number?:string
    city?:string
    region?:string
    country: string
    currency: string
    language: string
    avatar: BasicImage
    registered_on: string
}

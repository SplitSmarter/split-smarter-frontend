import { BasicImage } from "@/src/api/dto/user/asset";
import { BasicUserDetails } from "@/src/api/dto/user/user";
import {GroupUserRole, RelationWithUserType} from "@/src/api/dto/constants";

export interface AllGroupMembershipsDetails {
    id: number;
    user: BasicUserDetails;
    user_role: GroupUserRole;
    created_at: string;
}

export interface AddMembershipRequest {
    group_id: number;
    group_category_id?: number;
    user_id?: number;
    user_type?: RelationWithUserType;
    invite_code?: string;
    user_invite_id?: number;
}
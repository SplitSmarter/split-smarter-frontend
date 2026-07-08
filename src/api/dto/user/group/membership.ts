import { BasicImage } from "@/src/api/dto/user/asset";
import { BasicUserDetails } from "@/src/api/dto/user/user";
import {GroupUserRole} from "@/src/api/dto/constants";

export interface AllGroupMembershipsDetails {
    id: number;
    user: BasicUserDetails;
    user_role: GroupUserRole;
    created_at: string;
}
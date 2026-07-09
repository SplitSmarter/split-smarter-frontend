import {BasicImage} from "@/src/api/dto/user/asset";
import {GroupIntent, GroupStatus, GroupUserRole, GroupVisibilityType, SelectUser} from "@/src/api/dto/constants";
import {BasicUserDetails} from "@/src/api/dto/user/user";
import {BasicGroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";

export interface AddGroupRequest {
    title: string;
    description: string;
    icon_asset_id: string; // UUID string
    background_asset_id: string; // UUID string
    category_id: number; // App-determined category
    group_category_id?: number; // User-specified category
    users?: SelectUser[];
}

export interface AddGroupResponse {
    id: number;
}

export interface GroupSettings {
    accepting_new_members: boolean;
    allow_member_invites: boolean;
    allow_member_add_member: boolean;
    allow_member_expenses: boolean;
    allow_member_approve_member: boolean;
    allow_unknown_member: boolean;
}

export interface GroupCreatedDetail {
    type: GroupIntent.CREATED;
    title: string;
}

export interface GroupRenamedDetail {
    type: GroupIntent.RENAMED;
    old_title: string | null;
    new_title: string;
}

export interface GroupIconDetail {
    type: GroupIntent.ICON_CHANGED;
    old_icon: BasicImage | null;
    new_icon: BasicImage;
}

export interface GroupStatusDetail {
    type: GroupIntent.STATUS_TOGGLED;
    old_status: string | null;
    new_status: string;
}

export interface GroupSettingsDetail {
    type: GroupIntent.SETTINGS_CHANGED;
    field_name: string;
    old_value: any;
    new_value: any;
}

export type GroupActivityDetailUnion =
    | GroupCreatedDetail
    | GroupRenamedDetail
    | GroupIconDetail
    | GroupStatusDetail
    | GroupSettingsDetail;

export interface GroupActivityResponse {
    id: string; // UUID4
    actor: BasicUserDetails;
    intent: string;
    details: GroupActivityDetailUnion[]; // Based on your Union type
    created_at: string;
}


export interface BaseGroupDetails {
    id: number;
    title: string;
    icon: BasicImage;
    is_member: boolean;
    no_of_members: number;
    last_activity: GroupActivityResponse | null;
}

export interface GroupDetails extends BaseGroupDetails{
    uuid: string;
    description: string;
    background: BasicImage;
    visibility: GroupVisibilityType;
    owner: BasicUserDetails;
    status: GroupStatus;
    created_at: string;
    updated_at: string;
    settings: GroupSettings;
    category: BasicGroupCategoryDetails;
}

export interface GroupMemberDetails extends BasicUserDetails {
    role: GroupUserRole;
    contribution_inr: number; // float -> number
    contribution_inflation_adjusted_inr: number; // float -> number
    joined_at: string; // datetime -> ISO String
}
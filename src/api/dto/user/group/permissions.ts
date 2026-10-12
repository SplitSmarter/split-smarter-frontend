import {GroupUserRole} from '@/src/api/dto/constants';
import {GroupSettings} from '@/src/api/dto/user/group';

export interface GroupEffectivePermissions {
    can_edit_group: boolean;
    can_invite: boolean;
    can_add_member: boolean;
    can_create_expenses: boolean;
    can_approve_member: boolean;
    can_manage_settlements: boolean;
    can_manage_budgets: boolean;
}

export interface GroupMyRolePermissionsResponse {
    group_id: number;
    membership_id: number;
    user_role: GroupUserRole;
    settings: GroupSettings;
    permissions: GroupEffectivePermissions;
}

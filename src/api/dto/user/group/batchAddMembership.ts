import {RelationWithUserType, SelectUser} from '@/src/api/dto/constants';

export enum BatchMembershipResultStatus {
    ADDED = 'ADDED',
    ALREADY_MEMBER = 'ALREADY_MEMBER',
    INVITED = 'INVITED',
    SKIPPED = 'SKIPPED',
}

export interface BatchAddMembershipRequest {
    group_id: number;
    users: SelectUser[];
    group_category_id?: number | null;
}

export interface BatchMembershipUserResult {
    user_id: number;
    user_type: RelationWithUserType;
    status: BatchMembershipResultStatus;
    membership_id?: number | null;
    message?: string | null;
}

export interface BatchAddMembershipResponse {
    group_id: number;
    results: BatchMembershipUserResult[];
    added_count: number;
    invited_count: number;
    skipped_count: number;
    already_member_count: number;
}

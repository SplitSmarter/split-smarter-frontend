import {BasicImage} from '@/src/api/dto/user/asset';

export enum MemoryScope {
    PERSONAL = 'PERSONAL',
    GROUP = 'GROUP',
    SHARED = 'SHARED',
}

export enum MemoryStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED',
}

export enum MemorySource {
    USER = 'USER',
    SYSTEM = 'SYSTEM',
}

export enum MemoryActivationAction {
    ACTIVATED = 'ACTIVATED',
    DEACTIVATED = 'DEACTIVATED',
}

export interface CreateMemoryRequest {
    title: string;
    description?: string;
    scope?: MemoryScope;
    icon_asset_id?: string;
    /** Required for GROUP scope. */
    group_id?: number;
    /** Initial share list for SHARED scope. */
    shared_with_user_ids?: number[];
    /** Required — inclusive window start. */
    start_at: string;
    /** Required — must be after start_at. */
    end_at: string;
    asset_ids?: string[];
}

export interface UpdateMemoryRequest {
    title?: string;
    description?: string;
    scope?: MemoryScope;
    status?: MemoryStatus;
    icon_asset_id?: string;
    start_at?: string;
    end_at?: string;
}

export interface CompleteMemoryRequest {
    end_at?: string;
    status?: MemoryStatus;
}

export interface ActivateMemoryRequest {
    group_id?: number;
}

export interface DeactivateMemoryRequest {
    group_id?: number;
}

export interface ShareMemoryRequest {
    user_ids: number[];
}

export interface UnshareMemoryRequest {
    user_ids: number[];
}

export interface RemoveMemoryAssetsRequest {
    asset_ids: string[];
}

export interface MemoryBasicDetails {
    id: number;
    title: string;
    description?: string | null;
    scope: MemoryScope;
    status: MemoryStatus;
    source: MemorySource;
    icon?: BasicImage | null;
    is_active: boolean;
    created_by_user_id: number;
    group_id?: number | null;
    start_at: string;
    end_at?: string | null;
    activated_at?: string | null;
    is_current_context?: boolean | null;
}

export interface MemoryResponse extends MemoryBasicDetails {
    assets: BasicImage[];
    shared_with_user_ids: number[];
    created_at: string;
}

export interface ActiveMemoryContextResponse {
    group_memory?: MemoryBasicDetails | null;
    personal_memory?: MemoryBasicDetails | null;
}

export interface MemoryActivationLogResponse {
    id: number;
    memory_id: number;
    action: MemoryActivationAction;
    group_id?: number | null;
    actor_user_id: number;
    created_at: string;
}

export interface ListMemoriesParams {
    offset?: number;
    limit?: number;
    source?: MemorySource[];
    group_id?: number;
    scope?: MemoryScope;
    status?: MemoryStatus[];
    covering_date?: string;
}

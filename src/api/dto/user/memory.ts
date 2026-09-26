import {BasicImage} from "@/src/api/dto/user/asset";

export enum MemoryScope {
    PERSONAL = "PERSONAL",
    GROUP = "GROUP",
}

export enum MemoryStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    DELETED = "DELETED",
}

export enum MemorySource {
    USER = "USER",
    SYSTEM = "SYSTEM",
}

export interface CreateMemoryRequest {
    title: string;
    description?: string;
    scope?: MemoryScope;
    icon_asset_id?: string;
    group_id?: number;
    start_at?: string;
    end_at?: string;
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

export interface MemoryBasicDetails {
    id: number;
    title: string;
    description?: string;
    scope: MemoryScope;
    status: MemoryStatus;
    source: MemorySource;
    icon?: BasicImage;
    is_active: boolean;
    created_by_user_id: number;
    start_at: string;
    end_at?: string;
}

export interface MemoryResponse extends MemoryBasicDetails {
    assets: BasicImage[];
    created_at: string;
}
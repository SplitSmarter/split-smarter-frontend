export enum GroupVisibilityType {
    PUBLIC = "public",
    PRIVATE = "private"
}

export enum GroupStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived",
    DELETED = "deleted"
}

export enum RelationWithUserType {
    USER = "USER",
    CUSTOM = "CUSTOM"
}

export enum PlaceSource {
    GOOGLE = 'GOOGLE',
    CUSTOM = 'CUSTOM'
}

export enum PlaceStatus {
    ACTIVE = "active",
    DELETED = "deleted"
}

export enum ExpenseCategorySource {
    DEFAULT = "default",
    CUSTOM = "custom"
}

export interface SelectUser {
    id: number;
    type: RelationWithUserType;
}

export enum RelationshipSource {
    CUSTOM = "CUSTOM",
    DEFAULT = "DEFAULT"
}

export enum GroupCategorySource {
    DEFAULT = 'DEFAULT',
    CUSTOM = 'CUSTOM'
}

export enum GroupUserRole {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    COORDINATOR = "COORDINATOR"
}

export enum AssetStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    DELETED = "deleted"
}

export enum GroupIntent {
    CREATED = "created",
    RENAMED = "RENAMED",
    ICON_CHANGED = "ICON_CHANGED",
    STATUS_TOGGLED = "STATUS_TOGGLED",
    SETTINGS_CHANGED = "SETTINGS_CHANGED"
}

export enum ExpenseItemSource {
    DEFAULT = "DEFAULT",
    CUSTOM = "CUSTOM"
}

export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP'; // Update with your actual supported Currency tokens

export enum GroupJoinMethod {
    GROUP_INVITE = "group_invite",
    USER_INVITE = "user_invite",
    ADD_USER = "add_user",
    SELF = "self"
}

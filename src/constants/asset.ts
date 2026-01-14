const asset_access_level = {
    OWNER: "owner",
    EDITOR: "editor",
    VIEWER: "viewer"
}
export type AssetAccessLevel = (typeof asset_access_level)[keyof typeof asset_access_level];

const asset_visibility = {
    PUBLIC: "public",
    RESTRICTED: "restricted",
    PRIVATE: "private"
}
export type AssetVisibility = (typeof asset_visibility)[keyof typeof asset_visibility];

const asset_source_type = {
    SYSTEM: "system",
    CUSTOM: "custom"
}
export type AssetSourceType = (typeof asset_source_type)[keyof typeof asset_source_type];

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

export type Currency =
    | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN'
    | 'BAM' | 'BBD' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL'
    | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHF' | 'CLP' | 'CNY'
    | 'COP' | 'CRC' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP' | 'ETB'
    | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF'
    | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP'
    | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS'
    | 'KHR' | 'KMF' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD'
    | 'LSL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRU'
    | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK'
    | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG'
    | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK'
    | 'SGD' | 'SHP' | 'SLE' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STN' | 'SZL' | 'THB'
    | 'TJS' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX'
    | 'USD' | 'UYU' | 'UZS' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XCD' | 'XDR'
    | 'XOF' | 'XPF' | 'YER' | 'ZAR' | 'ZMW' | 'ZWL';

export enum GroupJoinMethod {
    GROUP_INVITE = "group_invite",
    USER_INVITE = "user_invite",
    ADD_USER = "add_user",
    SELF = "self"
}

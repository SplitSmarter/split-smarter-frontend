export enum UserAccountType {
    USER = "user",
    CUSTOM = "custom", // Add additional enum values if supported
}


export enum UserTransactionStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    USER_CANCELLED = "USER_CANCELLED",
    EXPIRED = "EXPIRED"
}

export enum FailureReasonType {
    NONE = "NONE",
    USER_ABORTED = "USER_ABORTED",
    INVALID_SIGNATURE = "INVALID_SIGNATURE",
    GATEWAY_DECLINED = "GATEWAY_DECLINED",
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
    TIMED_OUT = "TIMED_OUT",
    OTHER = "OTHER"
}
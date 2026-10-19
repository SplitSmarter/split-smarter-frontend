import { BaseGroupDetails } from "@/src/api/dto/user/group";
import { BasicUserDetails } from "@/src/api/dto/user/user";

export enum DraftValidationErrorKey {
    TITLE_REQUIRED = "titleRequired",
    AMOUNT_INVALID = "amountInvalid",
    GROUP_MISMATCH = "groupMismatch",
    ALLOCATION_MISMATCH = "allocationMismatch",
}

export interface GroupMismatchPayload {
    group: BaseGroupDetails;
    missingUsers: BasicUserDetails[];
}

export type AllocationMismatchSide = 'paidBy' | 'split' | 'items' | 'both';

export interface ValidationErrorPayloads {
    [DraftValidationErrorKey.TITLE_REQUIRED]: { message: string };
    [DraftValidationErrorKey.AMOUNT_INVALID]: { message: string };
    [DraftValidationErrorKey.GROUP_MISMATCH]: { message: string; data: GroupMismatchPayload };
    [DraftValidationErrorKey.ALLOCATION_MISMATCH]: {
        message: string;
        side: AllocationMismatchSide;
    };
}

// Map mapping all potential error tracking collections
export type ValidationErrorMap = {
    [K in DraftValidationErrorKey]?: ValidationErrorPayloads[K];
};
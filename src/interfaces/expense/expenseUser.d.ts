import {RelationWithUserType} from "@/src/constants/expense";

export interface ExpenseUser {
    id: number;
    name: string;
    amount: number;
    locked: boolean;
    user_type: RelationWithUserType;
    avatar_title?: string;
    avatar_url?: string;
    avatar_host?: string;
    avatar_host_type?: string;
}

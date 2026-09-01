import {BasicImage} from "@/src/api/dto/user/asset";

export interface ConsumerPaymentCategorySummaryResponse {
    id: string;
    name: string;
    icon?: BasicImage | null;
    display_order: number;
}

export interface PaymentProviderUiResponse {
    id: string;
    name: string;
    taxonomy_id: string;
    rail_type: string;
    icon?: BasicImage | null;
    display_priority: number;
}

export interface ConsumerPaymentCategoryResponse {
    id: string;
    name: string;
    icon?: BasicImage | null;
    display_order: number;
    providers: PaymentProviderUiResponse[];
}
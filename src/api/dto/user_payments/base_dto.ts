import {BasicImage} from "@/src/api/dto/user/asset";

export interface PaymentRailProviderBasicDetails {
    id: string;
    name: string;
    taxonomy_id: string;
    display_name: string;
    icon: BasicImage;
}

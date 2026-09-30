import { UserPaymentAccountItemDTO } from '@/src/api/dto/user_payments/account';
import { UPIInstalledApp } from '@/src/utils/upiNativeModule';

export interface PayeeEntity {
    name: string;
    iconUrl?: string | null;
}

export interface ScreenRouteParams {
    transactionId: string;
    amount?: string;
    userId?: string;
    userType?: string;
    merchantId?: string;
}

export type { UserPaymentAccountItemDTO, UPIInstalledApp };
export interface VpaOption {
    id: string;
    vpa: string;
    officialName: string;
    isVerified: boolean;
}

export interface PaymentSource {
    id: string;
    bankName: string;
    accountMask: string;
    type: "bank" | "card";
    accentColor: string;
}
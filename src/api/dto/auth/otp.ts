export type SendOtpRequest = {
    email: string;
}

export type VerifyOtpRequest = {
    email: string;
    otpCode: string;
}

export type ResendOtpRequest = {
    email: string;
}

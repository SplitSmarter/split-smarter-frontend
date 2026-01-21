export type CredentialsLoginForm = {
    emailOrUsername: string,
    password: string,
};

export type CredentialSignupForm = {
    name: string,
    username: string,
    email: string,
    password: string,
    country: string,
    currency: string,
    language: string,
    user_type: string,
};

export type GoogleSignupForm = {
    username: string,
    idToken: string,
}

export type GoogleLoginForm = {
    idToken: string,
}

export interface SendOtpForm {
    fullName: string;
    email: string;
}

export interface VerifyOtpForm {
    email: string;
    otpCode: string;
}

export interface ResendOtpForm {
    name: string;
    email: string;
}

export type User = {
    username: string;
    email: string;
    access_token: string;
};


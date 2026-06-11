import {RelationWithUserType} from "@/src/api/dto/constants";
import {RemoteUserProfileResponse} from "@/src/api/dto/auth/login";

export type CredentialsSignupRequest = {
    name: string,
    email: string | null,
    password: string,
    city: string,
    country: string,
    currency: string,
    language: string
    user_type: string,
};

export type GoogleSignupRequest = {
    idToken: string;
    name: string;
    password?: string; // Optional, usually null for Google
    city: string;
    country: string;
    currency: string;
    language: string;
};

export type SignupResponse = {
    id: number;
    username: string;
    profile: RemoteUserProfileResponse;
};

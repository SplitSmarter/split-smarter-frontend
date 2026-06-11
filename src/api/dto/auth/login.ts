export type CredentialsLoginRequest = {
    emailOrUsername: string,
    password: string,
};

export type GoogleLoginRequest = {
    idToken: string,
}

export type RemoteAvatarDetails = {
    asset_id: string; // UUID from Java
    asset_url: string;
};

export type RemoteUserProfileResponse = {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    city: string;
    region: string;
    country: string;
    currency: string;
    language: string;
    avatar: RemoteAvatarDetails;
    registered_on: string;
};

export type CredentialsLoginResponse = {
    id: string;
    username: string;
    profile: RemoteUserProfileResponse;
};

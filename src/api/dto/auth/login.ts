export type CredentialsLoginRequest = {
    emailOrUsername: string,
    password: string,
};

export type GoogleLoginRequest = {
    idToken: string,
}

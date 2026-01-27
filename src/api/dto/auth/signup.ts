export type CredentialsSignupRequest = {
    name: string,
    email: string | null,
    password: string,
    city: string,
    country: string,
    currency: string,
    language: string
    user_type: 'user' | 'guest',
};

export enum UserType {
    CUSTOM = 'custom',
    USER = 'user'
}

export interface UserBase {
    id: number;
    name: string;
    user_type: UserType;
    avatar: ImageBase;
}

export interface ImageBase {
    id: string;
    name: string;
    url: string;
    extension: string;
}
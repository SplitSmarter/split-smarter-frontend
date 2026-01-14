import {resources} from "@/src/constants/language";

export type LanguageTag = keyof typeof resources;

export type FontEntry = {
    name: string;
    url: string;
};

export type FontConfig = {
    primary: FontEntry;
    secondary: FontEntry;
};

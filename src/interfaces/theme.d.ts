import {ThemeType} from "@/src/types/theme";

export interface ThemeContextProps {
    theme: ThemeType;
    toggleTheme: () => void;
}

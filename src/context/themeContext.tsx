// /src/context/ThemeContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Appearance} from "react-native";
import {ThemeContextProps} from "@/src/interfaces/theme";
import {ThemeType} from "@/src/types/theme";
import {THEME_KEY} from "@/src/constants/theme";
import { useColorScheme as useNativewindColorScheme } from "nativewind";

interface Props {
    children: ReactNode;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: Props) => {
    const [theme, setTheme] = useState<ThemeType>("light");
    const { setColorScheme } = useNativewindColorScheme();

    useEffect(() => {
        const init = async () => {
            const stored = await AsyncStorage.getItem(THEME_KEY);
            let resolvedTheme: ThemeType =
                stored === "dark" || stored === "light"
                    ? stored
                    : (Appearance.getColorScheme() === "dark" ? "dark" : "light");
            setTheme(resolvedTheme);
            setColorScheme(resolvedTheme);
        };
        init();
    }, [setColorScheme]);

    const toggleTheme = async () => {
        const newTheme: ThemeType = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        setColorScheme(newTheme);
        await AsyncStorage.setItem(THEME_KEY, newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeStore = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeStore must be used within a ThemeProvider");
    }
    return context;
};

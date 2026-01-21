// /src/store/useThemeStore.ts
import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Appearance} from "react-native";
import {colorScheme} from "nativewind";
import {ThemeType} from "@/src/types/theme";
import {THEME_KEY} from "@/src/constants/theme";

interface ThemeState {
    theme: ThemeType;
    _hasHydrated: boolean; // Add this
    setHasHydrated: (state: boolean) => void; // Add this
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    initTheme: () => void;
}


export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: (Appearance.getColorScheme() as ThemeType) || "light",
            _hasHydrated: false,

            setHasHydrated: (state: any) => set({_hasHydrated: state}),

            setTheme: (theme) => {
                colorScheme.set(theme); // Sync NativeWind
                set({theme});
            },

            toggleTheme: () => {
                const newTheme = get().theme === "light" ? "dark" : "light";
                colorScheme.set(newTheme); // Sync NativeWind
                set({theme: newTheme});
            },

            initTheme: () => {
                const currentTheme = get().theme;
                colorScheme.set(currentTheme); // Ensure NativeWind matches persisted state on boot
            },
        }),
        {
            name: THEME_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

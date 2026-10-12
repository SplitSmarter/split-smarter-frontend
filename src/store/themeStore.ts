// /src/store/themeStore.ts
import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Appearance, InteractionManager} from "react-native";
import {colorScheme} from "nativewind";
import {ThemeType} from "@/src/types/theme";
import {THEME_KEY} from "@/src/constants/theme";

interface ThemeState {
    theme: ThemeType;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    initTheme: () => void;
}

/**
 * Apply NativeWind scheme after React Navigation / layout settle.
 * Sync colorScheme.set during the same tick as a theme remount can throw
 * "Couldn't find a navigation context" on the first toggle (Expo Go).
 */
function applyNativeWindScheme(theme: ThemeType) {
    InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
            colorScheme.set(theme);
        });
    });
}

export const themeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: (Appearance.getColorScheme() as ThemeType) || "light",
            _hasHydrated: false,

            setHasHydrated: (state: any) => set({_hasHydrated: state}),

            setTheme: (theme) => {
                set({theme});
                applyNativeWindScheme(theme);
            },

            toggleTheme: () => {
                const newTheme = get().theme === "light" ? "dark" : "light";
                set({theme: newTheme});
                applyNativeWindScheme(newTheme);
            },

            initTheme: () => {
                // Boot: sync immediately so first paint matches persisted theme
                colorScheme.set(get().theme);
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

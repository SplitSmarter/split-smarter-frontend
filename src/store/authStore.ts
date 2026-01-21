import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/src/types/auth/auth";
import { useUserStore } from "@/src/store/userStore";
import {GetMyDetailsApi} from "@/src/api/user/user";

export const USER_STORAGE_KEY = "@auth_user";

type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (user: User) => Promise<void>;
    logout: () => Promise<void>;

    getAccessToken: () => string | null;
    setAccessToken: (token: string) => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: true,
            isAuthenticated: false,

            login: async (user: User) => {
                set({ user, isAuthenticated: true, isLoading: false });
                try {
                    const data = await GetMyDetailsApi();
                    useUserStore.getState().setUser(data);
                } catch (err) {
                    console.error("Failed to fetch profile on login:", err);
                }
            },

            logout: async () => {
                set({ user: null, isAuthenticated: false, isLoading: false });
                useUserStore.getState().clearUser();
            },

            getAccessToken: () => get().user?.access_token ?? null,

            setAccessToken: (token: string) =>
                set((state) =>
                    state.user ? { user: { ...state.user, access_token: token } } : state
                ),
        }),
        {
            name: USER_STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = false;
                }
            },
        }
    )
);

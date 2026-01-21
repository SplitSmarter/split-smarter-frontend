import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CurrencyType } from "@/src/constants/expense";
import {ImageHostType} from "@/src/constants/images_old";
import {GetMyDetailsApi} from "@/src/api/user/user";

// Your user type
export interface UserDetails {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
    city?: string;
    region?: string;
    country: string;
    currency: CurrencyType;
    avatar_name: string;
    avatar_title: string;
    avatar_url?: string;
    avatar_host?: string;
    avatar_host_type: ImageHostType;
    language: string;
    registered_on: string;
}

interface UserState {
    user: UserDetails | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // actions
    setUser: (user: UserDetails) => void;
    updateUser: (fields: Partial<UserDetails>) => void;
    clearUser: () => void;
    syncUserFromServer: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

            updateUser: (fields) =>
                set((state) =>
                    state.user
                        ? { user: { ...state.user, ...fields }, isAuthenticated: true }
                        : state
                ),

            clearUser: () => set({ user: null, isAuthenticated: false }),

            syncUserFromServer: async () => {
                try {
                    const res = await GetMyDetailsApi();
                    set({ user: res, isAuthenticated: true, isLoading: false });
                } catch (err) {
                    console.error("Failed to sync user:", err);
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = false;
                }
            },
        }
    )
);

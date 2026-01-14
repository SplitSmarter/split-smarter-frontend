import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/src/types/auth";
import {USER_STORAGE_KEY} from "@/src/store/authStore";

export async function getAccessToken(): Promise<string | null> {
    try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (!storedUser) return null;
        const user: User = JSON.parse(storedUser);
        return user.access_token ?? null;
    } catch (err) {
        console.error("Failed to retrieve access token:", err);
        return null;
    }
}

export async function setAccessToken(access_token: string): Promise<boolean> {
    try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (!storedUser) {
            return false;
        }
        else{
            const user: User = JSON.parse(storedUser);
            user.access_token = access_token;
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        }
        return true;
    } catch (err) {
        console.error("Failed to set access token:", err);
        return false;
    }
}

export async function removeUserToken(): Promise<boolean> {
    try {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        return true;
    } catch (err) {
        console.error("Failed to remove access token:", err);
        return false;
    }
}


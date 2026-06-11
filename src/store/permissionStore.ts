import { create } from "zustand";
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PermissionState {
    camera: PermissionStatus;
    location: PermissionStatus;
    media: PermissionStatus;
    notifications: PermissionStatus;

    syncPermissions: () => Promise<void>;
    requestCamera: () => Promise<boolean>;
    requestLocation: () => Promise<boolean>;
    requestMedia: () => Promise<boolean>;
    openSettings: () => void;
}

export const permissionStore = create<PermissionState>((set) => ({
    camera: 'undetermined',
    location: 'undetermined',
    media: 'undetermined',
    notifications: 'undetermined',

    openSettings: () => Linking.openSettings(),

    syncPermissions: async () => {
        // Use the static methods on the Camera class
        const [camera, location, media, notifications] = await Promise.all([
            Camera.getCameraPermissionsAsync(),
            Location.getForegroundPermissionsAsync(),
            MediaLibrary.getPermissionsAsync(),
            Notifications.getPermissionsAsync(),
        ]);

        set({
            camera: camera.status as PermissionStatus,
            location: location.status as PermissionStatus,
            media: media.status as PermissionStatus,
            notifications: notifications.status as PermissionStatus,
        });
    },

    requestCamera: async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        set({ camera: status as PermissionStatus });
        return status === 'granted';
    },

    requestLocation: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        set({ location: status as PermissionStatus });
        return status === 'granted';
    },

    // Add this to your PermissionState interface

    // Add this to the creation body
    requestMedia: async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        set({ media: status as PermissionStatus });
        return status === 'granted';
    },
}));
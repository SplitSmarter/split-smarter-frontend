// src/store/deviceStore.ts
import { Dimensions, Platform, ScaledSize } from "react-native";
import { create } from "zustand";

type Orientation = "portrait" | "landscape";

interface DeviceState {
    platform: "ios" | "android" | "web";
    orientation: Orientation;
    screen: ScaledSize;
    isTablet: boolean;
    isMobile: boolean;

    // actions
    updateScreen: (screen: ScaledSize) => void;
}

export const useDeviceStore = create<DeviceState>((set) => {
    const initialScreen = Dimensions.get("window");
    const initialOrientation: Orientation =
        initialScreen.height >= initialScreen.width ? "portrait" : "landscape";

    // setup listener for changes
    Dimensions.addEventListener("change", ({ window }) => {
        set({
            screen: window,
            orientation: window.height >= window.width ? "portrait" : "landscape",
            isTablet: window.width >= 768,
            isMobile: window.width < 768,
        });
    });

    return {
        platform: Platform.OS as "ios" | "android" | "web",
        orientation: initialOrientation,
        screen: initialScreen,
        isTablet: initialScreen.width >= 768,
        isMobile: initialScreen.width < 768,

        updateScreen: (screen: ScaledSize) =>
            set({
                screen,
                orientation: screen.height >= screen.width ? "portrait" : "landscape",
                isTablet: screen.width >= 768,
                isMobile: screen.width < 768,
            }),
    };
});

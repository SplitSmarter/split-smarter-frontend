import { Dimensions, Platform, ScaledSize } from "react-native";
import { create } from "zustand";

type Orientation = "portrait" | "landscape";

interface DeviceState {
    platform: "ios" | "android" | "web";
    orientation: Orientation;
    screen: ScaledSize;
    isTablet: boolean;
    isMobile: boolean;
    updateScreen: (screen: ScaledSize) => void;
}

export const useDeviceStore = create<DeviceState>((set) => {
    const initialScreen = Dimensions.get("window");

    const calculateState = (screen: ScaledSize) => ({
        screen,
        orientation: (screen.height >= screen.width ? "portrait" : "landscape") as Orientation,
        isTablet: screen.width >= 768,
        isMobile: screen.width < 768,
    });

    return {
        platform: Platform.OS as "ios" | "android" | "web",
        ...calculateState(initialScreen),
        updateScreen: (screen: ScaledSize) => set(calculateState(screen)),
    };
});
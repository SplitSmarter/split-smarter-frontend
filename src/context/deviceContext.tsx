// // src/context/deviceContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { Dimensions, Platform, ScaledSize } from "react-native";
//
// type Orientation = "portrait" | "landscape";
//
// interface DeviceContextType {
//     platform: "ios" | "android" | "web";
//     orientation: Orientation;
//     screen: ScaledSize;
//     isTablet: boolean;
//     isMobile: boolean;
// }
//
// const DeviceContext = createContext<DeviceContextType | null>(null);
//
// export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [screen, setScreen] = useState(Dimensions.get("window"));
//     const [orientation, setOrientation] = useState<Orientation>(
//         screen.height >= screen.width ? "portrait" : "landscape"
//     );
//
//     const handleChange = ({ window }: { window: ScaledSize }) => {
//         setScreen(window);
//         setOrientation(window.height >= window.width ? "portrait" : "landscape");
//     };
//
//     useEffect(() => {
//         const sub = Dimensions.addEventListener("change", handleChange);
//         return () => sub?.remove();
//     }, []);
//
//     const isTablet = screen.width >= 768;
//     const isMobile = !isTablet;
//
//     const value: DeviceContextType = {
//         platform: Platform.OS as "ios" | "android" | "web",
//         orientation,
//         screen,
//         isTablet,
//         isMobile,
//     };
//
//     return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
// };
//
// export const useDevice = (): DeviceContextType => {
//     const context = useContext(DeviceContext);
//     if (!context) throw new Error("useDevice must be used inside DeviceProvider");
//     return context;
// };

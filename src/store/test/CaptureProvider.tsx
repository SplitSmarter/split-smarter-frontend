import { saveToLibraryAsync } from "expo-media-library";
import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useRef,
    useState,
    useEffect,
} from "react";
import { Alert, View, ViewProps } from "react-native";
import { captureRef } from "react-native-view-shot";

// Context to provide capture functionality
const CaptureContext = createContext<{
    setImageRef: (ref: React.RefObject<any>) => void;
    capture: () => Promise<string | null>;
}>({
    capture: () => Promise.resolve(null),
    setImageRef: () => {},
});

// Provider to wrap around app tree
export const CaptureProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [imageRef, setImageRef] = useState<React.RefObject<any> | null>(null);

    const capture = async () => {
        if (imageRef?.current) {
            try {
                const uri = await captureRef(imageRef.current, {
                    format: "png",
                    quality: 1,
                });

                await saveToLibraryAsync(uri);

                if (uri) {
                    Alert.alert("📸 Picture taken successfully!");
                    return uri;
                }
            } catch (error) {
                console.error("Capture failed", error);
                Alert.alert("❌ Failed to capture image.");
            }
        } else {
            Alert.alert("⚠️ No view to capture.");
        }

        return null;
    };

    return (
        <CaptureContext.Provider value={{ capture, setImageRef }}>
            {children}
        </CaptureContext.Provider>
    );
};

// Wrapper for the view you want to capture
export const CaptureWrapper: React.FC<PropsWithChildren & ViewProps> = ({
                                                                            children,
                                                                            ...props
                                                                        }) => {
    const imageRef = useRef(null);
    const { setImageRef } = useContext(CaptureContext);

    useEffect(() => {
        setImageRef(imageRef);
    }, [setImageRef]);

    return (
        <View ref={imageRef} {...props}>
            {children}
        </View>
    );
};

// Hook to use in any child to trigger capture
export const useCapture = () => {
    const { capture } = useContext(CaptureContext);
    return { capture };
};

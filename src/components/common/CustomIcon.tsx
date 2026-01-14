import React, { useEffect, useState } from "react";
import {
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
    View,
    Image as RNImage,
} from "react-native";
import { getIcon } from "@/src/utils/icons";
import { IconIdentifierType } from "@/src/constants/icons";

type CustomIconProps = {
    identifier: IconIdentifierType;
    name: string;
    url?: string;
    style?: StyleProp<ImageStyle>;
};

const defaultStyle: StyleProp<ImageStyle> = {
    width: 64,
    height: 64,
    marginBottom: 12,
};

const CustomIcon: React.FC<CustomIconProps> = ({
                                                     identifier,
                                                     name,
                                                     url,
                                                     style,
                                                 }) => {
    const [iconSource, setIconSource] = useState<ImageSourcePropType>();
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>();

    useEffect(() => {
        const fetchIcon = async () => {
            const icon = await getIcon(identifier, name, url);
            if (!icon) {
                return;
            }
            if (typeof icon === "number") {
                setIconSource(icon);
                setDimensions(undefined); // use default style
                return;
            }

            // Case 2: { uri: ... } → measure dimensions before setting
            if ("uri" in icon && icon.uri) {
                RNImage.getSize(
                    icon.uri,
                    (w, h) => {
                        setIconSource(icon);
                        setDimensions({ width: w, height: h });
                    },
                    (error) => {
                        console.warn("Failed to get image size:", error);
                        setIconSource(icon); // fallback without dimensions
                    }
                );
            }
        };

        fetchIcon();
    }, [identifier, name, url]);

    if (!iconSource) {
        return <View style={{ width: 64, height: 64, marginBottom: 12, backgroundColor: "#ccc", borderRadius: 32 }} />;
    }

    const appliedStyle = dimensions
        ? [{ width: dimensions.width, height: dimensions.height }, style]
        : style || defaultStyle;

    return <Image source={iconSource} style={appliedStyle} resizeMode="contain" />;
};

export default CustomIcon;

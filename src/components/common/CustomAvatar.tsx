import React, { useEffect, useState } from "react";
import {
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
    View,
    Text,
    Image as RNImage,
} from "react-native";
import { ImageHostType } from "@/src/constants/images";
import { localAvatars } from "@/src/constants/avatar";

type CustomAvatarProps = {
    name: string;
    title?: string;
    url?: string;
    host?: string;
    host_type?: ImageHostType;
    style?: StyleProp<ImageStyle>;
    showTitle?: boolean;
};

const defaultStyle: StyleProp<ImageStyle> = {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
};

const CustomAvatar: React.FC<CustomAvatarProps> = ({
                                                       name,
                                                       title,
                                                       url,
                                                       host,
                                                       host_type,
                                                       style,
                                                       showTitle = true,
                                                   }) => {
    const [avatarSource, setAvatarSource] = useState<ImageSourcePropType>();
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>();

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                if (host_type === ImageHostType.cloud && url) {
                    RNImage.getSize(
                        url,
                        (w, h) => {
                            setAvatarSource({ uri: url });
                            setDimensions({ width: w, height: h });
                        },
                        () => {
                            console.warn("Cloud image failed, using fallback");
                            setAvatarSource(require("@/assets/default_avatar.png"));
                        }
                    );
                    return;
                }

                if (host_type === ImageHostType.local && name) {
                    if (localAvatars[name]) {
                        setAvatarSource(localAvatars[name]);
                        return;
                    } else {
                        console.warn(`Local image not found for ${name}, fallback used`);
                        setAvatarSource(require("@/assets/default_avatar.png"));
                        return;
                    }
                }

                // Fallback
                setAvatarSource(require("@/assets/default_avatar.png"));
            } catch (err) {
                console.error("Error loading avatar:", err);
                setAvatarSource(require("@/assets/default_avatar.png"));
            }
        };

        loadAvatar();
    }, [name, url, host, host_type]);

    if (!avatarSource) {
        return (
            <View style={{ ...defaultStyle, backgroundColor: "#ccc" }} />
        );
    }

    const appliedStyle = dimensions
        ? [{ width: dimensions.width, height: dimensions.height, borderRadius: 999 }, style]
        : style || defaultStyle;

    return (
        <View className="items-center">
            <Image source={avatarSource} style={appliedStyle} resizeMode="cover" />
            {showTitle && (
                <Text className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                    {title || name}
                </Text>
            )}
        </View>
    );
};

export default CustomAvatar;

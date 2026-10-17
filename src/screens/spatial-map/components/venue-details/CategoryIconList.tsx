import React from 'react';
import {View, Image} from 'react-native';

interface CategoryIconListProps {
    icons: string[];
    size?: number;
}

export function CategoryIconList({icons, size = 18}: CategoryIconListProps) {
    if (!icons || icons.length === 0) return null;

    return (
        <View className="flex-row items-center">
            {icons.slice(0, 3).map((url, index) => (
                <Image
                    key={url}
                    source={{uri: url}}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        marginLeft: index > 0 ? -4 : 0,
                    }}
                    resizeMode="cover"
                />
            ))}
        </View>
    );
}

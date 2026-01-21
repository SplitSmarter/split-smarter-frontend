import React from 'react';
import {Dimensions, View} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
} from 'react-native-reanimated';
import {useI18nStore} from "@/src/store/useI18nStore";
import {windowWidth} from "@/src/constants/sizes";

type CarouselTextItemProps = {
    label: string;
    index: number;
    contentOffset: Animated.SharedValue<number>;
};

export const ListItemWidth = windowWidth / 4;

const CarouselTextItem: React.FC<CarouselTextItemProps> = ({
                                                               label,
                                                               index,
                                                               contentOffset,
                                                           }) => {
    const { font } = useI18nStore();
    const animatedTextStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 2) * ListItemWidth,
            (index - 1) * ListItemWidth,
            index * ListItemWidth,
            (index + 1) * ListItemWidth,
            (index + 2) * ListItemWidth,
        ];

        const scale = interpolate(
            contentOffset.value,
            inputRange,
            [0.8, 0.9, 1.2, 0.9, 0.8],
            Extrapolate.CLAMP
        );

        const color = interpolateColor(
            contentOffset.value,
            inputRange,
            ['#aaaaaa', '#dddddd', 'white', '#dddddd', '#aaaaaa']
        );

        return {
            transform: [{scale}],
            color,
        };
    });

    return (
        <View
            className="justify-center items-center"
            style={{width: ListItemWidth}}
        >
            <Animated.Text
                style={[
                    {
                        fontFamily: font.primary,
                        fontSize: 16,
                        fontWeight: '600',
                        letterSpacing: 1,
                    },
                    animatedTextStyle,
                ]}
            >
                {label}
            </Animated.Text>
        </View>
    );
};

export default CarouselTextItem;

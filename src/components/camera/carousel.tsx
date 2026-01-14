import React from "react";
import { View, FlatList, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useAnimatedScrollHandler,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.7;
const SPACING = (width - ITEM_WIDTH) / 2;
const SCALE_MAX = 1;
const SCALE_MIN = 0.85;

const DATA = Array.from({ length: 10 }).map((_, i) => ({
    id: String(i),
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
}));

const CarouselItem = ({ item, index, scrollX }: any) => {
    const animatedStyle = useAnimatedStyle(() => {
        const center = scrollX.value + width / 2 - ITEM_WIDTH / 2;
        const distance = Math.abs(center - index * ITEM_WIDTH);
        const scale = interpolate(
            distance,
            [0, width],
            [SCALE_MAX, SCALE_MIN],
            Extrapolate.CLAMP
        );
        return {
            transform: [{ scale }],
            zIndex: scale === SCALE_MAX ? 1 : 0,
        };
    });

    return (
        <Animated.View
            style={[
                {
                    width: ITEM_WIDTH,
                    marginHorizontal: 10,
                    height: 200,
                    borderRadius: 20,
                    backgroundColor: item.color,
                },
                animatedStyle,
            ]}
        />
    );
};

const Carousel3D = () => {
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Animated.FlatList
                data={DATA}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SPACING }}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => (
                    <CarouselItem item={item} index={index} scrollX={scrollX} />
                )}
            />
        </View>
    );
};

export default Carousel3D;

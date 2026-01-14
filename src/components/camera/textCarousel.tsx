import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolate,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.7;
const SPACING = (width - ITEM_WIDTH) / 2;
const SCALE_MAX = 1;
const SCALE_MIN = 0.85;

interface CarouselItem {
    title: string;
    text: string;
}

const carouselItems: CarouselItem[] = [
    { title: "Item 1", text: "Text 1" },
    { title: "Item 2", text: "Text 2" },
    { title: "Item 3", text: "Text 3" },
    { title: "Item 4", text: "Text 4" },
    { title: "Item 5", text: "Text 5" },
];

const TextCarouselItem = ({
                              item,
                              index,
                              scrollX,
                          }: {
    item: CarouselItem;
    index: number;
    scrollX: Animated.SharedValue<number>;
}) => {
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
        };
    });

    return (
        <Animated.View style={[styles.card, animatedStyle]}>
            {/*<Image*/}
            {/*    source={{ uri: "https://picsum.photos/270" }}*/}
            {/*    style={styles.image}*/}
            {/*/>*/}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.text}</Text>
        </Animated.View>
    );
};

const TextCarousel3D = () => {
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={carouselItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item, index }) => (
                    <TextCarouselItem
                        item={item}
                        index={index}
                        scrollX={scrollX}
                    />
                )}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: SPACING }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: ITEM_WIDTH,
        marginHorizontal: 10,
        height: 280,
        borderRadius: 15,
        backgroundColor: "#add8e6",
        alignItems: "center",
        padding: 10,
    },
    image: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 16,
        color: "#333",
    },
});

export default TextCarousel3D;

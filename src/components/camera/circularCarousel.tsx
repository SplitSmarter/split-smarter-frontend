import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';
import CarouselTextItem, { ListItemWidth } from '@/src/components/camera/CarouselTextItem';
// CircularCarousel.tsx
type CircularCarouselProps = {
    data: string[];
    onSelect?: (item: string) => void; // new
};

export const CircularCarousel: React.FC<CircularCarouselProps> = ({ data, onSelect }) => {
    const contentOffset = useSharedValue(0);
    const selectedIndex = useSharedValue(0);

    const [selectedItem, setSelectedItem] = useState(data[0]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            contentOffset.value = event.contentOffset.x;
        },
    });

    useAnimatedReaction(
        () => Math.round(contentOffset.value / ListItemWidth),
        (index, prevIndex) => {
            if (index !== prevIndex && data[index]) {
                runOnJS(setSelectedItem)(data[index]);
                runOnJS(onSelect || (() => {}))(data[index]); // notify parent
                selectedIndex.value = index;
            }
        }
    );

    return (
        <View className="w-full items-center justify-center">
            <Animated.FlatList
                data={data}
                keyExtractor={(_, index) => index.toString()}
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                snapToInterval={ListItemWidth}
                pagingEnabled
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: ListItemWidth * 1.5,
                }}
                renderItem={({ item, index }) => (
                    <CarouselTextItem
                        label={item}
                        index={index}
                        contentOffset={contentOffset}
                    />
                )}
            />
        </View>
    );
};

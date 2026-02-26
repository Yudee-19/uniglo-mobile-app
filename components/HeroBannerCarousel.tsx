import React, { useRef, useState } from "react";
import { Image, View, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const images = [
    require("../assets/images/banner/banner1.jpeg"),
    require("../assets/images/banner/banner2.jpeg"),
    require("../assets/images/banner/banner.jpeg"),
];

const HeroBannerCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const { width } = useWindowDimensions();

    const horizontalInset = 12; // px on left + right
    const carouselWidth = width - horizontalInset * 2;

    return (
        <View className="items-center">
            <Carousel
                ref={carouselRef}
                loop
                width={carouselWidth}
                height={250}
                autoPlay
                autoPlayInterval={3000}
                data={images}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({ item }) => (
                    <Image
                        source={item}
                        className="w-full h-full rounded-xl"
                        resizeMode="cover"
                    />
                )}
            />

            <View className="flex-row justify-center py-3">
                {images.map((_, index) => (
                    <View
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 ${
                            currentIndex === index ? "bg-black" : "bg-gray-300"
                        }`}
                    />
                ))}
            </View>
        </View>
    );
};

export default HeroBannerCarousel;

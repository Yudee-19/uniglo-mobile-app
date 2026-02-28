import { Diamond } from "@/services/diamondService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";

interface DiamondImageProps {
    diamond?: Diamond;
    showdefault?: boolean;
    showVideo?: boolean;
    showCarousel?: boolean;
    showStill?: boolean; // New prop added
}

export const DiamondImage = ({
    diamond,
    showdefault,
    showVideo = false,
    showCarousel = false,
    showStill = false,
}: DiamondImageProps) => {
    const [error, setError] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoLinkError, setVideoLinkError] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const rawImageUrls = diamond?.imageUrls || [];

    // Filter and sort the images
    const imageUrls = React.useMemo(() => {
        if (!rawImageUrls.length) return [];

        // 1. Filter out all URLs that contain "small"
        const filtered = rawImageUrls.filter((url) => !url.includes("small"));

        // 2. Find the index of the "still.jpg" image
        const stillIndex = filtered.findIndex((url) => url.includes("still"));

        // 3. If found and it's not already at the front, move it to index 0
        if (stillIndex > 0) {
            const [stillImage] = filtered.splice(stillIndex, 1);
            filtered.unshift(stillImage);
        }

        return filtered;
    }, [rawImageUrls]);

    const hasImages = imageUrls.length > 0;
    const hasMultipleImages = imageUrls.length > 1;
    const videoUrl = diamond?.videoUrls?.[0];
    const videoLink = diamond?.videoLink;
    const webLink = diamond?.webLink;

    // Isolate the exact "still" image, avoiding "still_small"
    const stillImageUrl = imageUrls.find(
        (url) => url.includes("still") && !url.includes("small"),
    );

    // Reset loading state when carousel image changes
    useEffect(() => {
        setIsLoading(true);
    }, [carouselIndex]);

    // Reusable loading spinner overlay
    const LoadingOverlay = () =>
        isLoading ? (
            <View className="absolute inset-0 flex items-center justify-center bg-transparent z-20">
                <ActivityIndicator size="large" color="#9ca3af" />
            </View>
        ) : null;

    // 1. Show video/360 HTML viewer in WebView if showVideo is true
    if (showVideo) {
        const activeVideoSrc =
            videoUrl && !videoError
                ? videoUrl
                : videoLink && !videoLinkError
                  ? videoLink
                  : null;

        if (activeVideoSrc) {
            return (
                <View className="relative flex-1 w-full h-full bg-white">
                    <LoadingOverlay />
                    <WebView
                        source={{ uri: activeVideoSrc }}
                        className="flex-1 w-full h-full bg-transparent"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            if (activeVideoSrc === videoUrl) {
                                setVideoError(true);
                            } else {
                                setVideoLinkError(true);
                            }
                            setIsLoading(true);
                        }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                    />
                </View>
            );
        }

        return (
            <View className="flex-1 w-full h-full items-center justify-center">
                <Text className="text-sm font-medium text-gray-400">
                    No Video
                </Text>
            </View>
        );
    }

    // 2. Show carousel if requested, multiple images exist, AND showStill is false
    if (showCarousel && hasMultipleImages && !showStill) {
        return (
            <View className="relative flex-1 w-full h-full items-center justify-center">
                <LoadingOverlay />
                <Image
                    source={{ uri: imageUrls[carouselIndex] }}
                    className="w-full h-full"
                    resizeMode="contain"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setError(true);
                        setIsLoading(false);
                    }}
                />

                {/* Previous Button */}
                <TouchableOpacity
                    onPress={() =>
                        setCarouselIndex((prev) =>
                            prev === 0 ? imageUrls.length - 1 : prev - 1,
                        )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={16} color="#374151" />
                </TouchableOpacity>

                {/* Next Button */}
                <TouchableOpacity
                    onPress={() =>
                        setCarouselIndex((prev) =>
                            prev === imageUrls.length - 1 ? 0 : prev + 1,
                        )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#374151"
                    />
                </TouchableOpacity>

                {/* Dots Indicator */}
                <View className="absolute bottom-3 flex-row justify-center w-full z-30 space-x-1.5">
                    {imageUrls.map((_, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => setCarouselIndex(idx)}
                            className={`w-2 h-2 rounded-full mx-1 ${
                                idx === carouselIndex
                                    ? "bg-gray-800"
                                    : "bg-gray-300"
                            }`}
                        />
                    ))}
                </View>
            </View>
        );
    }

    // 3. Show single image (Prioritize specific still image if prop is true, then default)
    const src =
        showStill && stillImageUrl
            ? stillImageUrl
            : hasImages
              ? imageUrls[0]
              : webLink;

    if (!src || error) {
        if (showdefault) {
            return (
                <View className="flex-1 w-full h-full items-center justify-center">
                    <Ionicons
                        name="diamond-outline"
                        size={32}
                        color="#9ca3af"
                    />
                </View>
            );
        }
        return (
            <View className="flex-1 w-full h-full items-center justify-center">
                <Text className="text-sm font-medium text-gray-400">
                    No Image
                </Text>
            </View>
        );
    }

    return (
        <View className="relative flex-1 w-full h-full">
            <LoadingOverlay />
            <Image
                source={{ uri: src }}
                className="w-full h-full"
                resizeMode="contain"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
            />
        </View>
    );
};

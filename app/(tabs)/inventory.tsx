import { DiamondCard } from "@/components/inventory/DiamondCard";
import { DiamondCardSkeleton } from "@/components/inventory/DiamondCardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useDiamondFilters } from "@/hooks/useDiamondFilters";
import { CLARITIES, COLORS, FINISHES, SHAPES } from "@/types/diamond.types";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SORT_OPTIONS = [
    { label: "Recent", value: "recent" },
    { label: "Carat: Low to High", value: "weight-asc" },
    { label: "Carat: High to Low", value: "weight-desc" },
    { label: "List Price: Low to High", value: "priceListUSD-asc" },
    { label: "List Price: High to Low", value: "priceListUSD-desc" },
    { label: "Price Per Carat: Low to High", value: "pricePerCts-asc" },
    { label: "Price Per Carat: High to Low", value: "pricePerCts-desc" },
    { label: "Discount: Low to High", value: "discPerc-asc" },
    { label: "Discount: High to Low", value: "discPerc-desc" },
];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function InventoryScreen() {
    const { isAuthenticated } = useAuth();
    const {
        filters,
        diamonds,
        loading,
        totalCount,
        toggleFilter,
        updateFilter,
        resetFilters,
        hasActiveFilters,
    } = useDiamondFilters();

    const [showFilters, setShowFilters] = useState(false);
    const [filterAnimation] = useState(new Animated.Value(0));
    const [showSortModal, setShowSortModal] = useState(false);
    const [selectedSort, setSelectedSort] = useState("recent");
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // Sync selectedSort with filter state
    useEffect(() => {
        if (filters.sortBy && filters.sortOrder) {
            setSelectedSort(`${filters.sortBy}-${filters.sortOrder}`);
        } else {
            setSelectedSort("recent");
        }
    }, [filters.sortBy, filters.sortOrder]);

    // Animate modal
    useEffect(() => {
        if (showSortModal) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [showSortModal]);

    const toggleFilters = () => {
        const toValue = showFilters ? 0 : 1;
        Animated.timing(filterAnimation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setShowFilters(!showFilters);
    };

    const filterHeight = filterAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1000],
    });

    const handleSortChange = (value: string) => {
        setSelectedSort(value);
        if (value === "recent") {
            updateFilter("sortBy", undefined);
            updateFilter("sortOrder", undefined);
        } else {
            const [field, order] = value.split("-");
            updateFilter("sortBy", field);
            updateFilter("sortOrder", order as "asc" | "desc");
        }
        setShowSortModal(false);
    };

    const getCurrentSortLabel = () => {
        return (
            SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label ||
            "Recent"
        );
    };

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <View className="flex-1 ">
            {/* Header */}
            <View className="px-4  pb-2 bg-white border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-2xl  text-primary-purple font-loraBold">
                            Find Your Diamond
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            Search over 15,000+ GIA certified premium stones
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={toggleFilters}
                        className="w-10 h-10 items-center justify-center rounded-full border border-gray-300"
                    >
                        <Ionicons
                            name="filter-outline"
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 bg-gray-50">
                {/* Collapsible Filters Section */}
                <Animated.View
                    style={{
                        maxHeight: filterHeight,
                        overflow: "hidden",
                    }}
                >
                    {/* Shape Selection */}
                    <View className="px-4 py-4 bg-white mb-2">
                        <Text className="text-sm font-semibold text-yellow-700 mb-3">
                            SELECT SHAPE
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                gap: 8,
                                paddingVertical: 4,
                            }}
                        >
                            {SHAPES.map((shape) => (
                                <TouchableOpacity
                                    key={shape.value}
                                    onPress={() =>
                                        toggleFilter("shape", shape.value)
                                    }
                                    className={`w-20 aspect-square items-center justify-center rounded-lg border-2 ${
                                        filters.shape.includes(shape.value)
                                            ? "border-yellow-500 bg-yellow-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <Text className="text-xs text-center mt-1">
                                        {shape.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Carat Weight */}
                    <View className="px-4 py-4 bg-white mb-2">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-sm font-semibold text-yellow-700">
                                CARAT WEIGHT
                            </Text>
                            <Text className="text-sm font-medium text-gray-700">
                                {filters.caratRange[0].toFixed(2)} -{" "}
                                {filters.caratRange[1].toFixed(2)}
                            </Text>
                        </View>
                        <Slider
                            value={filters.caratRange}
                            onValueChange={(value) => {
                                if (Array.isArray(value)) {
                                    updateFilter(
                                        "caratRange",
                                        value as [number, number],
                                    );
                                }
                            }}
                            minimumValue={0.1}
                            maximumValue={10.99}
                            step={0.01}
                            minimumTrackTintColor="#EAB308"
                            maximumTrackTintColor="#E5E7EB"
                            thumbTintColor="#EAB308"
                            trackStyle={{ height: 4, borderRadius: 2 }}
                            thumbStyle={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                            }}
                        />
                    </View>

                    {/* Color */}
                    <View className="px-4 py-4 bg-white mb-2">
                        <Text className="text-sm font-semibold text-yellow-700 mb-3">
                            COLOR
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                gap: 8,
                                paddingVertical: 4,
                            }}
                        >
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => toggleFilter("color", color)}
                                    className={`px-4 py-2 rounded-full border ${
                                        filters.color.includes(color)
                                            ? "border-yellow-500 bg-yellow-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${
                                            filters.color.includes(color)
                                                ? "text-yellow-700"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {color}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Clarity */}
                    <View className="px-4 py-4 bg-white mb-2">
                        <Text className="text-sm font-semibold text-yellow-700 mb-3">
                            CLARITY
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                gap: 8,
                                paddingVertical: 4,
                            }}
                        >
                            {CLARITIES.map((clarity) => (
                                <TouchableOpacity
                                    key={clarity}
                                    onPress={() =>
                                        toggleFilter("clarity", clarity)
                                    }
                                    className={`px-4 py-2 rounded-full border ${
                                        filters.clarity.includes(clarity)
                                            ? "border-yellow-500 bg-yellow-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${
                                            filters.clarity.includes(clarity)
                                                ? "text-yellow-700"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {clarity}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Finish */}
                    <View className="px-4 py-4 bg-white mb-2">
                        <Text className="text-sm font-semibold text-yellow-700 mb-3">
                            FINISH
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {FINISHES.map((finish) => (
                                <TouchableOpacity
                                    key={finish}
                                    onPress={() =>
                                        toggleFilter("cutGrade", finish)
                                    }
                                    className={`px-4 py-2 rounded-full border ${
                                        filters.cutGrade.includes(finish)
                                            ? "border-yellow-500 bg-yellow-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${
                                            filters.cutGrade.includes(finish)
                                                ? "text-yellow-700"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {finish}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>

                {/* Diamond Count and Sort/Reset */}
                <View className="px-4 py-3 bg-white mb-2 flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">
                        Diamonds Available:{" "}
                        <Text className="font-semibold text-gray-900">
                            {totalCount.toLocaleString()}
                        </Text>
                    </Text>
                    <View className="flex-row items-center gap-2">
                        {/* Reset Filters Button */}
                        <TouchableOpacity
                            onPress={resetFilters}
                            disabled={!hasActiveFilters}
                            className={`p-2 rounded-full ${
                                hasActiveFilters
                                    ? "bg-red-50"
                                    : "bg-gray-100 opacity-50"
                            }`}
                        >
                            <Ionicons
                                name="refresh-outline"
                                size={18}
                                color={hasActiveFilters ? "#49214c" : "#9CA3AF"}
                            />
                        </TouchableOpacity>

                        {/* Sort Dropdown */}
                        <TouchableOpacity
                            onPress={() => setShowSortModal(true)}
                            className="flex-row items-center gap-1"
                        >
                            <Text className="text-sm text-yellow-600 font-medium">
                                {getCurrentSortLabel()}
                            </Text>
                            <Fontisto
                                name="arrow-swap"
                                size={12}
                                color="#CA8A04"
                                className="rotate-90"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Diamond List */}
                <View className="px-4 py-2">
                    {loading ? (
                        <>
                            {[...Array(5)].map((_, index) => (
                                <DiamondCardSkeleton key={index} />
                            ))}
                        </>
                    ) : (
                        diamonds.map((diamond) => (
                            <DiamondCard key={diamond._id} diamond={diamond} />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                    className="flex-1 bg-black/50 justify-end"
                >
                    <Animated.View
                        style={{
                            transform: [{ translateY: slideAnim }],
                        }}
                        className="bg-white rounded-t-3xl"
                    >
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900 text-center">
                                Sort By
                            </Text>
                        </View>
                        <ScrollView className="max-h-96">
                            {SORT_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() =>
                                        handleSortChange(option.value)
                                    }
                                    className={`px-6 py-4 border-b border-gray-100 ${
                                        selectedSort === option.value
                                            ? "bg-yellow-50"
                                            : ""
                                    }`}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <Text
                                            className={`text-base ${
                                                selectedSort === option.value
                                                    ? "text-yellow-700 font-semibold"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {option.label}
                                        </Text>
                                        {selectedSort === option.value && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={24}
                                                color="#EAB308"
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            onPress={() => setShowSortModal(false)}
                            className="p-4 border-t border-gray-200"
                        >
                            <Text className="text-center text-gray-600 font-medium">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

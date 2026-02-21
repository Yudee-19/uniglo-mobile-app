import { useAuth } from "@/context/AuthContext";
import { useDiamondFilters } from "@/hooks/useDiamondFilters";
import { Diamond, PublicDiamond } from "@/services/diamondService";
import { CLARITIES, COLORS, FINISHES, SHAPES } from "@/types/diamond.types";
import { Redirect } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    } = useDiamondFilters();

    const [showFilters, setShowFilters] = useState(false);

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">
                    Find Your Diamond
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                    Search over 15,000+ GIA certified premium stones
                </Text>
            </View>

            {/* Diamond Type Selector */}
            {/* <View className="bg-purple-900 flex-row">
                <TouchableOpacity
                    onPress={() => updateFilter("isNatural", true)}
                    className={`flex-1 py-3 ${
                        filters.isNatural === true
                            ? "border-b-2 border-yellow-500"
                            : ""
                    }`}
                >
                    <Text
                        className={`text-center font-semibold ${
                            filters.isNatural === true
                                ? "text-yellow-500"
                                : "text-white"
                        }`}
                    >
                        Natural Diamonds
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateFilter("isNatural", false)}
                    className={`flex-1 py-3 ${
                        filters.isNatural === false
                            ? "border-b-2 border-yellow-500"
                            : ""
                    }`}
                >
                    <Text
                        className={`text-center font-semibold ${
                            filters.isNatural === false
                                ? "text-yellow-500"
                                : "text-white"
                        }`}
                    >
                        Lab Diamonds
                    </Text>
                </TouchableOpacity>
            </View> */}

            {/* Color Type Selector */}
            {/* <View className="bg-white flex-row border-b border-gray-200">
                <TouchableOpacity
                    onPress={() => updateFilter("colorType", "white")}
                    className={`flex-1 py-3 ${
                        filters.colorType === "white"
                            ? "border-b-2 border-yellow-500"
                            : ""
                    }`}
                >
                    <Text
                        className={`text-center font-semibold ${
                            filters.colorType === "white"
                                ? "text-yellow-600"
                                : "text-gray-600"
                        }`}
                    >
                        White Diamonds
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateFilter("colorType", "fancy")}
                    className={`flex-1 py-3 ${
                        filters.colorType === "fancy"
                            ? "border-b-2 border-yellow-500"
                            : ""
                    }`}
                >
                    <Text
                        className={`text-center font-semibold ${
                            filters.colorType === "fancy"
                                ? "text-yellow-600"
                                : "text-gray-600"
                        }`}
                    >
                        Fancy Color
                    </Text>
                </TouchableOpacity>
            </View> */}

            <ScrollView className="flex-1 bg-gray-50">
                {/* Shape Selection */}
                <View className="px-4 py-4 bg-white mb-2">
                    <Text className="text-sm font-semibold text-yellow-700 mb-3">
                        SELECT SHAPE
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
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
                </View>

                {/* Color */}
                <View className="px-4 py-4 bg-white mb-2">
                    <Text className="text-sm font-semibold text-yellow-700 mb-3">
                        COLOR
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
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
                        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                    >
                        {CLARITIES.map((clarity) => (
                            <TouchableOpacity
                                key={clarity}
                                onPress={() => toggleFilter("clarity", clarity)}
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
                                onPress={() => toggleFilter("cutGrade", finish)}
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

                {/* Diamond Count */}
                <View className="px-4 py-3 bg-white mb-2 flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">
                        Diamonds Available:{" "}
                        <Text className="font-semibold text-gray-900">
                            {totalCount.toLocaleString()}
                        </Text>
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-sm text-yellow-600 font-medium">
                            Sort by Price
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Diamond List */}
                {loading ? (
                    <View className="py-20">
                        <ActivityIndicator size="large" color="#8B5A9C" />
                    </View>
                ) : (
                    <View className="px-4 py-2">
                        {diamonds.map((diamond) => (
                            <DiamondCard
                                key={
                                    "_id" in diamond
                                        ? diamond._id
                                        : diamond.stockRef
                                }
                                diamond={diamond}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function DiamondCard({ diamond }: { diamond: Diamond | PublicDiamond }) {
    return (
        <View className="bg-white rounded-lg p-4 mb-3 flex-row shadow-sm border border-gray-200">
            <View className="w-20 h-20 bg-gray-100 rounded-lg mr-4">
                {diamond.webLink && (
                    <Image
                        source={{ uri: diamond.webLink }}
                        className="w-full h-full rounded-lg"
                        resizeMode="contain"
                    />
                )}
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                    {diamond.shape} {diamond.weight} CT {diamond.color}{" "}
                    {diamond.clarity} {diamond.cutGrade}
                </Text>
                <Text className="text-xs text-gray-600 mb-2">
                    {diamond.lab} • T:{diamond.tablePerc}% D:{diamond.depthPerc}
                    % R:1.21
                </Text>
                <Text className="text-xs text-gray-500">
                    Measurement: {diamond.measurements}
                </Text>
            </View>
        </View>
    );
}

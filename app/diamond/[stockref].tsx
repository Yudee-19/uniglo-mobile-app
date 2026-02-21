import { useAuth } from "@/context/AuthContext";
import {
    Diamond,
    PublicDiamond,
    searchDiamonds,
} from "@/services/diamondService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function DetailRow({
    label,
    value,
}: {
    label: string;
    value?: string | number;
}) {
    if (!value) return null;
    return (
        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500 font-lato">{label}</Text>
            <Text className="text-sm font-latoBold text-gray-900">{value}</Text>
        </View>
    );
}

function DiamondDetailSkeleton() {
    return (
        <View className="flex-1 bg-white">
            <View className="w-full h-64 bg-gray-200 animate-pulse" />
            <View className="p-4 gap-3">
                <View className="h-7 bg-gray-200 rounded animate-pulse w-3/4" />
                <View className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                <View className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
                <View className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
                <View className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
            </View>
        </View>
    );
}

export default function DiamondDetailScreen() {
    const { stockref } = useLocalSearchParams<{ stockref: string }>();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [diamond, setDiamond] = useState<Diamond | PublicDiamond | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDiamond = async () => {
            if (!stockref) return;
            setLoading(true);
            setError(null);
            try {
                const result = await searchDiamonds(
                    { searchTerm: stockref, limit: 1 },
                    isAuthenticated,
                );
                if (result.data.length > 0) {
                    setDiamond(result.data[0]);
                } else {
                    setError("Diamond not found");
                }
            } catch (err) {
                setError("Failed to load diamond details");
            } finally {
                setLoading(false);
            }
        };

        fetchDiamond();
    }, [stockref, isAuthenticated]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 items-center justify-center rounded-full border border-gray-200 mr-3"
                >
                    <Ionicons name="arrow-back" size={20} color="#49214c" />
                </TouchableOpacity>
                <Text className="text-lg font-latoBold text-primary-purple flex-1">
                    {stockref}
                </Text>
            </View>

            {loading ? (
                <DiamondDetailSkeleton />
            ) : error || !diamond ? (
                <View className="flex-1 items-center justify-center gap-3">
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="#9CA3AF"
                    />
                    <Text className="text-gray-500 font-lato text-base">
                        {error ?? "Diamond not found"}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="px-6 py-2 bg-primary-purple rounded-full"
                    >
                        <Text className="text-white font-latoBold">
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1">
                    {/* Diamond Image */}
                    <View className="w-full h-64 bg-gray-50 items-center justify-center">
                        {diamond.webLink ? (
                            <Image
                                source={{ uri: diamond.webLink }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        ) : (
                            <Ionicons
                                name="diamond-outline"
                                size={80}
                                color="#E5E7EB"
                            />
                        )}
                    </View>

                    {/* Title */}
                    <View className="px-4 pt-4 pb-2 border-b border-gray-100">
                        <Text className="text-xl font-latoBold text-primary-purple">
                            {diamond.shape} {diamond.weight} CT {diamond.color}{" "}
                            {diamond.clarity} {diamond.cutGrade}
                        </Text>
                        <Text className="text-sm text-gray-500 font-lato mt-1">
                            {diamond.stockRef} • {diamond.lab}
                        </Text>
                    </View>

                    {/* Price (authenticated only) */}
                    {"priceListUSD" in diamond && (
                        <View className="px-4 py-3 bg-yellow-50 mx-4 mt-4 rounded-lg border border-yellow-200">
                            <Text className="text-xs text-yellow-700 font-lato mb-1">
                                LIST PRICE
                            </Text>
                            <Text className="text-2xl font-latoBold text-primary-purple">
                                ${diamond.priceListUSD?.toLocaleString()}
                            </Text>
                            <Text className="text-sm text-gray-500 font-lato mt-1">
                                ${diamond.pricePerCts?.toLocaleString()} / ct
                                {"discPerc" in diamond && diamond.discPerc && (
                                    <Text className="text-green-600">
                                        {" "}
                                        • {diamond.discPerc}% disc
                                    </Text>
                                )}
                            </Text>
                        </View>
                    )}

                    {/* Specifications */}
                    <View className="px-4 py-2 mt-4">
                        <Text className="text-sm font-latoBold text-gray-400 mb-2 uppercase tracking-widest">
                            Specifications
                        </Text>
                        <DetailRow label="Shape" value={diamond.shape} />
                        <DetailRow
                            label="Carat Weight"
                            value={`${diamond.weight} ct`}
                        />
                        <DetailRow label="Color" value={diamond.color} />
                        <DetailRow label="Clarity" value={diamond.clarity} />
                        <DetailRow label="Cut Grade" value={diamond.cutGrade} />
                        <DetailRow label="Polish" value={diamond.polish} />
                        <DetailRow label="Symmetry" value={diamond.symmetry} />
                        <DetailRow
                            label="Fluorescence"
                            value={diamond.fluorescenceIntensity}
                        />
                        <DetailRow label="Lab" value={diamond.lab} />
                        <DetailRow
                            label="Certificate No."
                            value={
                                "certiNo" in diamond
                                    ? diamond.certiNo
                                    : undefined
                            }
                        />
                        <DetailRow
                            label="Measurements"
                            value={diamond.measurements}
                        />
                        <DetailRow
                            label="Table %"
                            value={`${diamond.tablePerc}%`}
                        />
                        <DetailRow
                            label="Depth %"
                            value={`${diamond.depthPerc}%`}
                        />
                        <DetailRow
                            label="Length"
                            value={`${diamond.length} mm`}
                        />
                        <DetailRow
                            label="Width"
                            value={`${diamond.width} mm`}
                        />
                        <DetailRow
                            label="Height"
                            value={`${diamond.height} mm`}
                        />
                    </View>
                    <Text>{JSON.stringify(diamond)}</Text>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

import { Diamond } from "@/services/diamondService";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface DiamondCardProps {
    diamond: Diamond;
}

export function DiamondCard({ diamond }: DiamondCardProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() =>
                router.push({
                    pathname: "/diamond/[stockref]",
                    params: { stockref: diamond.stockRef },
                })
            }
            className="bg-white rounded-lg p-4 mb-3 flex-row shadow-sm border border-gray-200 active:opacity-70"
        >
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
                <Text className="text-lg text-primary-purple font-latoBold mb-1">
                    {diamond.shape} {diamond.weight} CT {diamond.color}{" "}
                    {diamond.clarity} {diamond.cutGrade}
                </Text>
                <Text className="text-sm text-gray-600 font-lato mb-2">
                    {diamond.stockRef} • {diamond.lab} • T:{diamond.tablePerc}%
                    {"  "}D:{diamond.depthPerc}%
                </Text>
                <Text className="text-sm text-gray-500 font-lato">
                    Measurement: {diamond.measurements}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

import { Diamond, PublicDiamond } from "@/services/diamondService";
import { Image, Text, View } from "react-native";

interface DiamondCardProps {
    diamond: Diamond | PublicDiamond;
}

export function DiamondCard({ diamond }: DiamondCardProps) {
    return (
        <View className="bg-white rounded-lg p-4 mb-3 flex-row shadow-sm border border-gray-200">
            <View className="w-20 h-20 bg-gray-100 rounded-lg mr-6">
                {diamond.webLink && (
                    <Image
                        source={{ uri: diamond.webLink }}
                        className="w-full h-full rounded-lg"
                        resizeMode="contain"
                    />
                )}
            </View>
            <View className="flex-1">
                <Text className="text-lg  text-primary-purple font-latoBold  mb-1">
                    {diamond.shape} {diamond.weight} CT {diamond.color}{" "}
                    {diamond.clarity} {diamond.cutGrade}
                </Text>
                <Text className="text-sm text-gray-600 font-lato mb-2">
                    {diamond.stockRef} • {diamond.lab} • T:{diamond.tablePerc}%
                    {"  "}
                    D:
                    {diamond.depthPerc}%
                </Text>
                <Text className="text-sm text-gray-500 font-lato">
                    Measurement: {diamond.measurements}
                </Text>
            </View>
        </View>
    );
}

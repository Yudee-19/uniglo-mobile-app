import { View } from "react-native";

export function DiamondCardSkeleton() {
    return (
        <View className="bg-white rounded-lg p-4 mb-3 flex-row shadow-sm border border-gray-200">
            <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4 animate-pulse" />
            <View className="flex-1 justify-between">
                <View className="flex flex-col gap-2">
                    <View className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                    <View className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    <View className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </View>
            </View>
        </View>
    );
}

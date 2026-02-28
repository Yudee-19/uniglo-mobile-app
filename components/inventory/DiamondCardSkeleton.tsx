import { View } from "react-native";

export function DiamondCardSkeleton() {
    return (
        <View className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
            {/* Header Skeleton */}
            <View className="flex-row justify-between items-center p-3 border-b border-gray-100">
                <View className="h-4 bg-gray-200 rounded animate-pulse w-3/5" />
                <View className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
            </View>

            {/* Body Skeleton */}
            <View className="flex-row p-3">
                {/* Column 1 Skeleton */}
                <View className="flex-[1.4] pr-1 justify-between gap-y-3">
                    <View className="flex-row items-center">
                        <View className="h-3 w-8 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded mr-2 animate-pulse" />
                    </View>
                    <View className="flex-row items-center">
                        <View className="h-3 w-8 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded mr-2 animate-pulse" />
                    </View>
                    <View className="flex-row items-center">
                        <View className="h-3 w-8 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded mr-2 animate-pulse" />
                    </View>
                </View>

                {/* Column 2 Skeleton */}
                <View className="flex-[0.9] justify-between gap-y-3">
                    <View className="flex-row items-center">
                        <View className="h-3 w-4 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded mr-2 animate-pulse" />
                    </View>
                    <View className="flex-row items-center">
                        <View className="h-3 w-4 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded mr-2 animate-pulse" />
                    </View>
                    <View className="flex-row items-center">
                        <View className="h-3 w-6 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded mr-2 animate-pulse" />
                    </View>
                </View>

                {/* Vertical Divider Line */}
                <View className="w-[1px] bg-gray-100 mx-2" />

                {/* Column 3 Skeleton */}
                <View className="flex-[1.2] justify-between gap-y-3">
                    <View className="flex-row justify-between items-center">
                        <View className="h-3 w-10 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded animate-pulse" />
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View className="h-3 w-12 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded animate-pulse" />
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View className="h-3 w-12 bg-gray-100 rounded mr-2 animate-pulse" />
                        <View className="h-3 flex-1 bg-gray-200 rounded animate-pulse" />
                    </View>
                </View>
            </View>
        </View>
    );
}

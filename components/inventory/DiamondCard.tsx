import { Diamond } from "@/services/diamondService";
import { SHAPES } from "@/types/diamond.types";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface DiamondCardProps {
    diamond: Diamond;
}

export function DiamondCard({ diamond }: DiamondCardProps) {
    const router = useRouter();

    // Helper to get the full uppercase shape name (e.g., "RD" -> "ROUND")
    const getShapeName = (code: string) => {
        const shapeObj = SHAPES.find((s) => s.value === code);
        return shapeObj ? shapeObj.label.toUpperCase() : code.toUpperCase();
    };

    // Format the top header string dynamically
    const headerDetails = [
        getShapeName(diamond.shape),
        diamond.weight?.toFixed(2),
        diamond.color,
        diamond.clarity,
        diamond.lab,
        diamond.fluorescenceColor || "NON",
    ]
        .filter(Boolean)
        .join(" | ");

    const ratio =
        diamond.length && diamond.width
            ? (diamond.length / diamond.width).toFixed(2)
            : null;

    return (
        <TouchableOpacity
            onPress={() =>
                router.push({
                    pathname: "/diamond/[stockref]",
                    params: { stockref: diamond.stockRef },
                })
            }
            activeOpacity={0.7}
            className="bg-white rounded-lg border border-primary-purple/60 mb-1 overflow-hidden"
        >
            {/* Top Header Row */}
            <View className="flex-row justify-between items-center p-3 border-b border-primary-purple/60 font-lato">
                <Text className="font-bold text-black text-sm tracking-wider">
                    {headerDetails}
                </Text>
                <Text className="font-bold text-black text-sm">
                    {diamond.stockRef}
                </Text>
            </View>

            {/* Details Body */}
            <View className="flex-row p-3">
                {/* Column 1: Specs */}
                <View className="flex-[1.4] pr-1">
                    <View className="flex-row mb-2">
                        <Text className="text-gray-400 text-sm w-11">
                            C-P-S
                        </Text>
                        <Text className="font-bold text-black text-sm">
                            {diamond.cutGrade || "-"}-{diamond.polish || "-"}-
                            {diamond.symmetry || "-"}
                        </Text>
                    </View>
                    <View className="flex-row mb-2">
                        <Text className="text-gray-400 text-sm w-11">MEAS</Text>
                        <Text
                            className="font-bold text-black text-sm"
                            numberOfLines={1}
                        >
                            {diamond.measurements || "-"}
                        </Text>
                    </View>
                    <View className="flex-row">
                        <Text className="text-gray-400 text-sm w-11">
                            RATIO
                        </Text>
                        <Text className="font-bold text-black text-sm">
                            {ratio || "-"}
                        </Text>
                    </View>
                </View>

                {/* Column 2: Proportions & Location */}
                <View className="flex-[0.9]">
                    <View className="flex-row mb-2">
                        <Text className="text-gray-400 text-sm w-8">T</Text>
                        <Text className="font-bold text-black text-sm">
                            {diamond.tablePerc?.toFixed(2) || "-"} %
                        </Text>
                    </View>
                    <View className="flex-row mb-2">
                        <Text className="text-gray-400 text-sm w-8">D</Text>
                        <Text className="font-bold text-black text-sm">
                            {diamond.depthPerc?.toFixed(2) || "-"} %
                        </Text>
                    </View>
                    <View className="flex-row">
                        <Text className="text-gray-400 text-sm w-8">LOC</Text>
                        <Text className="font-bold text-black text-sm  flex flex-col ">
                            {diamond.country.includes(" ")
                                ? diamond.country.split(" ")[0] +
                                  " " +
                                  diamond.country.split(" ")[1]
                                : diamond.country}
                        </Text>
                    </View>
                </View>

                {/* Vertical Divider Line */}
                <View className="w-[1px] bg-primary-purple mx-2 opacity-80" />

                {/* Column 3: Pricing */}
                <View className="flex-[1.2]">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400 text-sm">$/CTS:</Text>
                        <Text className="font-bold text-primary-purple text-sm">
                            {diamond.pricePerCts?.toFixed(2) || "-"}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400 text-sm">DISC(%):</Text>
                        <Text
                            className={`font-bold ${diamond.discPerc && diamond.discPerc < 0 ? "text-red-600" : "text-green-600"} text-sm`}
                        >
                            {diamond.discPerc?.toFixed(2) || "-"}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">$TOTAL:</Text>
                        <Text className="font-bold text-black text-sm">
                            {diamond.priceListUSD?.toFixed(2) || "-"}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

import { addToCart, holdDiamond } from "@/services/cartServices";
import { Diamond, fetchDiamondById } from "@/services/diamondService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../(tabs)/_layout";

// ─── Helper Components ────────────────────────────────────────────────────────

function DetailRow({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) {
    return (
        <View className="flex-row border-b border-gray-100">
            <View className="flex-1 py-2 px-3 border-r border-gray-100">
                <Text className="text-xs text-gray-500 font-lato">{label}</Text>
            </View>
            <View className="flex-1 py-2 px-3">
                <Text className="text-xs font-latoBold text-gray-800 text-right">
                    {value ?? "-"}
                </Text>
            </View>
        </View>
    );
}

function SectionTable({
    title,
    rows,
}: {
    title: string;
    rows: { label: string; value?: string | number | null }[];
}) {
    return (
        <View className="mb-4 border border-gray-200 rounded-sm overflow-hidden">
            <View className="bg-[#26062b] px-4 py-2">
                <Text className="text-white text-sm font-latoBold uppercase tracking-wide">
                    {title}
                </Text>
            </View>
            <View className="bg-white">
                {rows.map((row, idx) => (
                    <DetailRow key={idx} label={row.label} value={row.value} />
                ))}
            </View>
        </View>
    );
}

function InfoCard({
    icon,
    title,
    subtitle,
}: {
    icon: string;
    title: string;
    subtitle: string;
}) {
    return (
        <View className="flex-1 border border-gray-200 rounded-lg p-3 gap-1">
            <Ionicons name={icon as any} size={18} color="#26062b" />
            <Text className="text-xs text-gray-500 font-lato mt-1">
                {title}
            </Text>
            <Text className="text-sm font-latoBold text-gray-900">
                {subtitle}
            </Text>
        </View>
    );
}

function DiamondDetailSkeleton() {
    return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#49214c" />
            <Text className="text-gray-500 font-lato mt-3 text-sm">
                Loading Diamond Details...
            </Text>
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DiamondDetailScreen() {
    const { stockref } = useLocalSearchParams<{ stockref: string }>();
    const router = useRouter();

    const [diamond, setDiamond] = useState<Diamond | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [holdingDiamond, setHoldingDiamond] = useState(false);

    useEffect(() => {
        const loadDiamond = async () => {
            if (!stockref) return;
            setLoading(true);
            setError(null);
            try {
                const result = await fetchDiamondById(
                    decodeURIComponent(stockref),
                );
                setDiamond(result.diamond);
            } catch (err) {
                setError("Failed to load diamond details");
            } finally {
                setLoading(false);
            }
        };
        loadDiamond();
    }, [stockref]);

    const handleAddToCart = async () => {
        if (!diamond?._id) return;
        setAddingToCart(true);
        try {
            await addToCart([diamond._id]);
            Alert.alert("Success", "Diamond added to cart successfully!");
        } catch (err) {
            Alert.alert(
                "Error",
                typeof err === "string"
                    ? err
                    : "Failed to add diamond to cart.",
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleHoldDiamond = async () => {
        if (!diamond?.stockRef) return;
        setHoldingDiamond(true);
        try {
            await holdDiamond(diamond.stockRef);
            Alert.alert("Success", "Diamond is now on hold!");
        } catch (err) {
            Alert.alert(
                "Error",
                typeof err === "string" ? err : "Failed to hold diamond.",
            );
        } finally {
            setHoldingDiamond(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppHeader />
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 items-center justify-center rounded-full border border-gray-200 mr-3"
                >
                    <Ionicons name="arrow-back" size={20} color="#49214c" />
                </TouchableOpacity>
                <Text
                    className="text-base font-latoBold text-[#49214c] flex-1"
                    numberOfLines={1}
                >
                    {stockref}
                </Text>
            </View>

            {/* Content */}
            {loading ? (
                <DiamondDetailSkeleton />
            ) : error || !diamond ? (
                <View className="flex-1 items-center justify-center gap-3 px-6">
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="#9CA3AF"
                    />
                    <Text className="text-gray-500 font-lato text-base text-center">
                        {error ?? "Diamond not found"}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="px-6 py-2 bg-[#49214c] rounded-full mt-2"
                    >
                        <Text className="text-white font-latoBold">
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Diamond Image ── */}
                    <View className="w-full aspect-square bg-gray-50 items-center justify-center border-b border-gray-100">
                        {diamond.webLink ? (
                            <Image
                                source={{ uri: diamond.webLink }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        ) : (
                            <Ionicons
                                name="diamond-outline"
                                size={100}
                                color="#E5E7EB"
                            />
                        )}
                    </View>

                    <View className="px-4 pt-4">
                        {/* ── Title & Subtitle ── */}
                        <View className="mb-1">
                            <Text className="text-xs text-gray-400 font-lato uppercase tracking-widest mb-1">
                                Diamond Details
                            </Text>
                            <Text className="text-xl font-latoBold text-gray-900">
                                {diamond.shape} {diamond.weight} ct.{" "}
                                {diamond.cutGrade} {diamond.color}{" "}
                                {diamond.clarity}
                            </Text>
                        </View>

                        {/* ── Price ── */}
                        {diamond.priceListUSD ? (
                            <View className="flex-row items-baseline gap-2 mb-4">
                                <Text className="text-lg font-latoBold text-gray-900">
                                    ${diamond.priceListUSD.toLocaleString()} USD
                                </Text>
                            </View>
                        ) : null}

                        {/* ── Basic Info Cards ── */}
                        <Text className="text-sm font-latoBold text-gray-700 mb-2">
                            Basic Information
                        </Text>
                        <View className="flex-row gap-2 mb-2">
                            <InfoCard
                                icon="shapes-outline"
                                title="Round Shape"
                                subtitle={diamond.shape ?? "-"}
                            />
                            <InfoCard
                                icon="scale-outline"
                                title="Carat"
                                subtitle={
                                    diamond.weight
                                        ? `${diamond.weight} Carat`
                                        : "-"
                                }
                            />
                        </View>
                        <View className="flex-row gap-2 mb-5">
                            <InfoCard
                                icon="color-palette-outline"
                                title={`Color ${diamond.color}`}
                                subtitle="Grades diamond's whiteness and purity."
                            />
                            <InfoCard
                                icon="eye-outline"
                                title={`Clarity ${diamond.clarity}`}
                                subtitle="Reveals internal and external flaws."
                            />
                        </View>

                        {/* ── ADD TO CART & HOLD Buttons ── */}
                        <View className="flex-row gap-2 mb-3">
                            <TouchableOpacity
                                className="bg-[#c9a84c] py-3 rounded-sm items-center flex-1"
                                activeOpacity={0.85}
                                onPress={handleAddToCart}
                                disabled={addingToCart}
                            >
                                {addingToCart ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <Text className="text-white font-latoBold uppercase tracking-widest text-sm">
                                        Add to Cart
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* ── HOLD DIAMOND Button ── */}
                            <TouchableOpacity
                                className="bg-[#26062b] py-3 rounded-sm items-center flex-1"
                                activeOpacity={0.85}
                                onPress={handleHoldDiamond}
                                disabled={holdingDiamond}
                            >
                                {holdingDiamond ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <Text className="text-white font-latoBold uppercase tracking-widest text-sm">
                                        Hold Diamond
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        {/* ── Details Table ── */}
                        <SectionTable
                            title="Details"
                            rows={[
                                { label: "Stock No", value: diamond.stockRef },
                                { label: "Report No", value: diamond.certiNo },
                                { label: "Lab", value: diamond.lab },
                                {
                                    label: "Price/Carat",
                                    value: diamond.pricePerCts
                                        ? `$${diamond.pricePerCts.toLocaleString()}`
                                        : "-",
                                },
                                { label: "Shape", value: diamond.shape },
                                { label: "Carat", value: diamond.weight },
                                { label: "Color", value: diamond.color },
                                { label: "Clarity", value: diamond.clarity },
                                {
                                    label: "Shade",
                                    value: (diamond as any).shade,
                                },
                                { label: "Cut", value: diamond.cutGrade },
                                { label: "Polish", value: diamond.polish },
                                { label: "Symmetry", value: diamond.symmetry },
                                {
                                    label: "Fluorescence",
                                    value: diamond.fluorescenceIntensity,
                                },
                            ]}
                        />

                        {/* ── Measurements Table ── */}
                        <SectionTable
                            title="Measurements"
                            rows={[
                                {
                                    label: "Table%",
                                    value:
                                        diamond.tablePerc != null
                                            ? diamond.tablePerc.toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Depth%",
                                    value:
                                        diamond.depthPerc != null
                                            ? diamond.depthPerc.toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Length",
                                    value: diamond.length ?? "-",
                                },
                                {
                                    label: "Width",
                                    value: diamond.width ?? "-",
                                },
                                {
                                    label: "Depth",
                                    value: diamond.height ?? "-",
                                },
                                {
                                    label: "Ratio",
                                    value:
                                        diamond.length && diamond.width
                                            ? (
                                                  diamond.length / diamond.width
                                              ).toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Crown Angle",
                                    value:
                                        (diamond as any).crownAngle != null
                                            ? (
                                                  diamond as any
                                              ).crownAngle.toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Crown Height",
                                    value:
                                        (diamond as any).crownHeight != null
                                            ? (
                                                  diamond as any
                                              ).crownHeight.toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Pav Angle",
                                    value:
                                        (diamond as any).pavalionAngle != null
                                            ? (
                                                  diamond as any
                                              ).pavalionAngle.toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Pav Height",
                                    value:
                                        (diamond as any).pavalionDepth != null
                                            ? (
                                                  diamond as any
                                              ).pavalionDepth.toFixed(2)
                                            : "-",
                                },
                                {
                                    label: "Girdle",
                                    value: (diamond as any).girdle,
                                },
                                {
                                    label: "Culet",
                                    value: (diamond as any).culetSize,
                                },
                                {
                                    label: "Laser Ins.",
                                    value: (diamond as any).laserInscription,
                                },
                            ]}
                        />

                        {/* ── Inclusion Details Table ── */}
                        <SectionTable
                            title="Inclusion Details"
                            rows={[
                                {
                                    label: "Center Natts",
                                    value: (diamond as any).centerNatts,
                                },
                                {
                                    label: "Side Natts",
                                    value: (diamond as any).sideNatts,
                                },
                                {
                                    label: "Center White",
                                    value: (diamond as any).centerWhite,
                                },
                                {
                                    label: "Side White",
                                    value: (diamond as any).sideWhite,
                                },
                                {
                                    label: "Table open",
                                    value: (diamond as any).tableOpen,
                                },
                                {
                                    label: "Crown open",
                                    value: (diamond as any).crownOpen,
                                },
                                {
                                    label: "Pavilion open",
                                    value: (diamond as any).pavilionOpen,
                                },
                                {
                                    label: "Eye Clean",
                                    value: (diamond as any).eyeClean,
                                },
                                {
                                    label: "Herat & Arrow",
                                    value: (diamond as any).heartArrow,
                                },
                                {
                                    label: "Brilliancy",
                                    value: (diamond as any).brilliancy,
                                },
                                {
                                    label: "Type2 Cert",
                                    value: (diamond as any).type2Cert,
                                },
                                {
                                    label: "Country Of Origin",
                                    value: (diamond as any).country,
                                },
                            ]}
                        />

                        {/* ── Full-width bottom rows ── */}
                        <View className="border border-gray-200 rounded-sm overflow-hidden mb-6">
                            {[
                                {
                                    label: "Key to Symbols",
                                    value: (diamond as any).keyToSymbols?.join(
                                        ", ",
                                    ),
                                },
                                {
                                    label: "Report Comments",
                                    value: (diamond as any).certComment,
                                },
                                {
                                    label: "HRC Comments",
                                    value: (diamond as any).memberComment,
                                },
                            ].map((row, idx) => (
                                <View
                                    key={idx}
                                    className="flex-row border-b border-gray-100 last:border-0"
                                >
                                    <View className="w-36 py-2 px-3 border-r border-gray-100 bg-gray-50">
                                        <Text className="text-xs font-latoBold text-gray-700">
                                            {row.label}
                                        </Text>
                                    </View>
                                    <View className="flex-1 py-2 px-3">
                                        <Text className="text-xs text-gray-600 font-lato">
                                            {row.value || "-"}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

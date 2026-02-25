import { AppHeader } from "@/components/shared/AppHeader";
import { addToCart, holdDiamond } from "@/services/cartServices";
import { Diamond, fetchDiamondById } from "@/services/diamondService";
import { createDiamondInquiry } from "@/services/inquiryServices";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

    // Inquiry modal state
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [inquiryText, setInquiryText] = useState("");
    const [submittingInquiry, setSubmittingInquiry] = useState(false);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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

    // Animate inquiry modal
    useEffect(() => {
        if (showInquiryModal) {
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
    }, [showInquiryModal]);

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

    const handleSubmitInquiry = async () => {
        if (!inquiryText.trim() || !diamond?.stockRef) return;

        setSubmittingInquiry(true);
        try {
            await createDiamondInquiry({
                stockRef: diamond.stockRef,
                query: inquiryText.trim(),
            });
            Keyboard.dismiss();
            setInquiryText("");
            setShowInquiryModal(false);
            Alert.alert(
                "Inquiry Sent",
                "Your inquiry has been submitted successfully. You can track it under Operations > Enquiry.",
            );
        } catch (err) {
            Alert.alert(
                "Error",
                typeof err === "string"
                    ? err
                    : "Failed to submit inquiry. Please try again.",
            );
        } finally {
            setSubmittingInquiry(false);
        }
    };

    const closeInquiryModal = () => {
        Keyboard.dismiss();
        setShowInquiryModal(false);
        setInquiryText("");
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

                        {/* ── INQUIRY Button ── */}
                        <TouchableOpacity
                            className="bg-white border-2 border-[#26062b] py-3 rounded-sm items-center mb-5 flex-row justify-center gap-2"
                            activeOpacity={0.85}
                            onPress={() => setShowInquiryModal(true)}
                        >
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={18}
                                color="#26062b"
                            />
                            <Text className="text-[#26062b] font-latoBold uppercase tracking-widest text-sm">
                                Make an Inquiry
                            </Text>
                        </TouchableOpacity>

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

            {/* ── Inquiry Modal ── */}
            <Modal
                visible={showInquiryModal}
                transparent={true}
                animationType="none"
                onRequestClose={closeInquiryModal}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={closeInquiryModal}
                    className="flex-1 bg-black/50 justify-end"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <Animated.View
                            style={{
                                transform: [{ translateY: slideAnim }],
                            }}
                            className="bg-white rounded-t-3xl"
                        >
                            <TouchableOpacity activeOpacity={1}>
                                {/* Handle bar */}
                                <View className="items-center pt-3 pb-1">
                                    <View className="w-10 h-1 rounded-full bg-gray-300" />
                                </View>

                                {/* Header */}
                                <View className="px-5 py-3 border-b border-gray-200 flex-row items-center justify-between">
                                    <Text className="text-lg font-loraBold text-[#26062b]">
                                        Make an Inquiry
                                    </Text>
                                    <TouchableOpacity
                                        onPress={closeInquiryModal}
                                        className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
                                    >
                                        <Ionicons
                                            name="close"
                                            size={18}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Diamond info summary */}
                                {diamond && (
                                    <View className="px-5 py-3 bg-gray-50 flex-row items-center gap-3">
                                        <View className="w-10 h-10 rounded-lg bg-gray-200 items-center justify-center overflow-hidden">
                                            {diamond.webLink ? (
                                                <Image
                                                    source={{
                                                        uri: diamond.webLink,
                                                    }}
                                                    className="w-10 h-10 rounded-lg"
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="diamond-outline"
                                                    size={18}
                                                    color="#9CA3AF"
                                                />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm font-latoBold text-gray-900">
                                                {diamond.shape} {diamond.weight}{" "}
                                                CT {diamond.color}{" "}
                                                {diamond.clarity}{" "}
                                                {diamond.cutGrade}
                                            </Text>
                                            <Text className="text-xs font-lato text-gray-500">
                                                {diamond.stockRef} •{" "}
                                                {diamond.lab}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Text input */}
                                <View className="px-5 py-4">
                                    <Text className="text-sm font-latoBold text-gray-700 mb-2">
                                        Your Question
                                    </Text>
                                    <TextInput
                                        value={inquiryText}
                                        onChangeText={setInquiryText}
                                        placeholder="Type your question about this diamond..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        className="border border-gray-300 rounded-xl px-4 py-3 text-sm font-lato text-gray-800 min-h-[120px]"
                                        editable={!submittingInquiry}
                                        autoFocus
                                    />
                                    <Text className="text-xs font-lato text-gray-400 mt-1 ml-1">
                                        Our team will respond to your inquiry as
                                        soon as possible.
                                    </Text>
                                </View>

                                {/* Submit button */}
                                <View className="px-5 pb-6 pt-1">
                                    <TouchableOpacity
                                        onPress={handleSubmitInquiry}
                                        disabled={
                                            submittingInquiry ||
                                            !inquiryText.trim()
                                        }
                                        className={`py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${
                                            inquiryText.trim() &&
                                            !submittingInquiry
                                                ? "bg-[#26062b]"
                                                : "bg-gray-300"
                                        }`}
                                        activeOpacity={0.85}
                                    >
                                        {submittingInquiry ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#fff"
                                            />
                                        ) : (
                                            <>
                                                <Ionicons
                                                    name="send"
                                                    size={16}
                                                    color="#fff"
                                                />
                                                <Text className="text-white font-latoBold uppercase tracking-widest text-sm">
                                                    Submit Inquiry
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

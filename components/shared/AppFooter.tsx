import { Ionicons } from "@expo/vector-icons";
import {
    ImageBackground,
    Linking,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Route mapping for pages and services
const routeMap: Record<string, string> = {
    Inventory: "/inventory",
    About: "/about",
    "Sell Diamonds": "/sell-your-diamonds",
    Education: "/the-diamond-4cs",
    Guide: "/diamond-shapes",
    "Diamond Manufacturing": "/diamond-manufacturing",
    "Free Estimations": "/enquiries",
    Financing: "/diamond-financing-options",
    Investment: "/investment-diamonds",
    Sealing: "/security-seals",
    Partners: "/partners",
    "Ethical Diamonds": "/ethical-diamonds",
};

export function AppFooter() {
    return (
        <View className="bg-primary-purple-dark pt-0 mt-10 font-serif relative">
            <ImageBackground
                source={require("../../assets/images/footer_diamond.jpg")}
                className="w-full h-fit"
                resizeMode="cover"
            >
                <View className="absolute inset-0 bg-primary-purple-dark/70" />
                {/* Main Footer Content */}
                <View className="flex-row flex-wrap justify-between px-4 py-6">
                    {/* Pages */}
                    <View className="w-[45%] mb-6">
                        <Text className="text-[#D4AF37] text-xl mb-4 font-lora">
                            Pages
                        </Text>
                        {[
                            "Inventory",
                            "About",
                            "Ethical Diamonds",
                            "Sell Diamonds",
                            "Education",
                            "Guide",
                        ].map((page) => (
                            <TouchableOpacity
                                key={page}
                                className="mb-2"
                                onPress={() => {
                                    const url = routeMap[page];
                                    if (url)
                                        Linking.openURL(
                                            `https://www.uniglodiamonds.com${url}`,
                                        );
                                }}
                            >
                                <Text className="text-white/80 text-base font-lora">
                                    {page}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Services */}
                    <View className="w-[45%] mb-6">
                        <Text className="text-[#D4AF37] text-xl mb-4 font-lora">
                            Our Services
                        </Text>
                        {[
                            "Diamond Manufacturing",
                            "Free Estimations",
                            "Financing",
                            "Investment",
                            "Sealing",
                            "Partners",
                        ].map((service) => (
                            <TouchableOpacity
                                key={service}
                                className="mb-2"
                                onPress={() => {
                                    const url = routeMap[service];
                                    if (url)
                                        Linking.openURL(
                                            `https://uniglodiamonds.com${url}`,
                                        );
                                }}
                            >
                                <Text className="text-white/80 text-base font-lora">
                                    {service}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Get In Touch */}
                    <View className="w-[45%] mb-6">
                        <Text className="text-[#D4AF37] text-xl mb-4 font-lora">
                            Get In Touch
                        </Text>
                        <View className="flex-row items-start mb-3">
                            <Ionicons
                                name="location-sharp"
                                size={20}
                                color="#D4AF37"
                                style={{ marginRight: 8 }}
                            />
                            <Text className="text-white/80 text-base font-lora">
                                <Text className=" font-loraSemibold">
                                    Location:
                                </Text>
                                {"\n"}
                                Hoveniersstraat 30, Suite 662/Bus 250{"\n"}
                                2018 Antwerp
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Ionicons
                                name="mail"
                                size={20}
                                color="#D4AF37"
                                style={{ marginRight: 8 }}
                            />
                            <Text
                                className="text-white/80 text-base font-lora"
                                onPress={() =>
                                    Linking.openURL(
                                        "mailto:suraj@uniglodiamonds.com",
                                    )
                                }
                            >
                                <Text className="font-semibold font-loraSemibold">
                                    Email:
                                </Text>
                                {"\n"}
                                suraj@uniglodiamonds.com
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Ionicons
                                name="call"
                                size={20}
                                color="#D4AF37"
                                style={{ marginRight: 8 }}
                            />
                            <Text
                                className="text-white/80 text-base font-lora"
                                onPress={() =>
                                    Linking.openURL("tel:+32473565758")
                                }
                            >
                                <Text className="font-semibold font-loraSemibold">
                                    Phone:
                                </Text>
                                {"\n"}
                                +32 03 500 91 07
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Copyright */}
                <View className="border-t border-white/40 px-4 py-4">
                    <Text className="text-center text-white/70 text-base font-lora">
                        All Rights Reserved By{" "}
                        <Text className="text-[#D4AF37]">Uniglo</Text>
                    </Text>
                </View>
            </ImageBackground>
        </View>
    );
}

import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    ImageBackground,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* ─── Header ─── */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="bg-white"
            >
                {/* ─── Hero Banner ─── */}
                <View className="w-full h-64  justify-center px-3  overflow-hidden">
                    {/* Background Image Placeholder */}
                    <Image
                        source={require("../../assets/images/banner/banner.jpeg")}
                        className="w-full h-full object-cover  rounded-lg"
                    />
                </View>

                {/* Pagination Dots */}
                <View className="flex-row justify-center gap-2 py-4 bg-white">
                    <View className="w-2 h-2 rounded-full bg-gray-300" />
                    <View className="w-2 h-2 rounded-full bg-gray-800" />
                    <View className="w-2 h-2 rounded-full bg-gray-300" />
                    <View className="w-2 h-2 rounded-full bg-gray-300" />
                </View>

                {/* ─── Main Categories ─── */}
                <View className="bg-white pt-3 pb-8 px-3">
                    {/* Background Image Area */}
                    <ImageBackground
                        source={require("../../assets/images/banner/banner4.png")}
                        className="h-60 w-full px-6 pt-6 "
                        resizeMode="cover"
                    >
                        <Text className="text-white text-2xl font-serif z-10">
                            Categories
                        </Text>
                    </ImageBackground>

                    {/* Overlapping Cards */}
                    <View className="flex-row justify-center gap-4 px-4 -mt-16">
                        {/* Labgrown Diamonds */}
                        <TouchableOpacity className="bg-black w-[47%] rounded-xl p-5 items-center border border-white/20 shadow-lg">
                            <Image
                                source={require("../../assets/shapes/heart.png")}
                                className="w-20 h-24 mb-4"
                                resizeMode="contain"
                            />
                            <Text className="text-white text-sm text-center mb-3 font-serif">
                                Labgrown Diamonds
                            </Text>
                            <Feather
                                name="arrow-right-circle"
                                size={20}
                                color="#D4AF37"
                            />
                        </TouchableOpacity>

                        {/* Natural Diamonds */}
                        <TouchableOpacity className="bg-black w-[47%] rounded-xl p-5 items-center border border-white/20 shadow-lg">
                            <Image
                                source={require("../../assets/images/image1.png")}
                                className="w-40 h-24 mb-4"
                                resizeMode="contain"
                            />
                            <Text className="text-white text-sm text-center mb-3 font-serif">
                                Natural Diamonds
                            </Text>
                            <Feather
                                name="arrow-right-circle"
                                size={20}
                                color="#D4AF37"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ─── Search Diamond by Shape ─── */}
                <View className="bg-white px-4 py-6">
                    <Text className="text-xl font-serif text-[#2e1035] mb-6">
                        Search Diamond by Shape
                    </Text>
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            "Round",
                            "Oval",
                            "Cushion",
                            "Pear",
                            "Princess",
                            "Emerald",
                            "Marquise",
                        ].map((shape) => (
                            <TouchableOpacity
                                key={shape}
                                className="w-[22%] items-center mb-6"
                            >
                                <Image
                                    source={{
                                        uri: `https://via.placeholder.com/60/ffffff/000000?text=${shape[0]}`,
                                    }}
                                    className="w-14 h-14 mb-2"
                                    resizeMode="contain"
                                />
                                <Text className="text-xs text-gray-700 font-medium">
                                    {shape}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {/* View More Button */}
                        <TouchableOpacity className="w-[22%] items-center mb-6 justify-center">
                            <View className="w-14 h-14 rounded-full border border-[#D4AF37] items-center justify-center mb-2">
                                <Feather
                                    name="arrow-right"
                                    size={24}
                                    color="#D4AF37"
                                />
                            </View>
                            <Text className="text-xs text-gray-700 font-medium">
                                View More
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ─── Certified Diamond Assurance ─── */}
                <View className="bg-white py-10 items-center border-t border-gray-100">
                    <Text className="text-sm font-serif tracking-widest mb-8 text-gray-800 uppercase">
                        Certified Diamond Assurance
                    </Text>
                    <View className="flex-row justify-center items-center gap-8 px-4">
                        <Image
                            source={{
                                uri: "https://via.placeholder.com/80x40/ffffff/000000?text=IGI",
                            }}
                            className="w-20 h-12"
                            resizeMode="contain"
                        />
                        <Image
                            source={{
                                uri: "https://via.placeholder.com/100x40/ffffff/000000?text=HRD",
                            }}
                            className="w-24 h-12"
                            resizeMode="contain"
                        />
                        <Image
                            source={{
                                uri: "https://via.placeholder.com/80x40/ffffff/000000?text=GIA",
                            }}
                            className="w-20 h-12"
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* ─── Uniglow Experience ─── */}
                <View className="bg-white px-4 py-8">
                    <Text className="text-3xl font-serif text-center text-[#2e1035] mb-8">
                        Uniglow Experience
                    </Text>

                    {/* Experience Item 1 */}
                    <TouchableOpacity className="mb-8">
                        <View className="w-full h-56 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                            <Image
                                source={{
                                    uri: "https://via.placeholder.com/800x400/e5e7eb/a3a3a3",
                                }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="flex-row justify-between items-center px-1">
                            <Text className="text-xl font-serif text-[#2e1035]">
                                Visit Our Store
                            </Text>
                            <Feather
                                name="arrow-right"
                                size={24}
                                color="#2e1035"
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Experience Item 2 */}
                    <TouchableOpacity className="mb-8">
                        <View className="w-full h-56 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                            <Image
                                source={{
                                    uri: "https://via.placeholder.com/800x400/e5e7eb/a3a3a3",
                                }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="flex-row justify-between items-center px-1">
                            <Text className="text-xl font-serif text-[#2e1035]">
                                Book an Appointment
                            </Text>
                            <Feather
                                name="arrow-right"
                                size={24}
                                color="#2e1035"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ─── Footer ─── */}
                <View className="bg-[#FDE6B2] px-6 py-10">
                    {/* Footer Logo */}
                    <View className="flex-row items-center mb-8">
                        <View className="w-8 h-8 rounded-full border-2 border-[#D4AF37] mr-3 items-center justify-center">
                            <View className="w-4 h-4 rounded-full bg-[#D4AF37]" />
                        </View>
                        <Text className="text-xl font-serif tracking-widest text-[#2e1035]">
                            UNIGLO DIAMONDS
                        </Text>
                    </View>

                    {/* Links Grid */}
                    <View className="flex-row justify-between mb-8">
                        <View className="flex-1 pr-4">
                            <Text className="text-xl font-serif text-[#2e1035] mb-4">
                                Useful Links
                            </Text>
                            {[
                                "Delivery Information",
                                "International Shipping",
                                "Payment Options",
                                "Track Your Order",
                                "Returns",
                                "Find A Store",
                            ].map((link) => (
                                <TouchableOpacity key={link} className="mb-3">
                                    <Text className="text-sm text-[#2e1035] font-medium">
                                        {link}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="flex-1 pl-2">
                            <Text className="text-xl font-serif text-[#2e1035] mb-4">
                                Information
                            </Text>
                            {[
                                "Blog",
                                "Offers & Content Details",
                                "Help & FAQs",
                                "About Uniglow",
                            ].map((link) => (
                                <TouchableOpacity key={link} className="mb-3">
                                    <Text className="text-sm text-[#2e1035] font-medium">
                                        {link}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Contact Info */}
                    <View className="mb-6">
                        <Text className="text-xl font-serif text-[#2e1035] mb-2">
                            Contact Us
                        </Text>
                        <Text className="text-base text-[#2e1035] font-medium">
                            +91 997654321
                        </Text>
                    </View>

                    <View className="mb-10">
                        <Text className="text-xl font-serif text-[#2e1035] mb-2">
                            Chat With Us
                        </Text>
                        <Text className="text-base text-[#2e1035] font-medium">
                            +91 997654321
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

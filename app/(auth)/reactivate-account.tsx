import { requestReactivation } from "@/services/userServices";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ReactivateAccountScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [focused, setFocused] = useState(false);

    const isElevated = focused || email.length > 0;

    const handleSubmit = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            await requestReactivation(email);
            setIsSubmitted(true);
        } catch (err) {
            Alert.alert(
                "Error",
                typeof err === "string"
                    ? err
                    : "Failed to submit reactivation request. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={["#2e1035", "#050208"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                className="flex-1"
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center px-6 py-12"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View className="items-center mb-10">
                        <Image
                            source={require("../../assets/images/logo.png")}
                            className="w-28 h-28 mb-2"
                            resizeMode="contain"
                        />
                        <Text className="text-primary-yellow-2 text-xl font-bold tracking-widest">
                            UNIGLO DIAMONDS
                        </Text>
                    </View>

                    {!isSubmitted ? (
                        <>
                            {/* Title */}
                            <Text className="text-white text-3xl font-bold mb-2">
                                Reactivate Account
                            </Text>
                            <Text className="text-gray-400 text-sm mb-8">
                                Enter your email address to submit a
                                reactivation request. Our admin team will review
                                and get back to you.
                            </Text>

                            {/* Email Input */}
                            <View className="mb-6">
                                <View className="relative border border-gray-500 rounded-xl px-4 pt-4 pb-3">
                                    <Text
                                        className="absolute left-4 text-gray-400"
                                        style={{
                                            top: isElevated ? -10 : 14,
                                            fontSize: isElevated ? 12 : 16,
                                            backgroundColor: isElevated
                                                ? "#050208"
                                                : "transparent",
                                            paddingHorizontal: isElevated
                                                ? 4
                                                : 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        Email Address
                                    </Text>
                                    <View className="flex-row items-center">
                                        <TextInput
                                            value={email}
                                            onChangeText={setEmail}
                                            onFocus={() => setFocused(true)}
                                            onBlur={() => setFocused(false)}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            editable={!isLoading}
                                            className="flex-1 text-white text-base"
                                            placeholderTextColor="#9ca3af"
                                        />
                                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                            email,
                                        ) && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color="#9ca3af"
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                activeOpacity={0.85}
                                disabled={isLoading}
                                className={`bg-white rounded-full py-4 items-center mb-5 ${
                                    isLoading ? "opacity-50" : ""
                                }`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#2e1035" />
                                ) : (
                                    <Text className="text-primary-purple-dark text-base font-bold tracking-widest">
                                        REQUEST REACTIVATION
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* Success State */
                        <View className="items-center py-4">
                            <View className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 items-center justify-center mb-6">
                                <Ionicons
                                    name="checkmark-circle"
                                    size={40}
                                    color="#22c55e"
                                />
                            </View>
                            <Text className="text-white text-3xl font-bold mb-3">
                                Request Submitted
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mb-2">
                                Your reactivation request has been submitted
                                successfully.
                            </Text>
                            <Text className="text-gray-500 text-sm text-center mb-8">
                                Our admin team will review your request and
                                contact you at{" "}
                                <Text className="text-primary-yellow-2 font-semibold">
                                    {email}
                                </Text>
                                .
                            </Text>
                        </View>
                    )}

                    {/* Back to Login Link */}
                    <View className="flex-row items-center justify-center mt-2">
                        <Text className="text-gray-400 text-sm">
                            Remember your credentials?{" "}
                        </Text>
                        <Link href="/login" asChild>
                            <Pressable disabled={isLoading}>
                                <Text className="text-white text-sm font-semibold underline">
                                    Sign in
                                </Text>
                            </Pressable>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

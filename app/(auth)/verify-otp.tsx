import { useAuth } from "@/context/AuthContext";
import { verifyOtp } from "@/services/authServices";
import { sendOtp } from "@/services/otpServices";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function VerifyOtpScreen() {
    const router = useRouter();
    const { setUser } = useAuth();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (!email) {
            Alert.alert("Error", "Email not found. Please register again.", [
                { text: "OK", onPress: () => router.replace("/register") },
            ]);
        }
    }, [email]);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take the last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 4) {
            Alert.alert("Error", "Please enter a 4-digit OTP");
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyOtp({
                email: email as string,
                otp: otpValue,
            });

            Alert.alert(
                "Success",
                response.message || "Email verified successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // If token is provided, user is logged in automatically
                            if (response.data.token) {
                                setUser(response.data.user);
                                router.replace("/(tabs)");
                            } else {
                                router.replace("/login");
                            }
                        },
                    },
                ],
            );
        } catch (error) {
            Alert.alert("Error", error as string);
            // Clear OTP on error
            setOtp(["", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            Alert.alert("Error", "Email not found");
            return;
        }

        setIsResending(true);

        try {
            const response = await sendOtp(email as string);
            Alert.alert(
                "Success",
                response.message || "OTP has been resent to your email",
            );
            // Clear existing OTP
            setOtp(["", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (error) {
            Alert.alert("Error", error as string);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <LinearGradient
            colors={["#2e1035", "#050208"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            className="flex-1"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center px-6 py-12"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back to Home */}
                    <Link href="/" asChild>
                        <TouchableOpacity className="flex-row items-center mb-8">
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color="#D4AF37"
                            />
                            <Text className="text-[#D4AF37] ml-2 text-sm font-bold tracking-wide">
                                Home
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    {/* Title */}
                    <Text className="text-4xl font-bold text-[#D4AF37] text-center mb-4 tracking-wide">
                        Verify Your Email
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-center text-gray-300 text-sm mb-2">
                        We've sent a 4-digit OTP to
                    </Text>

                    {/* Email Display */}
                    <View className="flex-row items-center justify-center gap-2 mb-8">
                        <Ionicons name="mail" size={16} color="#D4AF37" />
                        <Text className="text-center text-[#D4AF37] text-sm font-semibold">
                            {email}
                        </Text>
                    </View>

                    {/* OTP Input */}
                    <View className="flex-row justify-center gap-3 mb-8">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                value={digit}
                                onChangeText={(value) =>
                                    handleOtpChange(index, value)
                                }
                                onKeyPress={({ nativeEvent }) =>
                                    handleKeyPress(index, nativeEvent.key)
                                }
                                keyboardType="numeric"
                                maxLength={1}
                                editable={!isLoading && !isResending}
                                selectTextOnFocus
                                className="w-16 h-16 text-center text-3xl font-bold bg-white/10 border border-white/10 text-white rounded-xl"
                            />
                        ))}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={
                            isLoading || isResending || otp.some((d) => !d)
                        }
                        activeOpacity={0.85}
                        className={`bg-white rounded-full py-4 items-center ${
                            isLoading || isResending || otp.some((d) => !d)
                                ? "opacity-50"
                                : ""
                        }`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#2e1035" />
                        ) : (
                            <Text className="text-[#2e1035] text-base font-bold tracking-widest">
                                VERIFY OTP
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend OTP */}
                    <View className="mt-6 items-center">
                        <Text className="text-gray-300 text-sm mb-2">
                            Didn't receive the code?
                        </Text>
                        <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={isLoading || isResending}
                        >
                            {isResending ? (
                                <View className="flex-row items-center gap-2">
                                    <ActivityIndicator
                                        size="small"
                                        color="#D4AF37"
                                    />
                                    <Text className="text-[#D4AF37] text-sm font-semibold">
                                        Sending...
                                    </Text>
                                </View>
                            ) : (
                                <Text
                                    className={`text-[#D4AF37] text-sm font-semibold ${
                                        isLoading ? "opacity-50" : ""
                                    }`}
                                >
                                    Resend OTP
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View className="flex-row items-center justify-center mt-8">
                        <Text className="text-gray-400 text-sm">
                            Already verified?
                        </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-[#D4AF37] ml-1 text-sm">
                                    Login
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

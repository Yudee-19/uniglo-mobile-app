import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/services/authServices";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    KeyboardAvoidingView,
    KeyboardProvider,
} from "react-native-keyboard-controller";
import Animated, {
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { setUser } = useAuth();
    const router = useRouter();

    // Animation values for email label
    const emailLabelTop = useSharedValue(14);
    const emailLabelFontSize = useSharedValue(16);
    const emailLabelProgress = useSharedValue(0);

    // Animation values for password label
    const passwordLabelTop = useSharedValue(14);
    const passwordLabelFontSize = useSharedValue(16);
    const passwordLabelProgress = useSharedValue(0);

    const emailLabelStyle = useAnimatedStyle(() => ({
        top: emailLabelTop.value,
        fontSize: emailLabelFontSize.value,
        backgroundColor: interpolateColor(
            emailLabelProgress.value,
            [0, 1],
            ["transparent", "#2e1035"],
        ),
    }));

    const passwordLabelStyle = useAnimatedStyle(() => ({
        top: passwordLabelTop.value,
        fontSize: passwordLabelFontSize.value,
        backgroundColor: interpolateColor(
            passwordLabelProgress.value,
            [0, 1],
            ["transparent", "#2e1035"],
        ),
    }));

    const animateLabelUp = (
        labelTop: SharedValue<number>,
        labelFontSize: SharedValue<number>,
        labelProgress?: SharedValue<number>,
    ) => {
        labelTop.value = withTiming(-10, { duration: 200 });
        labelFontSize.value = withTiming(12, { duration: 200 });
        if (labelProgress) {
            labelProgress.value = withTiming(1, { duration: 200 });
        }
    };

    const animateLabelDown = (
        labelTop: SharedValue<number>,
        labelFontSize: SharedValue<number>,
        value: string,
        labelProgress?: SharedValue<number>,
    ) => {
        if (value.length === 0) {
            labelTop.value = withTiming(14, { duration: 200 });
            labelFontSize.value = withTiming(16, { duration: 200 });
            if (labelProgress) {
                labelProgress.value = withTiming(0, { duration: 200 });
            }
        }
    };

    const validateEmail = (text: string) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(emailRegex.test(text));
    };

    const handleSignIn = async () => {
        // Validate inputs
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        if (!emailValid) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            const response = await loginUser(email, password);

            if (response.success && response.data.user) {
                // Update auth context with user data
                setUser(response.data.user);

                // Navigate to tabs (the AuthContext will handle the redirect)
                router.replace("/(tabs)");
            }
        } catch (error) {
            // The error is already formatted in authServices
            Alert.alert("Login Failed", error as string);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardProvider>
            <LinearGradient
                colors={["#2e1035", "#050208"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="flex-1"
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
                        {/* Logo Section */}
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

                        {/* Sign In Title */}
                        <Text className="text-white text-3xl font-bold mb-6">
                            Sign In
                        </Text>

                        {/* Email Input */}
                        <View className="mb-5">
                            <View className="relative border border-gray-500 rounded-xl px-4 pt-4 pb-3">
                                <Animated.Text
                                    style={[
                                        emailLabelStyle,
                                        {
                                            position: "absolute",
                                            left: 12,
                                            paddingHorizontal: 8,
                                            color: "#9ca3af",
                                            zIndex: 1,
                                        },
                                    ]}
                                >
                                    Email
                                </Animated.Text>
                                <View className="flex-row items-center">
                                    <TextInput
                                        value={email}
                                        onChangeText={validateEmail}
                                        onFocus={() =>
                                            animateLabelUp(
                                                emailLabelTop,
                                                emailLabelFontSize,
                                                emailLabelProgress,
                                            )
                                        }
                                        onBlur={() =>
                                            animateLabelDown(
                                                emailLabelTop,
                                                emailLabelFontSize,
                                                email,
                                                emailLabelProgress,
                                            )
                                        }
                                        placeholder=""
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        editable={!isLoading}
                                        className="flex-1 text-white text-base"
                                    />
                                    {emailValid && (
                                        <Ionicons
                                            name="checkmark"
                                            size={22}
                                            color="#9ca3af"
                                        />
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-8">
                            <View className="relative border border-gray-500 rounded-xl px-4 pt-4 pb-3">
                                <Animated.Text
                                    style={[
                                        passwordLabelStyle,
                                        {
                                            position: "absolute",
                                            left: 12,
                                            paddingHorizontal: 8,
                                            color: "#9ca3af",
                                            zIndex: 1,
                                        },
                                    ]}
                                >
                                    Password
                                </Animated.Text>
                                <View className="flex-row items-center">
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() =>
                                            animateLabelUp(
                                                passwordLabelTop,
                                                passwordLabelFontSize,
                                                passwordLabelProgress,
                                            )
                                        }
                                        onBlur={() =>
                                            animateLabelDown(
                                                passwordLabelTop,
                                                passwordLabelFontSize,
                                                password,
                                                passwordLabelProgress,
                                            )
                                        }
                                        placeholder=""
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoComplete="password"
                                        editable={!isLoading}
                                        className="flex-1 text-white text-base"
                                    />
                                    <Pressable
                                        onPress={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={
                                                showPassword
                                                    ? "eye-outline"
                                                    : "eye-off-outline"
                                            }
                                            size={22}
                                            color="#9ca3af"
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleSignIn}
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
                                    SIGN IN
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View className="flex-row items-center">
                            <Text className="text-gray-400 text-sm">
                                Don't have an account?{" "}
                            </Text>
                            <Link href="/register" asChild>
                                <Pressable disabled={isLoading}>
                                    <Text className="text-white text-sm font-semibold underline">
                                        Sign up
                                    </Text>
                                </Pressable>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </KeyboardProvider>
    );
}

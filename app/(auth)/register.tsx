import { CURRENCIES } from "@/constants/currency";
import { useAuth } from "@/context/AuthContext";
import { useLocationData } from "@/hooks/useLocationData";
import { registerUser } from "@/services/authServices";
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

// ─── Constants ────────────────────────────────────────────────────
const BUSINESS_TYPES = [
    { value: "Retailer", label: "Retailer" },
    { value: "Wholesaler", label: "Wholesaler" },
    { value: "Distributor", label: "Distributor" },
    { value: "Manufacturer", label: "Manufacturer" },
    { value: "E-commerce", label: "E-commerce" },
    { value: "Jeweler", label: "Jeweler" },
    { value: "Other", label: "Other" },
];

// ─── Floating Label Input ─────────────────────────────────────────
interface FloatingInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoComplete?: any;
    editable?: boolean;
    rightIcon?: React.ReactNode;
}

const FloatingInput = ({
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    autoComplete,
    editable = true,
    rightIcon,
}: FloatingInputProps) => {
    const [focused, setFocused] = useState(false);
    const isElevated = focused || value.length > 0;

    return (
        <View className="relative border border-gray-500 rounded-xl px-4 pt-4 pb-3 mb-4">
            <Text
                className="absolute left-4 text-gray-400"
                style={{
                    top: isElevated ? -10 : 14,
                    fontSize: isElevated ? 12 : 16,
                    backgroundColor: isElevated ? "#050208" : "transparent",
                    paddingHorizontal: isElevated ? 4 : 0,
                    zIndex: 1,
                }}
            >
                {label}
            </Text>
            <View className="flex-row items-center">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoComplete={autoComplete}
                    editable={editable}
                    className="flex-1 text-white text-base"
                    placeholderTextColor="#9ca3af"
                />
                {rightIcon}
            </View>
        </View>
    );
};

// ─── Select Picker ────────────────────────────────────────────────
interface SelectFieldProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onSelect: (value: string) => void;
    disabled?: boolean;
}

const SelectField = ({
    label,
    value,
    options,
    onSelect,
    disabled = false,
}: SelectFieldProps) => {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <View className="mb-4">
            <TouchableOpacity
                onPress={() => !disabled && setOpen(!open)}
                activeOpacity={0.8}
                className={`border border-gray-500 rounded-xl px-4 py-4 flex-row items-center justify-between ${
                    disabled ? "opacity-50" : ""
                }`}
            >
                <Text
                    className={`text-base ${selected ? "text-white" : "text-gray-400"}`}
                >
                    {selected ? selected.label : label}
                </Text>
                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#9ca3af"
                />
            </TouchableOpacity>

            {open && (
                <View className="border border-gray-500 rounded-xl mt-1 max-h-44 overflow-hidden bg-[#1a0a22]">
                    <ScrollView nestedScrollEnabled>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => {
                                    onSelect(opt.value);
                                    setOpen(false);
                                }}
                                className={`px-4 py-3 border-b border-gray-700 ${
                                    opt.value === value ? "bg-white/10" : ""
                                }`}
                            >
                                <Text className="text-white text-sm">
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

// ─── Step Indicator ───────────────────────────────────────────────
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <View className="flex-row items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((step) => (
            <View key={step} className="flex-row items-center">
                <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                        step <= currentStep ? "bg-white" : "bg-gray-600"
                    }`}
                >
                    <Text
                        className={`text-xs font-bold ${
                            step <= currentStep
                                ? "text-[#2e1035]"
                                : "text-gray-400"
                        }`}
                    >
                        {step}
                    </Text>
                </View>
                {step < 3 && (
                    <View
                        className={`w-10 h-0.5 mx-1 ${
                            step < currentStep ? "bg-white" : "bg-gray-600"
                        }`}
                    />
                )}
            </View>
        ))}
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────
export default function RegisterScreen() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        countryCode: "",
        phone: "",
        companyName: "",
        businessType: "",
        street: "",
        state: "",
        city: "",
        zipCode: "",
        country: "",
        password: "",
        confirmPassword: "",
    });

    const update = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === "country") {
                updated.state = "";
                updated.city = "";
            }
            if (field === "state") {
                updated.city = "";
            }
            return updated;
        });
    };

    // Use the custom hook to get location data
    const {
        countries,
        states,
        cities,
        isLoading: isLoadingLocations,
    } = useLocationData(formData.country, formData.state);

    // ── Validation per step ──
    const validateStep = (s: number): boolean => {
        if (s === 1) {
            if (
                !formData.username ||
                !formData.firstName ||
                !formData.lastName
            ) {
                Alert.alert("Error", "Please fill in all name fields");
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                Alert.alert("Error", "Please enter a valid email address");
                return false;
            }
            if (!formData.phone) {
                Alert.alert("Error", "Please enter your phone number");
                return false;
            }
        }
        if (s === 2) {
            if (!formData.companyName || !formData.businessType) {
                Alert.alert("Error", "Please fill in all company fields");
                return false;
            }
            if (
                !formData.country ||
                !formData.state ||
                !formData.street ||
                !formData.zipCode
            ) {
                Alert.alert("Error", "Please fill in all address fields");
                return false;
            }
        }
        if (s === 3) {
            if (!formData.password || !formData.confirmPassword) {
                Alert.alert("Error", "Please fill in both password fields");
                return false;
            }
            if (formData.password.length < 6) {
                Alert.alert("Error", "Password must be at least 6 characters");
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) setStep((s) => s + 1);
    };

    const handleBack = () => setStep((s) => s - 1);

    const handleRegister = async () => {
        if (!validateStep(3)) return;
        setIsLoading(true);

        try {
            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                companyName: formData.companyName,
                contactName: `${formData.firstName} ${formData.lastName}`,
                currency: CURRENCIES[0].value,
                companyGroup: "",
                firmRegNo: "",
                defaultTerms: "",
                creditLimit: "",
                annualTarget: "",
                remarks: "",
                billingAddress: [
                    {
                        isDefault: "Y",
                        printName: formData.companyName,
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        country: formData.country,
                        zipCode: formData.zipCode,
                        vat_No: "",
                        gstn_No: "",
                    },
                ],
                shippingAddress: [
                    {
                        isDefault: "Y",
                        printName: formData.companyName,
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        country: formData.country,
                        zipCode: formData.zipCode,
                        vat_No: "",
                        gstn_No: "",
                    },
                ],
                contactDetail: {
                    contactName: `${formData.firstName} ${formData.lastName}`,
                    designation: "",
                    businessTel1: formData.phone,
                    businessTel2: "",
                    businessFax: "",
                    mobileNo: formData.phone,
                    personalNo: "",
                    otherNo: "",
                    email: formData.email,
                },
                customerData: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phone,
                    landlineNumber: "",
                    countryCode: formData.countryCode,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        postalCode: formData.zipCode,
                        country: formData.country,
                    },
                    businessInfo: {
                        companyName: formData.companyName,
                        businessType: formData.businessType,
                        vatNumber: "",
                        websiteUrl: "",
                    },
                },
            };

            const response = await registerUser(registrationData);
            console.log("Registration Response:", response);

            Alert.alert(
                "Success",
                response.message || "Registration successful!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate to OTP verification with email as parameter
                            router.push({
                                pathname: "/verify-otp",
                                params: { email: formData.email },
                            });
                        },
                    },
                ],
            );
        } catch (error) {
            const errorMessage = error as string;
            if (
                errorMessage.toLowerCase().includes("pending") &&
                (errorMessage.toLowerCase().includes("registration") ||
                    errorMessage.toLowerCase().includes("otp"))
            ) {
                Alert.alert(
                    "Pending Verification",
                    "You already have a pending registration. Please verify your email with the OTP sent to you.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "Verify Now",
                            onPress: () => {
                                router.push({
                                    pathname: "/verify-otp",
                                    params: { email: formData.email },
                                });
                            },
                        },
                    ],
                );
            } else {
                Alert.alert("Error", errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step label map ──
    const stepTitles = ["Personal Info", "Company & Address", "Set Password"];

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
                        {/* Logo */}
                        <View className="items-center mb-8">
                            <Image
                                source={require("../../assets/images/logo.png")}
                                className="w-20 h-20 mb-2"
                                resizeMode="contain"
                            />
                            <Text className="text-primary-yellow-2 text-xl font-bold tracking-widest">
                                UNIGLO DIAMONDS
                            </Text>
                        </View>

                        {/* Title */}
                        <Text className="text-white text-3xl font-bold mb-2">
                            Create Account
                        </Text>
                        <Text className="text-gray-400 text-sm mb-6">
                            {stepTitles[step - 1]}
                        </Text>

                        {/* Step Indicator */}
                        <StepIndicator currentStep={step} />

                        {/* ── Step 1: Personal Info ── */}
                        {step === 1 && (
                            <View>
                                <FloatingInput
                                    label="Username"
                                    value={formData.username}
                                    onChangeText={(v) => update("username", v)}
                                    editable={!isLoading}
                                />
                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <FloatingInput
                                            label="First Name"
                                            value={formData.firstName}
                                            onChangeText={(v) =>
                                                update("firstName", v)
                                            }
                                            autoCapitalize="words"
                                            editable={!isLoading}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <FloatingInput
                                            label="Last Name"
                                            value={formData.lastName}
                                            onChangeText={(v) =>
                                                update("lastName", v)
                                            }
                                            autoCapitalize="words"
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>
                                <FloatingInput
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={(v) => update("email", v)}
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    editable={!isLoading}
                                    rightIcon={
                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                            formData.email,
                                        ) ? (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color="#9ca3af"
                                            />
                                        ) : null
                                    }
                                />
                                <SelectField
                                    label="Country Code"
                                    value={formData.countryCode}
                                    options={countries.map((c) => ({
                                        value: c.isoCode || "",
                                        label: `${c.label} (${c.isoCode})`,
                                    }))}
                                    onSelect={(v) => update("countryCode", v)}
                                    disabled={isLoading || isLoadingLocations}
                                />
                                <FloatingInput
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChangeText={(v) => update("phone", v)}
                                    keyboardType="phone-pad"
                                    editable={!isLoading}
                                />
                            </View>
                        )}

                        {/* ── Step 2: Company & Address ── */}
                        {step === 2 && (
                            <View>
                                <FloatingInput
                                    label="Company Name"
                                    value={formData.companyName}
                                    onChangeText={(v) =>
                                        update("companyName", v)
                                    }
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                                <SelectField
                                    label="Business Type"
                                    value={formData.businessType}
                                    options={BUSINESS_TYPES}
                                    onSelect={(v) => update("businessType", v)}
                                    disabled={isLoading || isLoadingLocations}
                                />
                                <SelectField
                                    label="Country"
                                    value={formData.country}
                                    options={countries}
                                    onSelect={(v) => update("country", v)}
                                    disabled={isLoading || isLoadingLocations}
                                />
                                <SelectField
                                    label="State"
                                    value={formData.state}
                                    options={states}
                                    onSelect={(v) => update("state", v)}
                                    disabled={
                                        isLoading ||
                                        isLoadingLocations ||
                                        !formData.country
                                    }
                                />
                                <SelectField
                                    label="City (optional)"
                                    value={formData.city}
                                    options={cities}
                                    onSelect={(v) => update("city", v)}
                                    disabled={
                                        isLoading ||
                                        isLoadingLocations ||
                                        !formData.state
                                    }
                                />
                                <FloatingInput
                                    label="Street"
                                    value={formData.street}
                                    onChangeText={(v) => update("street", v)}
                                    editable={!isLoading}
                                />
                                <FloatingInput
                                    label="Zip Code"
                                    value={formData.zipCode}
                                    onChangeText={(v) => update("zipCode", v)}
                                    keyboardType="numeric"
                                    editable={!isLoading}
                                />
                            </View>
                        )}

                        {/* ── Step 3: Password ── */}
                        {step === 3 && (
                            <View>
                                <FloatingInput
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={(v) => update("password", v)}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password-new"
                                    editable={!isLoading}
                                    rightIcon={
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
                                    }
                                />
                                <FloatingInput
                                    label="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChangeText={(v) =>
                                        update("confirmPassword", v)
                                    }
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="password-new"
                                    editable={!isLoading}
                                    rightIcon={
                                        <Pressable
                                            onPress={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                            disabled={isLoading}
                                        >
                                            <Ionicons
                                                name={
                                                    showConfirmPassword
                                                        ? "eye-outline"
                                                        : "eye-off-outline"
                                                }
                                                size={22}
                                                color="#9ca3af"
                                            />
                                        </Pressable>
                                    }
                                />
                                {/* Password match indicator */}
                                {formData.confirmPassword.length > 0 && (
                                    <View className="flex-row items-center mb-4 gap-1">
                                        <Ionicons
                                            name={
                                                formData.password ===
                                                formData.confirmPassword
                                                    ? "checkmark-circle"
                                                    : "close-circle"
                                            }
                                            size={16}
                                            color={
                                                formData.password ===
                                                formData.confirmPassword
                                                    ? "#22c55e"
                                                    : "#ef4444"
                                            }
                                        />
                                        <Text
                                            className={`text-xs ${
                                                formData.password ===
                                                formData.confirmPassword
                                                    ? "text-green-500"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {formData.password ===
                                            formData.confirmPassword
                                                ? "Passwords match"
                                                : "Passwords do not match"}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* ── Navigation Buttons ── */}
                        <View className="flex-col gap-3 mt-2">
                            {step > 1 && (
                                <TouchableOpacity
                                    onPress={handleBack}
                                    disabled={isLoading}
                                    className="flex-1 border border-white/40 rounded-full py-4 items-center"
                                >
                                    <Text className="text-white text-base font-bold tracking-widest">
                                        BACK
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {step < 3 ? (
                                <TouchableOpacity
                                    onPress={handleNext}
                                    activeOpacity={0.85}
                                    className={`bg-white rounded-full py-4 items-center ${step > 1 ? "flex-1" : "w-full"}`}
                                >
                                    <Text className="text-[#2e1035] text-base font-bold tracking-widest">
                                        NEXT
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    activeOpacity={0.85}
                                    disabled={isLoading}
                                    className={`bg-white rounded-full py-4 items-center flex-1 ${
                                        isLoading ? "opacity-50" : ""
                                    }`}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#2e1035" />
                                    ) : (
                                        <Text className="text-[#2e1035] text-base font-bold tracking-widest">
                                            SIGN UP
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Sign In link */}
                        <View className="flex-row items-center justify-center mt-6">
                            <Text className="text-gray-400 text-sm">
                                Already have an account?{" "}
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
        </KeyboardProvider>
    );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import apiClient from "./api";

export interface User {
    _id: string;
    username: string;
    email: string;
    status: string;
    role: string;
    companyName: string;
    contactName: string;
    currency: string;
    companyGroup: string;
    firmRegNo: string;
    defaultTerms: string;
    creditLimit: string;
    annualTarget: string;
    remarks: string;
    billingAddress: Address[];
    shippingAddress: Address[];
    contactDetail: ContactDetail;
    customerData: CustomerData;
    quotations: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Address {
    isDefault: string;
    printName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    vat_No: string;
    gstn_No: string;
}

export interface ContactDetail {
    contactName: string;
    designation: string;
    businessTel1: string;
    businessTel2: string;
    businessFax: string;
    mobileNo: string;
    personalNo: string;
    otherNo: string;
    email: string;
}

export interface CustomerData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    landlineNumber: string;
    countryCode: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    businessInfo: {
        companyName: string;
        businessType: string;
        vatNumber: string;
        websiteUrl: string;
    };
}

export interface LoginResponseData {
    user: User;
    token: string;
}

export interface ApiSuccessResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
}

export interface RegisterRequestData {
    username: string;
    email: string;
    password: string;
    companyName: string;
    contactName: string;
    currency: string;
    companyGroup: string;
    firmRegNo: string;
    defaultTerms: string;
    creditLimit: string;
    annualTarget: string;
    remarks: string;
    billingAddress: Address[];
    shippingAddress: Address[];
    contactDetail: ContactDetail;
    customerData: CustomerData;
}

export interface RegisterResponseData {
    user: User;
    token?: string; // Optional since registration might not return a token
}

export interface VerifyOtpRequestData {
    email: string;
    otp: string;
}

export interface VerifyOtpResponseData {
    user: User;
    token?: string;
}

export const loginUser = async (
    email: string,
    password: string,
): Promise<ApiSuccessResponse<LoginResponseData>> => {
    try {
        const response = await apiClient.post<
            ApiSuccessResponse<LoginResponseData>
        >("/users/login", { email, password });

        // Store token in AsyncStorage
        if (response.data.success && response.data.data.token) {
            await AsyncStorage.setItem("authToken", response.data.data.token);
            await AsyncStorage.setItem(
                "authUser",
                JSON.stringify(response.data.data.user),
            );
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw (
            axiosError.response?.data?.message ||
            "Something went wrong. Please try again."
        );
    }
};

export const getCurrentUser = async (): Promise<
    ApiSuccessResponse<LoginResponseData>
> => {
    try {
        const response =
            await apiClient.get<ApiSuccessResponse<LoginResponseData>>(
                "/users/profile",
            );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async (): Promise<ApiSuccessResponse<null>> => {
    try {
        const response =
            await apiClient.post<ApiSuccessResponse<null>>("/users/logout");

        // Remove token from AsyncStorage
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("authUser");

        return response.data;
    } catch (error) {
        // Remove token even if API call fails
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("authUser");
        throw error;
    }
};

export const registerUser = async (
    data: RegisterRequestData,
): Promise<ApiSuccessResponse<RegisterResponseData>> => {
    try {
        const response = await apiClient.post<
            ApiSuccessResponse<RegisterResponseData>
        >("/users/register", data);

        // If registration returns a token, store it
        if (response.data.success && response.data.data.token) {
            await AsyncStorage.setItem("authToken", response.data.data.token);
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw (
            axiosError.response?.data?.message ||
            "Something went wrong. Please try again."
        );
    }
};

export const verifyOtp = async (
    data: VerifyOtpRequestData,
): Promise<ApiSuccessResponse<VerifyOtpResponseData>> => {
    try {
        const response = await apiClient.post<
            ApiSuccessResponse<VerifyOtpResponseData>
        >("/users/verify-otp", data);

        // Store token in AsyncStorage if provided
        if (response.data.success && response.data.data.token) {
            await AsyncStorage.setItem("authToken", response.data.data.token);
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw (
            axiosError.response?.data?.message ||
            "Invalid OTP. Please try again."
        );
    }
};

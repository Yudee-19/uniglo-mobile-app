import { AxiosError } from "axios";
import apiClient from "./api";

export interface ApiSuccessResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
}

export interface SendOtpRequestData {
    email: string;
}

export interface SendOtpResponseData {
    success: boolean;
    message: string;
}

export interface UpdatePasswordRequestData {
    email: string;
    newPassword: string;
    otp: string;
}

export interface UpdatePasswordResponseData {
    success: boolean;
    message: string;
}

/**
 * Send OTP to user's email
 * @param email - User's email address
 * @returns Promise with success response
 */
export const sendOtp = async (
    email: string,
): Promise<ApiSuccessResponse<SendOtpResponseData>> => {
    try {
        const response = await apiClient.post<
            ApiSuccessResponse<SendOtpResponseData>
        >("/users/otp", {
            email,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        throw (
            axiosError.response?.data?.message ||
            "Failed to send OTP. Please try again."
        );
    }
};

/**
 * Update user password with OTP verification
 * @param data - Object containing email, newPassword, and otp
 * @returns Promise with success response
 */
export const updatePassword = async (
    data: UpdatePasswordRequestData,
): Promise<ApiSuccessResponse<UpdatePasswordResponseData>> => {
    try {
        const response = await apiClient.put<
            ApiSuccessResponse<UpdatePasswordResponseData>
        >("/users/update-password", data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        throw (
            axiosError.response?.data?.message ||
            "Failed to update password. Please try again."
        );
    }
};

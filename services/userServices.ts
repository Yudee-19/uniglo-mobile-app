import apiClient from "@/services/api";
import { AxiosError } from "axios";

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

export interface UserProfile {
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
    createdAt: string;
    updatedAt: string;
}

export interface ApiSuccessResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    message: string;
}

export interface ProfileResponseData {
    user: UserProfile;
}

export const getUserProfile = async (): Promise<
    ApiSuccessResponse<ProfileResponseData>
> => {
    try {
        const response =
            await apiClient.get<ApiSuccessResponse<ProfileResponseData>>(
                "/users/profile",
            );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw (
            axiosError.response?.data?.message ||
            "Failed to fetch profile. Please try again."
        );
    }
};

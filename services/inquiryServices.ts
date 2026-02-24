import apiClient from "@/services/api";
import { Diamond } from "@/services/diamondService";
import { AxiosError } from "axios";

export interface InquiryQuery {
    userId: string;
    userEmail: string;
    stockRef: string;
    diamondId: Diamond;
    query: string;
    status: "pending" | "answered" | "closed" | "replied";
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
    adminReply?: string;
    repliedAt?: string;
    repliedBy?: string;
}

interface InquiryResponse {
    success: boolean;
    message: string;
    data: {
        query: InquiryQuery;
    };
}

interface UserQueriesResponse {
    success: boolean;
    message: string;
    data: {
        queries: InquiryQuery[];
    };
}

interface CreateInquiryParams {
    stockRef: string;
    query: string;
}

interface ApiErrorResponse {
    message: string;
}

export const createDiamondInquiry = async (
    params: CreateInquiryParams,
): Promise<InquiryResponse> => {
    try {
        const response = await apiClient.post<InquiryResponse>(
            "/diamonds/queries",
            {
                stockRef: params.stockRef,
                query: params.query,
            },
        );

        if (!response.data.success) {
            throw new Error(
                response.data.message || "Failed to create inquiry",
            );
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError.response?.data?.message || "Failed to submit inquiry";
    }
};

export const getUserQueries = async (): Promise<UserQueriesResponse> => {
    try {
        const response =
            await apiClient.get<UserQueriesResponse>("/diamonds/queries");

        if (!response.data.success) {
            throw new Error(
                response.data.message || "Failed to fetch user queries",
            );
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError.response?.data?.message || "Failed to fetch queries";
    }
};

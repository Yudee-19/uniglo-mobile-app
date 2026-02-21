import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface DiamondParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    shape?: string[];
    color?: string[];
    clarity?: string[];
    cutGrade?: string[];
    polish?: string[];
    symmetry?: string[];
    fluorescenceIntensity?: string[];
    lab?: string[];
    minPrice?: number;
    maxPrice?: number;
    minPricePerCarat?: number;
    maxPricePerCarat?: number;
    minDiscount?: number;
    maxDiscount?: number;
    minCarat?: number;
    maxCarat?: number;
    minDepth?: number;
    maxDepth?: number;
    minWidth?: number;
    maxWidth?: number;
    minLength?: number;
    maxLength?: number;
    minHeight?: number;
    maxHeight?: number;
    minTable?: number;
    maxTable?: number;
    minDepthPercent?: number;
    maxDepthPercent?: number;
    isNatural?: boolean;
    colorType?: "white" | "fancy";
    searchTerm?: string;
}

export interface Diamond {
    _id: string;
    stockRef: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cutGrade: string;
    polish: string;
    symmetry: string;
    fluorescenceIntensity: string;
    lab: string;
    priceListUSD: number;
    pricePerCts: number;
    discPerc: number;
    length: number;
    width: number;
    height: number;
    depthPerc: number;
    tablePerc: number;
    measurements: string;
    webLink: string;
    availability: string;
    certiNo: string;
}

export interface PublicDiamond {
    stockRef: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cutGrade: string;
    polish: string;
    symmetry: string;
    fluorescenceIntensity: string;
    lab: string;
    length: number;
    width: number;
    height: number;
    depthPerc: number;
    tablePerc: number;
    measurements: string;
    webLink: string;
    availability: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        recordsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const searchDiamonds = async (
    params: DiamondParams,
    isAuthenticated: boolean,
): Promise<{
    data: (Diamond | PublicDiamond)[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}> => {
    try {
        const queryParams = new URLSearchParams();

        // Pagination
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        // Sorting
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

        // Filters
        if (params.shape?.length) {
            params.shape.forEach((s) => queryParams.append("shape", s));
        }
        if (params.color?.length) {
            params.color.forEach((c) => queryParams.append("color", c));
        }
        if (params.clarity?.length) {
            params.clarity.forEach((c) => queryParams.append("clarity", c));
        }
        if (params.cutGrade?.length) {
            params.cutGrade.forEach((c) => queryParams.append("cutGrade", c));
        }
        if (params.polish?.length) {
            params.polish.forEach((p) => queryParams.append("polish", p));
        }
        if (params.symmetry?.length) {
            params.symmetry.forEach((s) => queryParams.append("symmetry", s));
        }
        if (params.fluorescenceIntensity?.length) {
            params.fluorescenceIntensity.forEach((f) =>
                queryParams.append("fluorescenceIntensity", f),
            );
        }
        if (params.lab?.length) {
            params.lab.forEach((l) => queryParams.append("lab", l));
        }

        // Ranges
        if (params.minPrice !== undefined)
            queryParams.append("priceListUSD_MIN", params.minPrice.toString());
        if (params.maxPrice !== undefined)
            queryParams.append("priceListUSD_MAX", params.maxPrice.toString());
        if (params.minPricePerCarat !== undefined)
            queryParams.append(
                "pricePerCts_MIN",
                params.minPricePerCarat.toString(),
            );
        if (params.maxPricePerCarat !== undefined)
            queryParams.append(
                "pricePerCts_MAX",
                params.maxPricePerCarat.toString(),
            );
        if (params.minDiscount !== undefined)
            queryParams.append("discPerc_MIN", params.minDiscount.toString());
        if (params.maxDiscount !== undefined)
            queryParams.append("discPerc_MAX", params.maxDiscount.toString());
        if (params.minCarat !== undefined)
            queryParams.append("weight_MIN", params.minCarat.toString());
        if (params.maxCarat !== undefined)
            queryParams.append("weight_MAX", params.maxCarat.toString());
        if (params.minLength !== undefined)
            queryParams.append("length_MIN", params.minLength.toString());
        if (params.maxLength !== undefined)
            queryParams.append("length_MAX", params.maxLength.toString());
        if (params.minWidth !== undefined)
            queryParams.append("width_MIN", params.minWidth.toString());
        if (params.maxWidth !== undefined)
            queryParams.append("width_MAX", params.maxWidth.toString());
        if (params.minHeight !== undefined)
            queryParams.append("height_MIN", params.minHeight.toString());
        if (params.maxHeight !== undefined)
            queryParams.append("height_MAX", params.maxHeight.toString());
        if (params.minTable !== undefined)
            queryParams.append("tablePerc_MIN", params.minTable.toString());
        if (params.maxTable !== undefined)
            queryParams.append("tablePerc_MAX", params.maxTable.toString());
        if (params.minDepth !== undefined)
            queryParams.append("depthPerc_MIN", params.minDepth.toString());
        if (params.maxDepth !== undefined)
            queryParams.append("depthPerc_MAX", params.maxDepth.toString());

        // Special filters
        if (params.isNatural !== undefined)
            queryParams.append("isNatural", params.isNatural.toString());
        if (params.colorType) queryParams.append("colorType", params.colorType);
        if (params.searchTerm)
            queryParams.append("searchTerm", params.searchTerm);

        const endpoint = isAuthenticated
            ? "/diamonds/search"
            : "/diamonds/safe";
        const response = await axios.get<ApiResponse<Diamond | PublicDiamond>>(
            `${API_BASE_URL}${endpoint}?${queryParams.toString()}`,
        );

        return {
            data: response.data.data,
            totalCount: response.data.pagination.totalRecords,
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            hasNextPage: response.data.pagination.hasNextPage,
            hasPrevPage: response.data.pagination.hasPrevPage,
        };
    } catch (error) {
        console.error("Error searching diamonds:", error);
        throw error;
    }
};

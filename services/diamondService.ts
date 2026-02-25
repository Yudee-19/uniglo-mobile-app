import {
    DiamondAvailability,
    DiamondClarity,
    DiamondColor,
    DiamondCut,
    DiamondLab,
    DiamondShape,
} from "@/types/diamond.types";
import apiClient from "./api";

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
    // --- Identity & Meta ---
    _id: string;
    stockRef: string;
    InternalStockRefKey: number;
    availability: DiamondAvailability | string; // e.g., "M"
    source: string;

    // --- Basic Specs ---
    shape: DiamondShape | string; // e.g., "RD"
    weight: number; // Carat weight
    color: DiamondColor | string; // e.g., "E", "D", "F"
    clarity: DiamondClarity | string; // e.g., "SI1", "VS2"
    shade: string;

    // --- Cut & Finish ---
    cutGrade: DiamondCut | string; // e.g., "EX"
    polish: DiamondCut | string; // e.g., "EX", "VG"
    symmetry: DiamondCut | string; // e.g., "EX"

    // --- Fluorescence ---
    // Updated based on data seeing "NON", "STG", "FNT"
    fluorescenceIntensity: "NON" | "FNT" | "MED" | "STG" | "VSL" | string;
    fluorescenceColor: string; // e.g., "Blue" or ""

    // --- Dimensions & Proportions ---
    measurements: string; // e.g., "4.72-4.74x2.89"
    length: number;
    width: number;
    height: number;
    depthPerc: number;
    tablePerc: number;
    crownAngle: number;
    crownHeight: number;
    pavalionAngle: number; // Note: API typo matches this spelling
    pavalionDepth: number; // Note: API typo matches this spelling

    // --- Girdle & Culet ---
    girdle: string; // e.g., "MED to STK"
    girdleThin: string;
    girdlePerc: number;
    girdleCondition: string;
    culetSize: string;
    culetCondition: string;

    // --- Certification & Lab ---
    lab: DiamondLab | string; // e.g., "GIA"
    certiNo: string;
    certIssueDate: string; // ISO Date String
    certComment: string;
    laserInscription: string; // "Y" or "N"

    // --- Pricing ---
    priceListUSD: number;
    pricePerCts: number;
    discPerc: number;
    cashDiscPerc: number;
    cashDiscPrice: number;

    // --- Inclusions & Comments ---
    keyToSymbols: string[]; // e.g., ["Crystal", "Cloud"]
    milky: string;
    blackinclusion: string;
    eyeClean: string;
    memberComment: string;
    handA: string; // Hearts and Arrows
    identificationMarks: string;
    enhancements: string;
    treatment: string;

    // --- Fancy Color Details (If applicable) ---
    origin: string;
    fancyColor: string;
    fancyIntensity: string;
    fancyOvertone: string;

    // --- Location & Logistics ---
    city: string;
    state: string;
    country: string; // e.g., "ITALY"

    // --- Media ---
    webLink: string; // Image URL
    videoLink: string; // Video URL

    // --- Pairing ---
    pairStockRef: string;
    isMatchedPairSeparable: boolean;

    // --- System Timestamps ---
    __v: number;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String

    // --- Similar Diamonds ---
    similar_diamonds?: string[];
}

// export interface PublicDiamond {
//     stockRef: string;
//     shape: string;
//     weight: number;
//     color: string;
//     clarity: string;
//     cutGrade: string;
//     polish: string;
//     symmetry: string;
//     fluorescenceIntensity: string;
//     lab: string;
//     length: number;
//     width: number;
//     height: number;
//     depthPerc: number;
//     tablePerc: number;
//     measurements: string;
//     webLink: string;
//     availability: string;
// }

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
): Promise<{
    data: Diamond[];
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

        const endpoint = "/diamonds/search";
        console.log(
            `Making API request to: ${API_BASE_URL}${endpoint}?${queryParams.toString()}`,
        );
        const response = await apiClient.get<ApiResponse<Diamond>>(
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

export const fetchDiamondById = async (
    id: string,
): Promise<{ diamond: Diamond; similarDiamonds: string[] }> => {
    try {
        const response = await apiClient.get<ApiResponse<Diamond>>(
            `${API_BASE_URL}/diamonds/search?searchTerm=${encodeURIComponent(id)}`,
        );
        const result = response.data;

        if (!result.success) {
            throw new Error(result.message || "Failed to fetch diamond");
        }

        if (Array.isArray(result.data) && result.data.length > 0) {
            return {
                diamond: result.data[0],
                similarDiamonds: (result.data[0] as any).similar_diamonds || [],
            };
        }

        throw new Error("Diamond not found");
    } catch (error) {
        console.error("Error fetching diamond by id:", error);
        throw error;
    }
};

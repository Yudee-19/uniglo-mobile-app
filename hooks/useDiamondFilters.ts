import { useAuth } from "@/context/AuthContext";
import {
    Diamond,
    DiamondParams,
    PublicDiamond,
    searchDiamonds,
} from "@/services/diamondService";
import { FilterState } from "@/types/diamond.types";
import { useCallback, useEffect, useState } from "react";

const initialFilterState: FilterState = {
    shape: [],
    caratRange: [1.2, 5.0],
    color: [],
    clarity: [],
    cutGrade: [],
    polish: [],
    symmetry: [],
    fluorescence: [],
    lab: [],
    priceRange: [0, 1000000],
    pricePerCaratRange: [0, 1000000],
    discountRange: [-100, 100],
    lengthRange: [0, 20],
    widthRange: [0, 20],
    heightRange: [0, 20],
    depthRange: [0, 100],
    depthPercentRange: [40, 90],
    tablePercentRange: [40, 90],
    isNatural: undefined,
    colorType: undefined,
    searchTerm: undefined,
    sortBy: undefined,
    sortOrder: undefined,
};

export const useDiamondFilters = () => {
    const { isAuthenticated } = useAuth();
    const [filters, setFilters] = useState<FilterState>(initialFilterState);
    const [diamonds, setDiamonds] = useState<(Diamond | PublicDiamond)[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const hasActiveFilters = useCallback(() => {
        return (
            filters.shape.length > 0 ||
            filters.caratRange[0] !== 1.2 ||
            filters.caratRange[1] !== 5.0 ||
            filters.color.length > 0 ||
            filters.clarity.length > 0 ||
            filters.cutGrade.length > 0 ||
            filters.polish.length > 0 ||
            filters.symmetry.length > 0 ||
            filters.fluorescence.length > 0 ||
            filters.lab.length > 0 ||
            filters.priceRange[0] !== 0 ||
            filters.priceRange[1] !== 1000000 ||
            filters.pricePerCaratRange[0] !== 0 ||
            filters.pricePerCaratRange[1] !== 1000000 ||
            filters.discountRange[0] !== -100 ||
            filters.discountRange[1] !== 100 ||
            filters.isNatural !== undefined ||
            filters.colorType !== undefined ||
            filters.searchTerm !== undefined ||
            filters.sortBy !== undefined ||
            filters.sortOrder !== undefined
        );
    }, [filters]);

    const buildParams = useCallback((): DiamondParams => {
        const params: DiamondParams = {
            page,
            limit: 25,
            shape: filters.shape.length > 0 ? filters.shape : undefined,
            color: filters.color.length > 0 ? filters.color : undefined,
            clarity: filters.clarity.length > 0 ? filters.clarity : undefined,
            cutGrade:
                filters.cutGrade.length > 0 ? filters.cutGrade : undefined,
            polish: filters.polish.length > 0 ? filters.polish : undefined,
            symmetry:
                filters.symmetry.length > 0 ? filters.symmetry : undefined,
            fluorescenceIntensity:
                filters.fluorescence.length > 0
                    ? filters.fluorescence
                    : undefined,
            lab: filters.lab.length > 0 ? filters.lab : undefined,
            minCarat:
                filters.caratRange[0] > 1.2 ? filters.caratRange[0] : undefined,
            maxCarat:
                filters.caratRange[1] < 5.0 ? filters.caratRange[1] : undefined,
            minPrice:
                filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
            maxPrice:
                filters.priceRange[1] < 1000000
                    ? filters.priceRange[1]
                    : undefined,
            minPricePerCarat:
                filters.pricePerCaratRange[0] > 0
                    ? filters.pricePerCaratRange[0]
                    : undefined,
            maxPricePerCarat:
                filters.pricePerCaratRange[1] < 1000000
                    ? filters.pricePerCaratRange[1]
                    : undefined,
            minDiscount:
                filters.discountRange[0] > -100
                    ? filters.discountRange[0]
                    : undefined,
            maxDiscount:
                filters.discountRange[1] < 100
                    ? filters.discountRange[1]
                    : undefined,
            minLength:
                filters.lengthRange[0] > 0 ? filters.lengthRange[0] : undefined,
            maxLength:
                filters.lengthRange[1] < 20
                    ? filters.lengthRange[1]
                    : undefined,
            minWidth:
                filters.widthRange[0] > 0 ? filters.widthRange[0] : undefined,
            maxWidth:
                filters.widthRange[1] < 20 ? filters.widthRange[1] : undefined,
            minHeight:
                filters.heightRange[0] > 0 ? filters.heightRange[0] : undefined,
            maxHeight:
                filters.heightRange[1] < 20
                    ? filters.heightRange[1]
                    : undefined,
            minDepth:
                filters.depthRange[0] > 0 ? filters.depthRange[0] : undefined,
            maxDepth:
                filters.depthRange[1] < 100 ? filters.depthRange[1] : undefined,
            minTable:
                filters.tablePercentRange[0] > 40
                    ? filters.tablePercentRange[0]
                    : undefined,
            maxTable:
                filters.tablePercentRange[1] < 90
                    ? filters.tablePercentRange[1]
                    : undefined,
            minDepthPercent:
                filters.depthPercentRange[0] > 40
                    ? filters.depthPercentRange[0]
                    : undefined,
            maxDepthPercent:
                filters.depthPercentRange[1] < 90
                    ? filters.depthPercentRange[1]
                    : undefined,
            isNatural: filters.isNatural,
            colorType: filters.colorType,
            searchTerm: filters.searchTerm,
        };

        // Only add sort params if they are defined
        if (filters.sortBy) {
            params.sortBy = filters.sortBy;
        }
        if (filters.sortOrder) {
            params.sortOrder = filters.sortOrder;
        }

        return params;
    }, [filters, page]);

    const loadDiamonds = useCallback(async () => {
        setLoading(true);
        try {
            const params = buildParams();
            const result = await searchDiamonds(params, isAuthenticated);
            setDiamonds(result.data);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error("Failed to load diamonds:", error);
        } finally {
            setLoading(false);
        }
    }, [buildParams, isAuthenticated]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadDiamonds();
        }, 300);

        return () => clearTimeout(timer);
    }, [loadDiamonds]);

    const resetFilters = useCallback(() => {
        setFilters(initialFilterState);
        setPage(1);
    }, []);

    const toggleFilter = useCallback(
        <T extends string>(key: keyof FilterState, value: T) => {
            setFilters((prev) => {
                const currentList = prev[key] as T[];
                const newList = currentList.includes(value)
                    ? currentList.filter((item) => item !== value)
                    : [...currentList, value];
                return { ...prev, [key]: newList };
            });
            setPage(1);
        },
        [],
    );

    const updateFilter = useCallback((key: keyof FilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    }, []);

    return {
        filters,
        setFilters,
        diamonds,
        loading,
        page,
        setPage,
        totalCount,
        resetFilters,
        toggleFilter,
        updateFilter,
        loadDiamonds,
        hasActiveFilters: hasActiveFilters(),
    };
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";

// Define the shape of our dropdown options
export interface LocationOption {
    value: string;
    label: string;
    isoCode?: string; // Optional because cities don't need it
}

// ─── Module-level constants (created once, not per render) ────────
const CACHE_KEY_COUNTRIES = "location_countries_cache";
const CACHE_KEY_STATES_PREFIX = "location_states_";
const COUNTRIES_TTL = 24 * 60 * 60 * 1000; // 24 hours
const STATES_TTL = 12 * 60 * 60 * 1000; // 12 hours

const headers = new Headers();
headers.append(
    "X-CSCAPI-KEY",
    process.env.EXPO_PUBLIC_CSC_API_KEY || "YOUR_API_KEY_HERE",
);

const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
};

// ─── Cache helpers ────────────────────────────────────────────────
interface CachedData<T> {
    data: T;
    timestamp: number;
}

async function getFromCache<T>(key: string, ttl: number): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return null;
        const cached: CachedData<T> = JSON.parse(raw);
        if (Date.now() - cached.timestamp > ttl) return null;
        return cached.data;
    } catch {
        return null;
    }
}

async function setInCache<T>(key: string, data: T): Promise<void> {
    try {
        const entry: CachedData<T> = { data, timestamp: Date.now() };
        await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch {
        // Silently fail — cache is non-critical
    }
}

export const useLocationData = (
    selectedCountryName: string,
    selectedStateName: string,
) => {
    const [countries, setCountries] = useState<LocationOption[]>([]);
    const [states, setStates] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // Abort controllers for cancelling stale requests
    const statesAbortRef = useRef<AbortController | null>(null);
    const citiesAbortRef = useRef<AbortController | null>(null);

    // 1. Fetch Countries on Mount (with cache)
    useEffect(() => {
        let cancelled = false;

        const fetchCountries = async () => {
            setIsLoadingCountries(true);

            // Try cache first
            const cached = await getFromCache<LocationOption[]>(
                CACHE_KEY_COUNTRIES,
                COUNTRIES_TTL,
            );
            if (cached && !cancelled) {
                setCountries(cached);
                setIsLoadingCountries(false);
                return;
            }

            // Fetch from API
            try {
                const response = await fetch(
                    "https://api.countrystatecity.in/v1/countries",
                    requestOptions,
                );
                const data = await response.json();
                const formatted: LocationOption[] = data.map((c: any) => ({
                    value: c.name,
                    label: c.name,
                    isoCode: c.iso2,
                }));
                if (!cancelled) {
                    setCountries(formatted);
                    setInCache(CACHE_KEY_COUNTRIES, formatted);
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
            } finally {
                if (!cancelled) setIsLoadingCountries(false);
            }
        };
        fetchCountries();

        return () => {
            cancelled = true;
        };
    }, []);

    // 2. Derive Country ISO Code
    const selectedCountryIso = useMemo(() => {
        return (
            countries.find((c) => c.value === selectedCountryName)?.isoCode ||
            ""
        );
    }, [selectedCountryName, countries]);

    // 3. Fetch States when Country changes (with cache)
    useEffect(() => {
        if (!selectedCountryIso) {
            setStates([]);
            setCities([]);
            return;
        }

        // Cancel previous states request
        statesAbortRef.current?.abort();
        const abortController = new AbortController();
        statesAbortRef.current = abortController;

        const fetchStates = async () => {
            setIsLoadingStates(true);

            // Try cache first
            const cacheKey = `${CACHE_KEY_STATES_PREFIX}${selectedCountryIso}`;
            const cached = await getFromCache<LocationOption[]>(
                cacheKey,
                STATES_TTL,
            );
            if (cached && !abortController.signal.aborted) {
                setStates(cached);
                setIsLoadingStates(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states`,
                    { ...requestOptions, signal: abortController.signal },
                );
                const data = await response.json();
                const formatted: LocationOption[] = data.map((s: any) => ({
                    value: s.name,
                    label: s.name,
                    isoCode: s.iso2,
                }));
                if (!abortController.signal.aborted) {
                    setStates(formatted);
                    setInCache(cacheKey, formatted);
                }
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Error fetching states:", error);
                }
            } finally {
                if (!abortController.signal.aborted) setIsLoadingStates(false);
            }
        };
        fetchStates();

        return () => {
            abortController.abort();
        };
    }, [selectedCountryIso]);

    // 4. Derive State ISO Code
    const selectedStateIso = useMemo(() => {
        return states.find((s) => s.value === selectedStateName)?.isoCode || "";
    }, [selectedStateName, states]);

    // 5. Fetch Cities when State changes
    useEffect(() => {
        if (!selectedCountryIso || !selectedStateIso) {
            setCities([]);
            return;
        }

        // Cancel previous cities request
        citiesAbortRef.current?.abort();
        const abortController = new AbortController();
        citiesAbortRef.current = abortController;

        const fetchCities = async () => {
            setIsLoadingCities(true);
            try {
                const response = await fetch(
                    `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states/${selectedStateIso}/cities`,
                    { ...requestOptions, signal: abortController.signal },
                );
                const data = await response.json();
                const formatted: LocationOption[] = data.map((c: any) => ({
                    value: c.name,
                    label: c.name,
                }));
                if (!abortController.signal.aborted) setCities(formatted);
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Error fetching cities:", error);
                }
            } finally {
                if (!abortController.signal.aborted) setIsLoadingCities(false);
            }
        };
        fetchCities();

        return () => {
            abortController.abort();
        };
    }, [selectedCountryIso, selectedStateIso]);

    return {
        countries,
        states,
        cities,
        isLoadingCountries,
        isLoadingStates,
        isLoadingCities,
        isLoading: isLoadingCountries || isLoadingStates || isLoadingCities,
    };
};

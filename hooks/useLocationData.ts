import { useEffect, useMemo, useState } from "react";

// Define the shape of our dropdown options
export interface LocationOption {
    value: string;
    label: string;
    isoCode?: string; // Optional because cities don't need it
}

export const useLocationData = (
    selectedCountryName: string,
    selectedStateName: string,
) => {
    const [countries, setCountries] = useState<LocationOption[]>([]);
    const [states, setStates] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Set up API headers (Ideally, store this key in an .env file)
    const headers = new Headers();
    headers.append(
        "X-CSCAPI-KEY",
        process.env.EXPO_PUBLIC_CSC_API_KEY || "YOUR_API_KEY_HERE",
    );

    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    // 1. Fetch Countries on Mount
    useEffect(() => {
        const fetchCountries = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    "https://api.countrystatecity.in/v1/countries",
                    requestOptions,
                );
                const data = await response.json();
                const formatted = data.map((c: any) => ({
                    value: c.name,
                    label: c.name,
                    isoCode: c.iso2,
                }));
                setCountries(formatted);
            } catch (error) {
                console.error("Error fetching countries:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCountries();
    }, []);

    // 2. Derive Country ISO Code
    const selectedCountryIso = useMemo(() => {
        return (
            countries.find((c) => c.value === selectedCountryName)?.isoCode ||
            ""
        );
    }, [selectedCountryName, countries]);

    // 3. Fetch States when Country changes
    useEffect(() => {
        if (!selectedCountryIso) {
            setStates([]);
            setCities([]); // Clear cities if country is cleared
            return;
        }

        const fetchStates = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states`,
                    requestOptions,
                );
                const data = await response.json();
                const formatted = data.map((s: any) => ({
                    value: s.name,
                    label: s.name,
                    isoCode: s.iso2,
                }));
                setStates(formatted);
            } catch (error) {
                console.error("Error fetching states:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStates();
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

        const fetchCities = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states/${selectedStateIso}/cities`,
                    requestOptions,
                );
                const data = await response.json();
                const formatted = data.map((c: any) => ({
                    value: c.name,
                    label: c.name,
                }));
                setCities(formatted);
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCities();
    }, [selectedCountryIso, selectedStateIso]);

    return { countries, states, cities, isLoading };
};

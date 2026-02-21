export type DiamondShape =
    | "RD" // Round
    | "PR" // Princess
    | "PS" // Pear
    | "OV" // Oval
    | "EM" // Emerald
    | "CU" // Cushion
    | "MQ" // Marquise
    | "RA" // Radiant
    | "HT" // Heart
    | "AS"; // Asscher

export type DiamondColor =
    | "D"
    | "E"
    | "F"
    | "G"
    | "H"
    | "I"
    | "J"
    | "K"
    | "L"
    | "M"
    | "N"
    | "O"
    | "P"
    | "Q"
    | "R"
    | "S"
    | "T"
    | "U"
    | "V"
    | "W"
    | "X"
    | "Y"
    | "Z"
    | "E-F";

export type DiamondClarity =
    | "FL"
    | "IF"
    | "VVS1"
    | "VVS2"
    | "VS1"
    | "VS2"
    | "SI1"
    | "SI2"
    | "I1"
    | "I2"
    | "I3";

export type DiamondCut = "EX" | "VG" | "G" | "F" | "I";

export interface FilterState {
    shape: DiamondShape[];
    caratRange: [number, number];
    color: DiamondColor[];
    clarity: DiamondClarity[];
    cutGrade: DiamondCut[];
    polish: DiamondCut[];
    symmetry: DiamondCut[];
    fluorescence: string[];
    lab: string[];
    priceRange: [number, number];
    discountRange: [number, number];
    pricePerCaratRange: [number, number];
    lengthRange: [number, number];
    widthRange: [number, number];
    heightRange: [number, number];
    depthRange: [number, number];
    depthPercentRange: [number, number];
    tablePercentRange: [number, number];
    isNatural?: boolean;
    colorType?: "white" | "fancy";
    searchTerm?: string;
}

export const SHAPES: { value: DiamondShape; label: string }[] = [
    { value: "RD", label: "Round" },
    { value: "PR", label: "Princess" },
    { value: "PS", label: "Pear" },
    { value: "OV", label: "Oval" },
    { value: "EM", label: "Emerald" },
    { value: "CU", label: "Cushion" },
    { value: "MQ", label: "Marquise" },
    { value: "RA", label: "Radiant" },
    { value: "HT", label: "Heart" },
    { value: "AS", label: "Asscher" },
];

export const COLORS: DiamondColor[] = [
    "D",
    "E",
    "F",
    "E-F",
    "G",
    "H",
    "I",
    "J",
    "K",
];

export const CLARITIES: DiamondClarity[] = [
    "FL",
    "IF",
    "VVS1",
    "VVS2",
    "VS1",
    "VS2",
    "SI1",
    "SI2",
];

export const FINISHES: DiamondCut[] = ["EX", "VG", "G"];

export const CARAT_RANGES = [{ label: "1.20-5.00", min: 1.2, max: 5.0 }];

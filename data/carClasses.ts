export type CarClassId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'J' | 'M' | 'P' | 'S' | 'X' | 'RS';
export type CarPriority = 'Economy' | 'Reliability' | 'Power' | 'Comfort' | 'Safety' | 'Luxury' | 'Performance' | 'Status' | 'To Work' | 'Standard' | 'Family';
export type SocialClass = 'Lower' | 'Middle' | 'Higher';

export interface CarClassDefinition {
    id: CarClassId;
    name: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    hardCap: number;
    productionCostMultiplier?: number; // Added based on new data
    // Absolute Stats Targets (Summed)
    power?: number;
    weight?: number;
    safety?: number;
    style?: number;
    priority: CarPriority;
    penaltyMismatch: number;
    socialClass: SocialClass;
    unlockYear: number;
    secondaryMarket?: { socialClass: SocialClass; multiplier: number }[];
    inflationSensitivity?: number; // default 1.0
    researchCost: number; // Cost to unlock this class
    requiredBodyTypes?: string[]; // np. ['pickup'] - Hard Lock
    preferredTags: string[];      // Bonus punktowy
    forbiddenTags: string[];      // Kara punktowa
}

export const carClasses: Record<CarClassId, CarClassDefinition> = {
    // --- LOWER CLASS (30%) ---
    A: {
        id: 'A',
        name: 'Klasa A (Miejskie)',
        description: 'Małe, tanie auta miejskie. Niskie marże, ale ogromny potencjał wolumenowy.',
        minPrice: 6500, // Adjusted min to be lower than max
        maxPrice: 9800,
        hardCap: 11500,
        productionCostMultiplier: 0.8,
        priority: 'Economy',
        penaltyMismatch: 0.01,
        socialClass: 'Lower',
        unlockYear: 1950,
        secondaryMarket: [{ socialClass: 'Middle', multiplier: 0.2 }],
        inflationSensitivity: 0.25,
        researchCost: 0,
        requiredBodyTypes: ['small', 'coupe'],
        preferredTags: ['economy', 'standard', 'minimal'],
        forbiddenTags: ['expensive', 'luxury', 'heavy', 'race']
    },
    B: {
        id: 'B',
        name: 'Klasa B (Miejskie+)',
        description: 'Większe auta miejskie, oferujące więcej komfortu. Popularne wśród klasy średniej.',
        minPrice: 10000,
        maxPrice: 14500,
        hardCap: 16500,
        productionCostMultiplier: 0.9,
        priority: 'Economy',
        penaltyMismatch: 0.01,
        socialClass: 'Middle',
        secondaryMarket: [{ socialClass: 'Lower', multiplier: 0.5 }],
        unlockYear: 1950,
        inflationSensitivity: 0.25,
        researchCost: 50000,
        requiredBodyTypes: ['small', 'coupe', 'sedan'],
        preferredTags: ['economy', 'standard', 'city'],
        forbiddenTags: ['heavy', 'race', 'minimal']
    },
    P: {
        id: 'P',
        name: 'Pick-up',
        description: 'Robocze woły. Niezbędne w przemyśle i rolnictwie.',
        minPrice: 18000,
        maxPrice: 28000,
        hardCap: 32000,
        productionCostMultiplier: 1.1,
        priority: 'To Work',
        penaltyMismatch: 0.01,
        socialClass: 'Lower',
        unlockYear: 1955,
        secondaryMarket: [{ socialClass: 'Middle', multiplier: 0.5 }],
        inflationSensitivity: 0.4,
        researchCost: 80000,
        requiredBodyTypes: ['pickup'],
        preferredTags: ['rugged', 'torque', 'work', 'timeless', 'diesel'],
        forbiddenTags: ['delicate', 'luxury', 'race', 'lightweight']
    },

    // --- MIDDLE CLASS (54%) ---
    C: {
        id: 'C',
        name: 'Klasa C (Kompakty)',
        description: 'Uniwersalne samochody rodzinne. Równowaga między ceną a komfortem.',
        minPrice: 15000,
        maxPrice: 22000,
        hardCap: 25000,
        productionCostMultiplier: 1.0,
        priority: 'Standard',
        penaltyMismatch: 0.01,
        socialClass: 'Middle',
        unlockYear: 1960,
        secondaryMarket: [],
        inflationSensitivity: 0.4,
        researchCost: 250000,
        requiredBodyTypes: ['sedan', 'coupe', 'wagon'],
        preferredTags: ['standard', 'efficient', 'family', 'diesel', 'hybrid'],
        forbiddenTags: ['race', 'heavy', 'minimal']
    },
    D: {
        id: 'D',
        name: 'Klasa D (Sedan)',
        description: 'Limuzyny klasy średniej-wyższej. Komfort i prestiż.',
        minPrice: 25000,
        maxPrice: 45000,
        hardCap: 52000,
        productionCostMultiplier: 1.5,
        priority: 'Comfort',
        penaltyMismatch: 0.02,
        socialClass: 'Middle',
        unlockYear: 1970,
        secondaryMarket: [{ socialClass: 'Higher', multiplier: 0.4 }],
        inflationSensitivity: 0.8,
        researchCost: 500000,
        requiredBodyTypes: ['sedan', 'wagon'],
        preferredTags: ['comfort', 'standard', 'premium'],
        forbiddenTags: ['minimal', 'race', 'offroad', 'basic', 'cheap']
    },
    M: {
        id: 'M',
        name: 'Minivan',
        description: 'Pojemne auta dla dużych rodzin.',
        minPrice: 20000,
        maxPrice: 32000,
        hardCap: 38000,
        productionCostMultiplier: 1.1,
        priority: 'Family',
        penaltyMismatch: 0.02,
        socialClass: 'Middle',
        unlockYear: 1990,
        inflationSensitivity: 0.5,
        secondaryMarket: [{ socialClass: 'Lower', multiplier: 0.3 }],
        researchCost: 400000,
        requiredBodyTypes: ['minivan'],
        preferredTags: ['family', 'spacious', 'safe', 'diesel', 'hybrid'],
        forbiddenTags: ['sport', 'race', 'luxury']
    },
    J: {
        id: 'J',
        name: 'SUV',
        description: 'Połączenie terenówki z autem osobowym. Modne i wszechstronne.',
        minPrice: 30000,
        maxPrice: 55000,
        hardCap: 65000,
        productionCostMultiplier: 1.4,
        priority: 'Safety',
        penaltyMismatch: 0.02,
        socialClass: 'Middle',
        unlockYear: 2000,
        secondaryMarket: [{ socialClass: 'Higher', multiplier: 0.6 }],
        inflationSensitivity: 0.8,
        researchCost: 750000,
        requiredBodyTypes: ['suv'],
        preferredTags: ['safety', 'family', 'status'],
        forbiddenTags: ['race', 'minimal', 'tiny']
    },

    // --- HIGHER CLASS (16%) ---
    S: {
        id: 'S',
        name: 'Sport',
        description: 'Szybkie, drogie i niepraktyczne. Dla entuzjastów.',
        minPrice: 50000,
        maxPrice: 160000,  // Increased from 95k for V12 support
        hardCap: 220000,   // Increased from 200k
        productionCostMultiplier: 3.0,
        priority: 'Performance',
        penaltyMismatch: 0.05,
        socialClass: 'Higher',
        unlockYear: 1990,
        inflationSensitivity: 1.1,
        researchCost: 1500000,
        requiredBodyTypes: ['coupe', 'sport-body', 'supercar-body'],
        preferredTags: ['sport', 'power', 'style'],
        forbiddenTags: ['economy', 'rugged', 'family', 'minimal']
    },
    E: {
        id: 'E',
        name: 'Klasa E (Executive)',
        description: 'Luksusowe limuzyny dla prezesów i dygnitarzy.',
        minPrice: 50000,
        maxPrice: 90000,
        hardCap: 160000,
        productionCostMultiplier: 2.5,
        priority: 'Luxury',
        penaltyMismatch: 0.05,
        socialClass: 'Higher',
        unlockYear: 1980,
        inflationSensitivity: 1.1,
        researchCost: 2000000,
        requiredBodyTypes: ['sedan', 'limousine'],
        preferredTags: ['luxury', 'prestige', 'comfort'],
        forbiddenTags: ['minimal', 'race', 'cheap', 'loud', 'basic']
    },
    F: {
        id: 'F',
        name: 'Klasa F (Luksusowe)',
        description: 'Absolutny szczyt komfortu i prestiżu.',
        minPrice: 130000, // PODNIESIONO z 100000 - bufor na zysk z V12
        maxPrice: 280000, // PODNIESIONO z 450000 - bardziej realistyczne
        hardCap: 450000,  // Increased from 400k
        productionCostMultiplier: 4.0,
        priority: 'Status',
        penaltyMismatch: 0.05,
        socialClass: 'Higher',
        unlockYear: 1990,
        inflationSensitivity: 1.35, // PODNIESIONO z 1.2 - tempo V12/Wnętrz
        researchCost: 4000000,
        requiredBodyTypes: ['sedan', 'limousine'],
        preferredTags: ['luxury', 'prestige', 'chauffeur'],
        forbiddenTags: ['minimal', 'sport', 'race', 'utility', 'basic', 'standard']
    },
    X: {
        id: 'X',
        name: 'Klasa X (Supercar)',
        description: 'Egzotyczne bestie o ekstremalnych osiągach.',
        minPrice: 250000,
        maxPrice: 650000,   // Increased from 450k
        hardCap: 1000000,   // Increased from 600k (hypercar territory)
        productionCostMultiplier: 6.0, // Extreme complexity
        priority: 'Performance',
        penaltyMismatch: 0.1,
        socialClass: 'Higher',
        unlockYear: 2010,
        inflationSensitivity: 1.4, // PODNIESIONO z 1.2 - tempo carbonowych części
        researchCost: 12000000,
        requiredBodyTypes: ['supercar-body', 'sport-body', 'coupe'],
        preferredTags: ['extreme', 'tech', 'ultralight', 'lighter'],
        forbiddenTags: ['heavy', 'standard', 'economy', 'diesel']
    },
    RS: {
        id: 'RS',
        name: 'Klasa RS (Super-Rajdowe)',
        description: 'Drogowa homologacja bolidu WRC. Bezkompromisowe osiągi, klatka i hybrydowa moc.',
        minPrice: 250000,      // Must be expensive due to complex parts
        maxPrice: 400000,      // Decreased from 500k for balance
        hardCap: 600000,       // Decreased from 900k for balance
        productionCostMultiplier: 5.0, // Very Complex
        priority: 'Performance', // Kluczowy priorytet: Osiągi
        penaltyMismatch: 0.02,   // Bardzo surowe kary za słabe statystyki (wymaga idealnego dopasowania)
        socialClass: 'Higher',   // Celujemy w najbogatszych entuzjastów
        unlockYear: 2020,
        inflationSensitivity: 1.4, // Wrażliwa na inflację (high-tech drożeje)
        researchCost: 15000000,    // 8 mln $ (Pomiędzy Klasą F a Supercarem)
        requiredBodyTypes: ['rs-body', 'coupe'],
        preferredTags: ['race', 'grip', 'tech', 'lightweight'],
        forbiddenTags: ['luxury', 'heavy', 'comfort', 'soft']
    }
};

// [LEGACY] engineClassCompatibility removed. Use calculateSynergy instead.

export function getEngineMismatchPenalty(carClass: CarClassId, enginePower: number): number {
    // 1. Economy / City (A, B)
    if (['A', 'B'].includes(carClass)) {
        if (enginePower <= 130) return 1.0; // Perfect for city
        if (enginePower > 200) return 0.5; // Overkill/Too heavy
        return 0.9; // Slightly too powerful
    }

    // 2. Compacts & Minivans (C, M)
    if (['C', 'M'].includes(carClass)) {
        if (enginePower < 90) return 0.8; // Underpowered
        if (enginePower <= 180) return 1.0; // Ideal range
        if (enginePower > 300) return 0.6; // Economy mismatch
        return 0.9;
    }

    // 3. Middle Class Sedans (D) & SUVs (J)
    if (['D', 'J'].includes(carClass)) {
        if (enginePower < 110) return 0.7; // Too weak for family car
        if (enginePower <= 400) return 1.0; // Wide acceptable range
        return 0.6; // Too expensive to run
    }

    // 4. Utility (P - Pickups)
    if (['P'].includes(carClass)) {
        if (enginePower < 140) return 0.7; // Needs torque
        if (enginePower >= 300) return 1.2; // Bonus for heavy towing capability
        return 1.0;
    }

    // 5. Executive (E) & Sport (S)
    if (['E', 'S'].includes(carClass)) {
        if (enginePower < 160) return 0.4; // Unacceptable for prestige
        if (enginePower < 250) return 0.9; // Barely acceptable
        if (enginePower >= 350) return 1.3; // Performance Bonus!
        return 1.0;
    }

    // 6. Luxury (F) & Supercar (X)
    if (['F', 'X'].includes(carClass)) {
        if (enginePower < 300) return 0.1; // Joke (No prestige)
        if (enginePower < 500) return 0.8; // Underpowered for Supercar
        return 1.4; // True Prestige Bonus (>500HP is insane for pre-2000)
    }

    // 7. RS Class (2020 WRC)
    if (carClass === 'RS') {
        if (enginePower < 400) return 0.1; // Unacceptable
        if (enginePower < 550) return 0.6; // Weak for WRC
        return 1.5; // Perfect
    }

    return 1.0;
}

// [LEGACY] ClassPartRestrictions removed. Use Synergy Score and Tags.

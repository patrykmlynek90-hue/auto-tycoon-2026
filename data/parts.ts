export interface CarPart {
    value: string;
    label: string;
    cost: number;
    unlockYear: number;
    researchCost: number;
    stats?: {
        style?: number;
        weight?: number; // kg change
        safety?: number;
        power?: number; // HP
    }
    inflationSensitivity?: number; // default 1.0
    type: 'engine' | 'chassis' | 'body' | 'interior';
    tags: string[];
}

export const engineOptions: CarPart[] = [
    {
        value: "small-i4",
        label: "Małe R4",
        cost: 2500,
        unlockYear: 1950,
        researchCost: 0,
        stats: { power: 50, weight: 80 },
        inflationSensitivity: 0.2,
        type: 'engine',
        tags: ['economy', 'city', 'weak', 'standard']
    },
    {
        value: "v8-standard",
        label: "V8 Flathead",
        cost: 8000,
        unlockYear: 1950,
        researchCost: 60000, // Drogi na start
        stats: { power: 160, weight: 260 },
        inflationSensitivity: 0.9,
        type: 'engine',
        tags: ['torque', 'heavy', 'rugged', 'classic', 'timeless']
    },
    {
        value: "6-cyl",
        label: "R6 (Wół roboczy)",
        cost: 4500,
        unlockYear: 1950,
        researchCost: 20000,
        stats: { power: 90, weight: 180 },
        inflationSensitivity: 0.6,
        type: 'engine',
        tags: ['standard', 'reliable', 'timeless']
    },
    {
        value: "4-cyl",
        label: "R4 Standard (OHV)",
        cost: 3500,
        unlockYear: 1955, // Pierwsze ulepszenie dla mas
        researchCost: 40000,
        stats: { power: 75, weight: 130 },
        inflationSensitivity: 0.3,
        type: 'engine',
        tags: ['economy', 'standard', 'timeless']
    },
    {
        value: "v8-big-block",
        label: "V8 Big Block",
        cost: 14000,
        unlockYear: 1965, // Era Muscle Car
        researchCost: 300000,
        stats: { power: 375, weight: 320 },
        inflationSensitivity: 1.0,
        type: 'engine',
        tags: ['power', 'heavy', 'muscle']
    },
    {
        value: "r4-efi",
        label: "R4 EFI (Wtrysk)",
        cost: 5500,
        unlockYear: 1970, // Wczesna wydajność
        researchCost: 400000,
        stats: { power: 110, weight: 110 },
        inflationSensitivity: 0.7,
        type: 'engine',
        tags: ['efficient', 'modern', 'city', 'standard']
    },
    {
        value: "v6",
        label: "V6",
        cost: 9000,
        unlockYear: 1975, // Kryzys paliwowy
        researchCost: 600000,
        stats: { power: 180, weight: 200 },
        inflationSensitivity: 0.8,
        type: 'engine',
        tags: ['balanced', 'reliable', 'versatile']
    },
    {
        value: "v12",
        label: "V12",
        cost: 65000, // OBNIŻONO z 85000 - żeby był opłacalny w Klasie F
        unlockYear: 1980, // Luksus lat 80
        researchCost: 5000000,
        stats: { power: 550, weight: 400 },
        inflationSensitivity: 1.4,
        type: 'engine',
        tags: ['luxury', 'prestige', 'smooth', 'heavy', 'power']
    },
    {
        value: "v8-dohc",
        label: "V8 DOHC (Nowoczesne)",
        cost: 22000, // Idealny środek (droższy niż V6, tańszy niż V12)
        unlockYear: 1989, // Era Lexusa LS400 / BMW V8
        researchCost: 1500000,
        stats: { power: 280, weight: 220 },
        inflationSensitivity: 0.9,
        type: 'engine',
        tags: ['smooth', 'power', 'reliable', 'modern', 'prestige']
        // Brak tagu 'loud' - idealny dla Klasy E i D
    },
    {
        value: "turbodiesel",
        label: "1.9 Turbodiesel",
        cost: 7000,
        unlockYear: 1990,
        researchCost: 800000,
        stats: { power: 110, weight: 160 },
        inflationSensitivity: 0.6,
        type: 'engine',
        tags: ['diesel', 'economy', 'torque', 'reliable', 'loud', 'standard']
    },
    {
        value: "v10",
        label: "V10",
        cost: 55000, // OBNIŻONO z 65000 - balans względem V12
        unlockYear: 1995, // Era Vipera
        researchCost: 7000000,
        stats: { power: 650, weight: 340 },
        inflationSensitivity: 1.3,
        type: 'engine',
        tags: ['sport', 'performance', 'loud']
    },
    {
        value: "eco-hybrid",
        label: "1.5 Hybrid Eco",
        cost: 12000,
        unlockYear: 2005,
        researchCost: 3000000,
        stats: { power: 100, weight: 140 },
        inflationSensitivity: 0.9,
        type: 'engine',
        tags: ['hybrid', 'economy', 'city', 'tech', 'standard']
    },
    {
        value: "v8-biturbo",
        label: "4.0 V8 Bi-Turbo",
        cost: 55000,
        unlockYear: 2010,
        researchCost: 8000000,
        stats: { power: 720, weight: 220 },
        inflationSensitivity: 1.3,
        type: 'engine',
        tags: ['extreme', 'performance', 'tech', 'lighter', 'sport'] // DODANO 'sport'
    },
    {
        value: "wrc-hybrid",
        label: "1.6L Turbo Hybrid WRC",
        cost: 140000, // Bardzo drogi w produkcji (tech)
        unlockYear: 2020,
        researchCost: 15000000,
        stats: { power: 600, weight: 140 }, // Lekki i potężny
        inflationSensitivity: 1.5,
        type: 'engine',
        tags: ['race', 'tech', 'lightweight', 'extreme']
    },
];

export const chassisOptions: CarPart[] = [
    {
        value: "frame",
        label: "Rama",
        cost: 1500,
        unlockYear: 1950,
        researchCost: 0,
        stats: { weight: 500, safety: 5 },
        inflationSensitivity: 0.1,
        type: 'chassis',
        tags: ['rugged', 'heavy', 'offroad', 'cheap', 'timeless']
    },
    {
        value: "monocoque",
        label: "Samonośne",
        cost: 3500,
        unlockYear: 1960, // Rewolucja
        researchCost: 300000,
        stats: { weight: 400, safety: 20 },
        inflationSensitivity: 0.5,
        type: 'chassis',
        tags: ['standard', 'city', 'family', 'timeless']
    },
    {
        value: "aluminum-monocoque",
        label: "Aluminium",
        cost: 18000,
        unlockYear: 1990,
        researchCost: 3000000,
        stats: { weight: 250, safety: 35 },
        inflationSensitivity: 0.9,
        type: 'chassis',
        tags: ['premium', 'lightweight', 'modern']
    },
    {
        value: "carbon-monocoque",
        label: "Włókno Węglowe",
        cost: 90000,
        unlockYear: 2000, // Endgame tech
        researchCost: 12000000, // Bardzo drogie
        stats: { weight: 120, safety: 50 },
        inflationSensitivity: 1.6,
        type: 'chassis',
        tags: ['supercar', 'tech', 'ultralight', 'expensive']
    },
    {
        value: "active-awd",
        label: "Aktywne AWD (Vectoring)",
        cost: 50000,
        unlockYear: 2020,
        researchCost: 9000000,
        stats: { weight: 300, safety: 60 }, // Cięższe przez napędy, ale super bezpieczne/stabilne
        inflationSensitivity: 1.4,
        type: 'chassis',
        tags: ['race', 'grip', 'tech', 'expensive']
    }
];

export const bodyOptions: CarPart[] = [
    {
        value: "small",
        label: "Micro/Miejski",
        cost: 1000,
        unlockYear: 1950,
        researchCost: 0,
        stats: { style: 10, weight: 300, safety: 5 },
        inflationSensitivity: 0.1,
        type: 'body',
        tags: ['city', 'economy', 'standard', 'timeless']
    },
    {
        value: "sedan",
        label: "Sedan",
        cost: 2500,
        unlockYear: 1950,
        researchCost: 20000,
        stats: { style: 25, weight: 500, safety: 15 },
        inflationSensitivity: 0.3,
        type: 'body',
        tags: ['standard', 'family', 'comfort', 'timeless']
    },
    {
        value: "pickup",
        label: "Pickup",
        cost: 2800,
        unlockYear: 1950,
        researchCost: 30000,
        stats: { style: 10, weight: 600, safety: 10 },
        inflationSensitivity: 0.3,
        type: 'body',
        tags: ['utility', 'rugged', 'work', 'timeless']
    },
    {
        value: "wagon",
        label: "Kombi",
        cost: 3000,
        unlockYear: 1955,
        researchCost: 50000,
        stats: { style: 20, weight: 600, safety: 15 },
        inflationSensitivity: 0.3,
        type: 'body',
        tags: ['family', 'practical', 'timeless']
    },
    {
        value: "coupe",
        label: "Coupe",
        cost: 4000,
        unlockYear: 1955,
        researchCost: 75000,
        stats: { style: 40, weight: 450, safety: 10 },
        inflationSensitivity: 0.5,
        type: 'body',
        tags: ['style', 'sport', 'timeless']
    },
    {
        value: "limousine",
        label: "Limuzyna",
        cost: 15000,
        unlockYear: 1960,
        researchCost: 200000,
        stats: { style: 80, weight: 1100, safety: 25 },
        inflationSensitivity: 0.8,
        type: 'body',
        tags: ['luxury', 'prestige', 'chauffeur', 'timeless']
    },
    {
        value: "sport-body",
        label: "Sportowe Nadwozie",
        cost: 12000,
        unlockYear: 1965, // Muscle Car
        researchCost: 350000,
        stats: { style: 90, weight: 400, safety: 20 },
        inflationSensitivity: 0.9,
        type: 'body',
        tags: ['sport', 'aero', 'timeless']
    },
    {
        value: "minivan",
        label: "Minivan",
        cost: 4500,
        unlockYear: 1980,
        researchCost: 500000,
        stats: { style: 20, weight: 700, safety: 25 },
        inflationSensitivity: 0.4,
        type: 'body',
        tags: ['family', 'spacious', 'practical', 'timeless']
    },
    {
        value: "supercar-body",
        label: "Supercar",
        cost: 45000,
        unlockYear: 1985,
        researchCost: 2000000,
        stats: { style: 110, weight: 350, safety: 30 },
        inflationSensitivity: 1.2,
        type: 'body',
        tags: ['extreme', 'aero', 'flashy', 'timeless']
    },
    {
        value: "suv",
        label: "SUV",
        cost: 6000,
        unlockYear: 1995, // Boom na SUVy
        researchCost: 1500000,
        stats: { style: 55, weight: 950, safety: 40 },
        inflationSensitivity: 0.7,
        type: 'body',
        tags: ['family', 'safety', 'versatile', 'status', 'timeless']
    },
    {
        value: "rs-body",
        label: "Nadwozie RS (Kompozyt)",
        cost: 60000,
        unlockYear: 2020,
        researchCost: 4000000,
        stats: { style: 100, weight: 200, safety: 45 }, // Bardzo lekkie (Redukcja masy)
        inflationSensitivity: 1.2,
        type: 'body',
        tags: ['race', 'aggressive', 'aero', 'timeless']
    }
];

export const interiorOptions: CarPart[] = [
    {
        value: "spartan",
        label: "Spartańskie (Tkanina)",
        cost: 500,
        unlockYear: 1950,
        researchCost: 0,
        stats: { style: 5, weight: 20 },
        inflationSensitivity: 0.2,
        type: 'interior',
        tags: ['cheap', 'uncomfortable', 'minimal']
    },
    {
        value: "standard",
        label: "Standard (Winyl)",
        cost: 1500,
        unlockYear: 1950,
        researchCost: 30000,
        stats: { style: 20, weight: 45 },
        inflationSensitivity: 0.6,
        type: 'interior',
        tags: ['standard', 'basic', 'timeless']
    },
    {
        value: "premium",
        label: "Premium (Welur/Pół-skóra)",
        cost: 4500, // Most cenowy
        unlockYear: 1960, // Pasuje do rozwoju klasy średniej-wyższej
        researchCost: 120000,
        stats: { style: 45, weight: 70 }, // Lepsze niż standard, lżejsze niż luxury
        inflationSensitivity: 0.8,
        type: 'interior',
        tags: ['premium', 'comfort', 'timeless'] // Idealne dla Klasy D i bogatej C
    },
    {
        value: "luxury",
        label: "Luksusowe (Drewno/Skóra)",
        cost: 12000,
        unlockYear: 1960, // Luksus lat 60.
        researchCost: 400000,
        stats: { style: 90, weight: 100 },
        inflationSensitivity: 1.2,
        type: 'interior',
        tags: ['comfort', 'prestige', 'heavy', 'timeless']
    },
    {
        value: "sport",
        label: "Sportowe (Alu/Zegary)",
        cost: 5000,
        unlockYear: 1970, // Styl GT
        researchCost: 600000,
        stats: { style: 60, weight: 35 },
        inflationSensitivity: 1.0,
        type: 'interior',
        tags: ['sport', 'style', 'lightweight']
    },
    {
        value: "rally-cage",
        label: "Rajdowe (Klatka/Karbon)",
        cost: 20000,
        unlockYear: 2020,
        researchCost: 2000000,
        stats: { style: 30, weight: 10 }, // Spartańskie (niski styl), ale ultra lekkie
        inflationSensitivity: 1.0,
        type: 'interior',
        tags: ['race', 'safety', 'uncomfortable', 'minimal']
    }
];

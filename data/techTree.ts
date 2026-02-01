
export interface TechNode {
    id: string;
    name: string;
    description: string;
    category: 'engine' | 'chassis' | 'body' | 'safety' | 'electronics' | 'marine_aerospace';
    eraYear: number;
    cost: number;
    researchTime: number; // in "ticks" (8h units) or just abstract points
    prerequisites: string[];
    effects: {
        type: 'unlock_part' | 'stat_boost' | 'unlock_feature';
        target?: string;
        value?: number;
        label: string;
    }[];
}

export const techTree: TechNode[] = [
    // Marine
    {
        id: 'marine_base',
        name: 'Podstawy Inżynierii Morskiej',
        description: 'Pozwala na otwarcie stoczni i produkcję małych jachtów.',
        category: 'marine_aerospace',
        eraYear: 2025,
        cost: 100_000_000,
        researchTime: 30,
        prerequisites: [],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Stocznię (Tier 1)' }]
    },
    {
        id: 'marine_tier2',
        name: 'Zaawansowane Kadłuby Kompozytowe',
        description: 'Nowe technologie materiałowe pozwalające na budowę większych jednostek.',
        category: 'marine_aerospace',
        eraYear: 2030,
        cost: 150_000_000,
        researchTime: 45,
        prerequisites: ['marine_base'],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Luksusowe Jachty (Tier 2)' }]
    },
    {
        id: 'marine_tier3',
        name: 'Mega-Jachty',
        description: 'Szczyt inżynierii stoczniowej dla najbardziej wymagających klientów.',
        category: 'marine_aerospace',
        eraYear: 2035,
        cost: 250_000_000,
        researchTime: 60,
        prerequisites: ['marine_tier2'],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Mega-Jachty (Tier 3)' }]
    },
    {
        id: 'marine_tier4',
        name: 'Autonomiczna Żegluga',
        description: 'Systemy bezzałogowe i napędy wodorowe.',
        category: 'marine_aerospace',
        eraYear: 2040,
        cost: 500_000_000,
        researchTime: 90,
        prerequisites: ['marine_tier3'],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Jachty Autonomiczne (Tier 4)' }]
    },

    // Aerospace
    {
        id: 'aero_base',
        name: 'Awionika Cywilna',
        description: 'Wejście na rynek małych samolotów prywatnych.',
        category: 'marine_aerospace',
        eraYear: 2025,
        cost: 150_000_000,
        researchTime: 40,
        prerequisites: [],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Fabrykę Lotniczą (Tier 1)' }]
    },
    {
        id: 'aero_tier2',
        name: 'Silniki Turboodrzutowe',
        description: 'Wydajne jednostki napędowe dla odrzutowców dyspozycyjnych.',
        category: 'marine_aerospace',
        eraYear: 2030,
        cost: 250_000_000,
        researchTime: 60,
        prerequisites: ['aero_base'],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Odrzutowce Biznesowe (Tier 2)' }]
    },
    {
        id: 'aero_tier3',
        name: 'Supersoniczne Podróże',
        description: 'Powrót do idei cywilnych lotów naddźwiękowych.',
        category: 'marine_aerospace',
        eraYear: 2040,
        cost: 400_000_000,
        researchTime: 90,
        prerequisites: ['aero_tier2'],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Odrzutowce Naddźwiękowe (Tier 3)' }]
    },
    {
        id: 'aero_tier4',
        name: 'Turystyka Orbitalna',
        description: 'Pojazdy zdolne do lotów suborbitalnych.',
        category: 'marine_aerospace',
        eraYear: 2050,
        cost: 1_000_000_000,
        researchTime: 120,
        prerequisites: ['aero_tier3'],
        effects: [{ type: 'unlock_feature', label: 'Odblokowuje Promy Kosmiczne (Tier 4)' }]
    }
];

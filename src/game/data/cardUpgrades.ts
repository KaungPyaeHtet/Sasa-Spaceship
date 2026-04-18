import { Card, cardDefinitions } from './cards';

/** Stats that vary across upgrade tiers (everything else stays the same) */
export interface TierStats {
    duration:       number;
    heat:           number;
    resourceAmount: number;
    points:         number;
}

export interface CardUpgradeDef {
    id:         string;
    tierCosts:  [number, number];   // stars to reach tier 2, then tier 3
    tiers:      [TierStats, TierStats, TierStats]; // [t1, t2, t3]
    tierLabels: [string, string, string];
}

/**
 * Three upgrade tiers per card.
 * Tier 1 = base card (free).  Tier 2 / 3 = star-gated improvements.
 */
export const CARD_UPGRADES: CardUpgradeDef[] = [
    {
        id: 'electricity',
        tierCosts: [3, 8],
        tierLabels: ['Basic', 'Enhanced', 'Overclocked'],
        tiers: [
            { duration: 2,   heat: 5,   resourceAmount: 2, points: 8  },
            { duration: 2,   heat: 4,   resourceAmount: 3, points: 10 },
            { duration: 1.5, heat: 3,   resourceAmount: 4, points: 13 },
        ],
    },
    {
        id: 'solar',
        tierCosts: [3, 8],
        tierLabels: ['Basic', 'Improved', 'Max Output'],
        tiers: [
            { duration: 6,   heat: 0,  resourceAmount: 3, points: 7  },
            { duration: 5,   heat: 0,  resourceAmount: 4, points: 9  },
            { duration: 4,   heat: 0,  resourceAmount: 6, points: 12 },
        ],
    },
    {
        id: 'fuel',
        tierCosts: [4, 10],
        tierLabels: ['Standard', 'Refined', 'High-Grade'],
        tiers: [
            { duration: 5,   heat: 8,  resourceAmount: 3, points: 12 },
            { duration: 4,   heat: 7,  resourceAmount: 4, points: 14 },
            { duration: 3.5, heat: 6,  resourceAmount: 5, points: 17 },
        ],
    },
    {
        id: 'boost',
        tierCosts: [5, 12],
        tierLabels: ['Standard', 'Boosted', 'Hyper'],
        tiers: [
            { duration: 3,   heat: 15, resourceAmount: 5, points: 10 },
            { duration: 2.5, heat: 13, resourceAmount: 7, points: 13 },
            { duration: 2,   heat: 11, resourceAmount: 9, points: 16 },
        ],
    },
    {
        id: 'titanium',
        tierCosts: [4, 10],
        tierLabels: ['Raw', 'Processed', 'Alloy'],
        tiers: [
            { duration: 4,   heat: 3,  resourceAmount: 4, points: 15 },
            { duration: 3.5, heat: 2,  resourceAmount: 5, points: 18 },
            { duration: 3,   heat: 1,  resourceAmount: 7, points: 22 },
        ],
    },
    {
        id: 'cool',
        tierCosts: [3, 7],
        tierLabels: ['Basic', 'Advanced', 'Cryo'],
        tiers: [
            { duration: 4,   heat: -10, resourceAmount: 0, points: 5  },
            { duration: 3.5, heat: -14, resourceAmount: 0, points: 7  },
            { duration: 3,   heat: -20, resourceAmount: 0, points: 10 },
        ],
    },
    {
        id: 'monitor',
        tierCosts: [3, 7],
        tierLabels: ['Basic Scan', 'Deep Scan', 'Full Intel'],
        tiers: [
            { duration: 3,   heat: 0, resourceAmount: 0, points: 2 },  // reveals for 8 s
            { duration: 2.5, heat: 0, resourceAmount: 0, points: 3 },  // reveals for 12 s
            { duration: 2,   heat: 0, resourceAmount: 0, points: 5 },  // reveals for 18 s
        ],
    },
];

/** Returns a Card object with stats merged from the given upgrade tier (0-based). */
export function getCardAtTier(cardId: string, tier: number): Card {
    const base     = cardDefinitions.find(c => c.id === cardId)!;
    const def      = CARD_UPGRADES.find(u => u.id === cardId);
    const safeTier = Math.min(tier, 2) as 0 | 1 | 2;
    if (!def) return { ...base, imageKey: `${base.imageKey}_t1` };
    const t = def.tiers[safeTier];
    return { ...base, ...t, imageKey: `${cardId}_t${safeTier + 1}` };
}

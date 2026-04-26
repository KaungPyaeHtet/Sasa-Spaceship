// star1Pct / star2Pct: fraction of TOTAL resources needed to earn that star
// Resources per ship: elec card +3, fuel card +4, titanium card +5
// Heat: passive heatPerSecond + card heat (+3 fuel/titanium/boost). Launch gives −20 heat relief.
export const levels = [
    // L1 — Tutorial feel. 1 card fills each bar. Generous time and heat.
    { maxHeat: 120, heatPerSecond: 0.8, timeLimit: 45,  star1Pct: 0.33, star2Pct: 0.66, electricityNeeded: 3,  fuelNeeded: 3,  titaniumNeeded: 3  },
    // L2 — 2 cards per bar. Introduces heat pressure.
    { maxHeat: 110, heatPerSecond: 1.0, timeLimit: 60, star1Pct: 0.33, star2Pct: 0.66, electricityNeeded: 6,  fuelNeeded: 6,  titaniumNeeded: 6  },
    // L3 — Same resources, less time per ship. Random events begin (meteor L3+).
    { maxHeat: 105, heatPerSecond: 1.1, timeLimit: 60, star1Pct: 0.35, star2Pct: 0.68, electricityNeeded: 6,  fuelNeeded: 6,  titaniumNeeded: 6  },
    // L4 — 3 cards per bar. Power mode becomes important.
    { maxHeat: 100, heatPerSecond: 1.2, timeLimit: 90, star1Pct: 0.35, star2Pct: 0.68, electricityNeeded: 9,  fuelNeeded: 9,  titaniumNeeded: 9  },
    // L5 — Same resources, tighter heat cap. New machine skin.
    { maxHeat: 100, heatPerSecond: 1.2, timeLimit: 90, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 9,  fuelNeeded: 9,  titaniumNeeded: 9  },
    // L6 — Heat ramps up. Solar flare events begin (L5+). New music.
    { maxHeat: 95,  heatPerSecond: 1.3, timeLimit: 90, star1Pct: 0.40, star2Pct: 0.72, electricityNeeded: 9,  fuelNeeded: 9,  titaniumNeeded: 9  },
    // L7 — System glitch events begin. 4 cards per elec/fuel bar.
    { maxHeat: 90,  heatPerSecond: 1.4, timeLimit: 90, star1Pct: 0.42, star2Pct: 0.72, electricityNeeded: 12, fuelNeeded: 12, titaniumNeeded: 12 },
    // L8 — All three event types active. Heat cap drops.
    { maxHeat: 90,  heatPerSecond: 1.5, timeLimit: 90, star1Pct: 0.45, star2Pct: 0.75, electricityNeeded: 18, fuelNeeded: 18, titaniumNeeded: 18 },
    // L9 — 5 elec cards / 4 fuel / 3 titanium per ship. Fast heat.
    { maxHeat: 85,  heatPerSecond: 1.6, timeLimit: 120, star1Pct: 0.45, star2Pct: 0.75, electricityNeeded: 21, fuelNeeded: 21, titaniumNeeded: 21 },
    // L10 — Maximum pressure. Combos and coolant are essential.
    { maxHeat: 80,  heatPerSecond: 1.8, timeLimit: 120, star1Pct: 0.50, star2Pct: 0.80, electricityNeeded: 1, fuelNeeded: 1, titaniumNeeded: 1 },
]

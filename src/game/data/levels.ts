// star1Pct / star2Pct: fraction of TOTAL resources needed to earn that star
// e.g. 0.35 = player must collect ≥35% of all electricity+fuel+titanium combined
export const levels = [
    { maxHeat: 120, heatPerSecond: 1, timeLimit: 100, star1Pct: 0.30, star2Pct: 0.60, electricityNeeded: 3, fuelNeeded: 3,  titaniumNeeded: 3  },
    { maxHeat: 110, heatPerSecond: 1, timeLimit: 120, star1Pct: 0.35, star2Pct: 0.65, electricityNeeded: 6, fuelNeeded: 6, titaniumNeeded: 6  },
    { maxHeat: 100, heatPerSecond: 1.2, timeLimit: 120, star1Pct: 0.35, star2Pct: 0.65, electricityNeeded: 6, fuelNeeded: 6, titaniumNeeded: 6 },
    { maxHeat: 100,  heatPerSecond: 1.2, timeLimit: 120, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 9, fuelNeeded: 9, titaniumNeeded: 9 },
    { maxHeat: 100,  heatPerSecond: 1.2, timeLimit: 120, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 9, fuelNeeded: 9, titaniumNeeded: 9 },
    { maxHeat: 90,  heatPerSecond: 1.4, timeLimit: 120, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 9, fuelNeeded: 9, titaniumNeeded: 9 },
    { maxHeat: 90,  heatPerSecond: 1.5, timeLimit: 120, star1Pct: 0.45, star2Pct: 0.75, electricityNeeded: 9, fuelNeeded: 9, titaniumNeeded: 9 },
    { maxHeat: 90,  heatPerSecond: 1.6, timeLimit: 45, star1Pct: 0.45, star2Pct: 0.75, electricityNeeded: 12, fuelNeeded: 12, titaniumNeeded: 12 },
    { maxHeat: 80,  heatPerSecond: 1.7, timeLimit: 45, star1Pct: 0.50, star2Pct: 0.80, electricityNeeded: 12, fuelNeeded: 12, titaniumNeeded: 12 },
    { maxHeat: 80,  heatPerSecond: 1.8, timeLimit: 45, star1Pct: 0.50, star2Pct: 0.80, electricityNeeded: 15, fuelNeeded: 15, titaniumNeeded: 15 },
]

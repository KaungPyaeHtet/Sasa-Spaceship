// star1Pct / star2Pct: fraction of TOTAL resources needed to earn that star
// e.g. 0.35 = player must collect ≥35% of all electricity+fuel+titanium combined
export const levels = [
    { maxHeat: 100, heatPerSecond: 0.8, timeLimit: 45, star1Pct: 0.30, star2Pct: 0.60, electricityNeeded: 10, fuelNeeded: 8,  titaniumNeeded: 6  },
    { maxHeat: 100, heatPerSecond: 1.2, timeLimit: 45, star1Pct: 0.35, star2Pct: 0.65, electricityNeeded: 12, fuelNeeded: 10, titaniumNeeded: 8  },
    { maxHeat: 100, heatPerSecond: 1.6, timeLimit: 45, star1Pct: 0.35, star2Pct: 0.65, electricityNeeded: 14, fuelNeeded: 12, titaniumNeeded: 10 },
    { maxHeat: 90,  heatPerSecond: 2.0, timeLimit: 45, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 16, fuelNeeded: 14, titaniumNeeded: 12 },
    { maxHeat: 90,  heatPerSecond: 2.5, timeLimit: 45, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 18, fuelNeeded: 16, titaniumNeeded: 14 },
    { maxHeat: 80,  heatPerSecond: 3.0, timeLimit: 45, star1Pct: 0.40, star2Pct: 0.70, electricityNeeded: 20, fuelNeeded: 18, titaniumNeeded: 16 },
    { maxHeat: 80,  heatPerSecond: 3.6, timeLimit: 45, star1Pct: 0.45, star2Pct: 0.75, electricityNeeded: 22, fuelNeeded: 20, titaniumNeeded: 18 },
    { maxHeat: 70,  heatPerSecond: 4.2, timeLimit: 45, star1Pct: 0.45, star2Pct: 0.75, electricityNeeded: 24, fuelNeeded: 22, titaniumNeeded: 20 },
    { maxHeat: 70,  heatPerSecond: 5.0, timeLimit: 45, star1Pct: 0.50, star2Pct: 0.80, electricityNeeded: 28, fuelNeeded: 26, titaniumNeeded: 22 },
    { maxHeat: 60,  heatPerSecond: 6.0, timeLimit: 45, star1Pct: 0.50, star2Pct: 0.80, electricityNeeded: 32, fuelNeeded: 30, titaniumNeeded: 28 },
]

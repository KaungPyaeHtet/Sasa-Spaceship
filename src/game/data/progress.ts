const KEY = 'sasa_progress';

interface ProgressData {
    stars:        Record<number, number>; // level → best stars (0-3)
    cardTiers:    Record<string, number>; // cardId → current tier (0-based, default 0)
    starsSpent:   number;                 // stars spent on card upgrades
}

function load(): ProgressData {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const d = JSON.parse(raw) as ProgressData;
            if (!d.cardTiers) d.cardTiers = {};
            return d;
        }
    } catch { /* ignore */ }
    return { stars: { 1: 0 }, cardTiers: {}, starsSpent: 0 };
}

function save(data: ProgressData) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

/** Returns the best star count for a level (0 = never beaten, -1 = locked). */
export function getBestStars(level: number): number {
    return load().stars[level] ?? (level === 1 ? 0 : -1);
}

/** Returns true if the level is unlocked (level 1 always is; others need prev level beaten). */
export function isLevelUnlocked(level: number): boolean {
    if (level === 1) return true;
    const data = load();
    return (data.stars[level - 1] ?? -1) >= 1;
}

/** Saves the result of finishing a level. Also unlocks the next level. */
export function saveLevelResult(level: number, stars: number) {
    if (stars <= 0) return;
    const data = load();
    data.stars[level] = Math.max(data.stars[level] ?? 0, stars);
    if (level + 1 <= 10) {
        data.stars[level + 1] = data.stars[level + 1] ?? 0;
    }
    save(data);
}

/** Total stars accumulated across all levels (upgrade currency). */
export function getTotalStars(): number {
    const data = load();
    return Object.values(data.stars).reduce((sum, s) => sum + (s > 0 ? s : 0), 0);
}

/** Current upgrade tier for a card (0 = tier 1, 1 = tier 2, 2 = tier 3). */
export function getCardTier(cardId: string): number {
    return load().cardTiers[cardId] ?? 0;
}

/**
 * Attempt to upgrade a card to the next tier.
 * Returns true if successful, false if not enough stars or already max tier.
 */
export function upgradeCard(cardId: string, cost: number): boolean {
    const data    = load();
    const current = data.cardTiers[cardId] ?? 0;
    if (current >= 2) return false; // already tier 3

    const balance = getTotalStars() - data.starsSpent;
    if (balance < cost) return false;

    data.starsSpent += cost;
    data.cardTiers[cardId] = current + 1;
    save(data);
    return true;
}

/** Spendable star balance (earned minus spent on upgrades). */
export function getStarBalance(): number {
    const data = load();
    return getTotalStars() - data.starsSpent;
}

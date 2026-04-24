const KEY = 'sasa_progress';

interface ProgressData {
    stars: Record<number, number>; // level → best stars (0-3)
}

function load(): ProgressData {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw) as ProgressData;
    } catch { /* ignore */ }
    return { stars: { 1: 0 } };
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
    return (load().stars[level - 1] ?? -1) >= 1;
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

/** Total stars accumulated across all levels. */
export function getTotalStars(): number {
    return Object.values(load().stars).reduce((sum, s) => sum + (s > 0 ? s : 0), 0);
}

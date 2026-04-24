import { Card, cardDefinitions } from './cards';

/** Returns the card for the given level, using base stats from cards.ts and the level-specific image. */
export function getCardAtTier(cardId: string, _tier: number, levelIndex: number): Card {
    const base = cardDefinitions.find(c => c.id === cardId)!;
    return { ...base, imageKey: `${cardId}_t${levelIndex}` };
}

/** Kept for compatibility — no longer used for stat scaling. */
export function tierForLevel(_levelIndex: number): number {
    return 0;
}

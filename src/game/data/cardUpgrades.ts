import { Card, cardDefinitions } from './cards';

/** Returns the card scaled to the given level.
 *  resourceAmount += (levelIndex - 1)   e.g. level 1 → +0, level 2 → +1, level 3 → +2 …
 *  duration       += (levelIndex - 1) * 0.25
 */
export function getCardAtTier(cardId: string, _tier: number, levelIndex: number): Card {
    const base  = cardDefinitions.find(c => c.id === cardId)!;
    const bonus = levelIndex - 1;
    return {
        ...base,
        imageKey:       `${cardId}_t${levelIndex}`,
        resourceAmount: base.resourceAmount > 0 ? base.resourceAmount + bonus : 0,
        duration:       parseFloat((base.duration + bonus * 0.10).toFixed(2)),
    };
}

export function tierForLevel(_levelIndex: number): number {
    return 0;
}

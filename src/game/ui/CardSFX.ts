export function setCardVolume(_v: number) { /* volume handled by Phaser via AudioManager */ }
export function resumeAudioContext() { /* no-op — file audio handled by Phaser */ }

// card id → AudioManager key
const CARD_SOUND_MAP: Record<string, string> = {
    boost:       'card_accelerate',
    cool:        'card_freeze',
    electricity: 'card_electrify',
    fuel:        'card_ignite',
    titanium:    'card_metal',
    monitor:     'card_scanning',
    solar: 'card_radiate',
};

/**
 * Returns the Phaser audio key to play for this card, or '' if none.
 * All sounds are now file-based — the caller plays via AudioManager.playSFX.
 */
export function playCardSFX(cardId: string): string {
    // Strip tier suffix (e.g. 'boost_t3' → 'boost')
    const base = cardId.replace(/_t\d+$/, '');
    return CARD_SOUND_MAP[base] ?? 'card_accelerate';
}

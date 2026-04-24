let _cardVolume = 1.0;
export function setCardVolume(v: number) { _cardVolume = v; }

function ctx(): AudioContext {
    if (!(window as unknown as Record<string, unknown>)._sfxCtx) {
        (window as unknown as Record<string, unknown>)._sfxCtx = new AudioContext();
    }
    return (window as unknown as Record<string, unknown>)._sfxCtx as AudioContext;
}

/** Resume context on first user gesture (browser autoplay policy). */
export function resumeAudioContext() {
    ctx().resume();
}

// ─── Low-level helpers ────────────────────────────────────────────────────────

function osc(
    ac: AudioContext,
    dest: AudioNode,
    type: OscillatorType,
    freq: number,
    startTime: number,
    endFreq: number,
    duration: number,
    gain: number,
) {
    const g  = ac.createGain();
    const o  = ac.createOscillator();
    o.type   = type;
    o.frequency.setValueAtTime(freq, startTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), startTime + duration);
    g.gain.setValueAtTime(gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    o.connect(g);
    g.connect(dest);
    o.start(startTime);
    o.stop(startTime + duration + 0.01);
}

function noise(
    ac: AudioContext,
    dest: AudioNode,
    startTime: number,
    duration: number,
    gain: number,
    lowpass: number,
) {
    const bufLen = Math.ceil(ac.sampleRate * duration);
    const buf    = ac.createBuffer(1, bufLen, ac.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

    const src    = ac.createBufferSource();
    src.buffer   = buf;

    const filt   = ac.createBiquadFilter();
    filt.type    = 'lowpass';
    filt.frequency.value = lowpass;

    const g = ac.createGain();
    g.gain.setValueAtTime(gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filt);
    filt.connect(g);
    g.connect(dest);
    src.start(startTime);
}

// ─── Card drop sound ──────────────────────────────────────────────────────────

function playCardDrop() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.45 * _cardVolume;
    master.connect(ac.destination);
    noise(ac, master, t,        0.06, 1.0, 600);
    noise(ac, master, t + 0.04, 0.15, 0.7, 200);
    osc(ac, master, 'sawtooth', 200, t,        50,  0.15, 0.6);
    osc(ac, master, 'square',   400, t + 0.02, 100, 0.10, 0.4);
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Cards handled by file-based audio (played via AudioManager.playSFX in Game.ts)
const FILE_SOUNDS = new Set(['cool']);

/** Play the sound effect for a card id. Returns true if handled by file audio. */
export function playCardSFX(cardId: string): boolean {
    if (FILE_SOUNDS.has(cardId)) return true;
    try {
        resumeAudioContext();
        playCardDrop();
    } catch { /* AudioContext blocked — silently skip */ }
    return false;
}

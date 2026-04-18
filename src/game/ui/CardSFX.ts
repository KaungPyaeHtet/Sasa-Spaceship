/**
 * Synthesised card sound effects using the Web Audio API.
 * No audio files required — all sounds are generated procedurally.
 */

function ctx(): AudioContext {
    // Reuse a single AudioContext across calls
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

// ─── Per-card sounds ──────────────────────────────────────────────────────────

/** ⚡ Electric crackle — sharp high buzz */
function playElectricity() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.35;
    master.connect(ac.destination);
    noise(ac, master, t,        0.08, 0.8, 4000);
    noise(ac, master, t + 0.05, 0.06, 0.5, 8000);
    osc(ac, master, 'sawtooth', 880, t, 220, 0.12, 0.18);
    osc(ac, master, 'square',  1760, t, 440, 0.08, 0.10);
}

/** ☀️ Solar — soft warm chime */
function playSolar() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.35;
    master.connect(ac.destination);
    osc(ac, master, 'sine', 660,  t,       600,  0.5,  0.18);
    osc(ac, master, 'sine', 990,  t + 0.04, 880, 0.45, 0.14);
    osc(ac, master, 'sine', 1320, t + 0.08, 1100, 0.4, 0.12);
}

/** 🛢️ Fuel — low whoosh thud */
function playFuel() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.4;
    master.connect(ac.destination);
    osc(ac, master, 'sine', 120, t, 40, 0.22, 0.5);
    noise(ac, master, t, 0.18, 0.6, 300);
}

/** 🚀 Boost — explosive burst */
function playBoost() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.45;
    master.connect(ac.destination);
    noise(ac, master, t,        0.06, 1.0, 600);
    noise(ac, master, t + 0.04, 0.15, 0.7, 200);
    osc(ac, master, 'sawtooth', 200, t,        50,  0.15, 0.6);
    osc(ac, master, 'square',   400, t + 0.02, 100, 0.10, 0.4);
}

/** 🔩 Titanium — metallic clang */
function playTitanium() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.38;
    master.connect(ac.destination);
    osc(ac, master, 'sine',  440, t, 330, 0.35, 0.45);
    osc(ac, master, 'sine',  880, t, 660, 0.30, 0.25);
    osc(ac, master, 'sine', 1320, t, 990, 0.20, 0.15);
    noise(ac, master, t, 0.05, 0.3, 5000);
}

/** ❄️ Cool — icy whoosh sweep */
function playCool() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.32;
    master.connect(ac.destination);
    noise(ac, master, t, 0.3, 0.5, 2000);
    osc(ac, master, 'sine', 1200, t,       2400, 0.25, 0.22);
    osc(ac, master, 'sine', 1600, t + 0.05, 3200, 0.18, 0.18);
}

/** 🖥️ Monitor — digital scan beep */
function playMonitor() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.3;
    master.connect(ac.destination);
    osc(ac, master, 'square', 880,  t,        880,  0.06, 0.3);
    osc(ac, master, 'square', 1100, t + 0.07, 1100, 0.06, 0.3);
    osc(ac, master, 'square', 1320, t + 0.14, 1320, 0.06, 0.3);
}

/** Generic card-drop swoosh (fallback) */
function playSwoosh() {
    const ac = ctx();
    const t  = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.3;
    master.connect(ac.destination);
    noise(ac, master, t, 0.12, 0.5, 1200);
    osc(ac, master, 'sine', 300, t, 100, 0.12, 0.22);
}

// ─── Public API ───────────────────────────────────────────────────────────────

const CARD_SOUNDS: Record<string, () => void> = {
    electricity: playElectricity,
    solar:       playSolar,
    fuel:        playFuel,
    boost:       playBoost,
    titanium:    playTitanium,
    cool:        playCool,
    monitor:     playMonitor,
};

/** Play the sound effect for a card id (e.g. 'boost', 'cool'). */
export function playCardSFX(cardId: string) {
    try {
        resumeAudioContext();
        const play = CARD_SOUNDS[cardId] ?? playSwoosh;
        play();
    } catch { /* AudioContext blocked — silently skip */ }
}

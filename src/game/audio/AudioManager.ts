import { Scene } from 'phaser';
import { setCardVolume } from '../ui/CardSFX';

// ── Key constants ─────────────────────────────────────────────────────────────

export const AUDIO = {
    BG_MUSIC:           'bg_music',
    BG_MUSIC_2:         'bg_music_2',
    BG_MUSIC_3:         'bg_music_3',
    BTN_HOVER:          'btn_hover',
    LAUNCH:             'launch',
    VICTORY:            'victory',
    MACHINE_INTRO_1:    'machine_intro_1',
    MACHINE_INTRO_2:    'machine_intro_2',
    INTRO_1:            'intro_1',
    INTRO_2:            'intro_2',
    VL_HEAT_LEVEL_42:   'vl_heat_level_42',
    VL_OVERHEAT:        'vl_overheat',
    VL_SAVE_HUMANITY:   'vl_save_humanity',
    CARD_ACCELERATE:    'card_accelerate',
    CARD_FREEZE:        'card_freeze',
    CARD_IGNITE:        'card_ignite',
    CARD_METAL:         'card_metal',
    CARD_RADIATE:       'card_radiate',
    CARD_SCANNING: 'card_scanning',
    CARD_ELECTRIFY: 'card_electrify',
    CARD_POWER:     'card_power',
    VL_TIME_LOW:        'vl_time_low',
    VL_METEORITE:       'vl_meteorite',
    VL_SOLAR_FLARE:     'vl_solar_flare',
    VL_SYSTEM_GLITCH:   'vl_system_glitch',
} as const;

export type AudioKey = typeof AUDIO[keyof typeof AUDIO];

// ── Persistent volume state ───────────────────────────────────────────────────

const STORAGE_KEY = 'sasa_volumes';

const defaults = { music: 0.12, sfx: 1.0, voicelines: 1.0, cardSfx: 1.0 };

// Minimum floors — any saved value below these gets silently raised on load
const floors = { music: 0, sfx: 0.9, voicelines: 0.9, cardSfx: 0.9 };

function loadVolumes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const saved = raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
        let bumped = false;
        for (const k of Object.keys(floors) as (keyof typeof floors)[]) {
            if (saved[k] < floors[k]) { saved[k] = floors[k]; bumped = true; }
        }
        if (bumped) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        return saved;
    } catch { return { ...defaults }; }
}

export const volumes = loadVolumes();
setCardVolume(volumes.cardSfx);

function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes)); } catch {}
}

export function setMusicVolume(scene: Scene, v: number) {
    volumes.music = v;
    save();
    (scene.sound.get(AUDIO.BG_MUSIC)   as Phaser.Sound.WebAudioSound | null)?.setVolume(v);
    (scene.sound.get(AUDIO.BG_MUSIC_2) as Phaser.Sound.WebAudioSound | null)?.setVolume(v);
    (scene.sound.get(AUDIO.BG_MUSIC_3) as Phaser.Sound.WebAudioSound | null)?.setVolume(v);
}

export function setSfxVolume(v: number) {
    volumes.sfx = v;
    save();
}

export function setVoicelineVolume(v: number) {
    volumes.voicelines = v;
    save();
    (activeVoiceline as Phaser.Sound.WebAudioSound | null)?.setVolume(v);
}

export function setCardSfxVolume(v: number) {
    volumes.cardSfx = v;
    save();
    setCardVolume(v);
}

// ── Preload ───────────────────────────────────────────────────────────────────

export function preloadAudio(scene: Scene) {
    scene.load.path = 'assets/audio/';
    scene.load.audio(AUDIO.BG_MUSIC,        'background_music.mp3');
    scene.load.audio(AUDIO.BG_MUSIC_2,      'background_music2.mp3');
    scene.load.audio(AUDIO.BG_MUSIC_3,      'background_music3.mp3');
    scene.load.audio(AUDIO.BTN_HOVER,       'button_hover_click.mp3');
    scene.load.audio(AUDIO.LAUNCH,          'launch.mp3');
    scene.load.audio(AUDIO.VICTORY,         'victory.mp3');

    scene.load.path = 'assets/audio/card/';
    scene.load.audio(AUDIO.CARD_ACCELERATE, 'Accelerate.m4a');
    scene.load.audio(AUDIO.CARD_FREEZE,     'Freeze.m4a');
    scene.load.audio(AUDIO.CARD_IGNITE,     'Ignite.m4a');
    scene.load.audio(AUDIO.CARD_METAL,      'Metal.m4a');
    scene.load.audio(AUDIO.CARD_RADIATE,    'Radiate.m4a');
    scene.load.audio(AUDIO.CARD_SCANNING,   'Scanning.m4a');
    scene.load.audio(AUDIO.CARD_ELECTRIFY,   'Electrify.m4a');
    scene.load.audio(AUDIO.CARD_POWER,       'Power.m4a');

    scene.load.path = 'assets/audio/voicelines/';
    scene.load.audio(AUDIO.MACHINE_INTRO_1, 'machineintro1.m4a');
    scene.load.audio(AUDIO.MACHINE_INTRO_2, 'machineintro2.m4a');
    scene.load.audio(AUDIO.INTRO_1,         'intro1.m4a');
    scene.load.audio(AUDIO.INTRO_2,         'intro2.m4a');
    scene.load.audio(AUDIO.VL_HEAT_LEVEL_42,'heat_level_42.m4a');
    scene.load.audio(AUDIO.VL_OVERHEAT,     'overheat.m4a');
    scene.load.audio(AUDIO.VL_SAVE_HUMANITY,'savehumanity.m4a');
    scene.load.audio(AUDIO.VL_TIME_LOW,      'timelow.m4a');
    scene.load.audio(AUDIO.VL_METEORITE,     'meterorite.m4a');
    scene.load.audio(AUDIO.VL_SOLAR_FLARE,   'solarflare.m4a');
    scene.load.audio(AUDIO.VL_SYSTEM_GLITCH, 'overridingsafety.m4a');
}

// ── Playback ──────────────────────────────────────────────────────────────────

export function playMusic(scene: Scene) {
    scene.sound.get(AUDIO.BG_MUSIC_2)?.stop();
    scene.sound.get(AUDIO.BG_MUSIC_3)?.stop();
    const existing = scene.sound.get(AUDIO.BG_MUSIC) as Phaser.Sound.WebAudioSound | null;
    if (existing?.isPlaying) return;
    existing?.destroy();
    const snd = scene.sound.add(AUDIO.BG_MUSIC, { loop: true, volume: volumes.music });
    // Defer until first user gesture to satisfy browser autoplay policy
    const start = () => { snd.play(); scene.input.off('pointerdown', start); };
    if ((scene.sound as Phaser.Sound.WebAudioSoundManager).context?.state === 'running') {
        snd.play();
    } else {
        scene.input.once('pointerdown', start);
    }
}

export function stopMusic(scene: Scene) {
    scene.sound.get(AUDIO.BG_MUSIC)?.stop();
    scene.sound.get(AUDIO.BG_MUSIC_2)?.stop();
    scene.sound.get(AUDIO.BG_MUSIC_3)?.stop();
}

export function playGameMusic(scene: Scene, levelIndex: number) {
    const key = levelIndex <= 5 ? AUDIO.BG_MUSIC_2 : AUDIO.BG_MUSIC_3;
    stopMusic(scene);
    const existing = scene.sound.get(key) as Phaser.Sound.WebAudioSound | null;
    if (existing?.isPlaying) return;
    existing?.destroy();
    const snd = scene.sound.add(key, { loop: true, volume: volumes.music });
    const start = () => { snd.play(); scene.input.off('pointerdown', start); };
    if ((scene.sound as Phaser.Sound.WebAudioSoundManager).context?.state === 'running') {
        snd.play();
    } else {
        scene.input.once('pointerdown', start);
    }
}

export function playSFX(scene: Scene, key: AudioKey) {
    if (scene.cache.audio.has(key)) {
        scene.sound.play(key, { volume: volumes.sfx });
    }
}

const CARD_SFX_BOOST = 1.5;

export function playCardSound(scene: Scene, key: AudioKey) {
    if (scene.cache.audio.has(key)) {
        scene.sound.play(key, { volume: Math.min(volumes.sfx * CARD_SFX_BOOST, 2.0) });
    }
}

let activeVoiceline: Phaser.Sound.BaseSound | null = null;

export function playVoiceline(scene: Scene, key: AudioKey) {
    if (!scene.cache.audio.has(key)) return;
    activeVoiceline?.stop();
    activeVoiceline = scene.sound.add(key, { volume: volumes.voicelines });
    activeVoiceline.play();
}

export function playHover(scene: Scene) {
    playSFX(scene, AUDIO.BTN_HOVER);
}

export function playPixelCrunch(scene: Scene) {
    const mgr = scene.sound as Phaser.Sound.WebAudioSoundManager;
    const ctx  = mgr.context;
    if (!ctx) return;

    const duration  = 0.10;
    const now       = ctx.currentTime;
    const out       = ctx.destination;

    // White noise buffer
    const bufLen    = Math.ceil(ctx.sampleRate * duration);
    const buffer    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data      = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);

    const noise     = ctx.createBufferSource();
    noise.buffer    = buffer;

    // Low-pass sweep: starts bright, closes fast → "pixel crumble" tail
    const lp        = ctx.createBiquadFilter();
    lp.type         = 'lowpass';
    lp.frequency.setValueAtTime(4200, now);
    lp.frequency.exponentialRampToValueAtTime(280, now + duration);

    // Hard distortion (bit-crush feel)
    const wave      = ctx.createWaveShaper();
    const curve     = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        const x     = (i * 2) / 256 - 1;
        curve[i]    = Math.sign(x) * (1 - Math.exp(-Math.abs(x) * 14));
    }
    wave.curve = curve;

    // Amplitude envelope: instant attack, fast decay
    const gain      = ctx.createGain();
    gain.gain.setValueAtTime(0.18 * volumes.sfx, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Click transient at the front for the "crunch" punch
    const click     = ctx.createOscillator();
    click.type      = 'square';
    click.frequency.setValueAtTime(220, now);
    click.frequency.exponentialRampToValueAtTime(40, now + 0.04);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.12 * volumes.sfx, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(lp);
    lp.connect(wave);
    wave.connect(gain);
    gain.connect(out);

    click.connect(clickGain);
    clickGain.connect(out);

    noise.start(now);
    noise.stop(now + duration);
    click.start(now);
    click.stop(now + 0.05);
}

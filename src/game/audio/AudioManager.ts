import { Scene } from 'phaser';
import { setCardVolume } from '../ui/CardSFX';

// ── Key constants ─────────────────────────────────────────────────────────────

export const AUDIO = {
    BG_MUSIC:           'bg_music',
    BTN_HOVER:          'btn_hover',
    MACHINE_INTRO_1:    'machine_intro_1',
    MACHINE_INTRO_2:    'machine_intro_2',
    INTRO_1:            'intro_1',
    INTRO_2:            'intro_2',
    VL_INITIAL:         'vl_initial',
    VL_GIVE_ENERGY:     'vl_give_energy',
    VL_OPTIMIZING:      'vl_optimizing',
    VL_LIMITED:         'vl_limited',
    VL_HEAT_INCREASING: 'vl_heat_increasing',
    VL_HEAT_LEVEL_42:   'vl_heat_level_42',
    VL_OVERHEAT:        'vl_overheat',
    VL_CANNOT_SUSTAIN:  'vl_cannot_sustain',
    VL_OVERRIDING:      'vl_overriding',
    VL_UNSTABLE:        'vl_unstable',
    VL_PRODUCTION_DBL:  'vl_production_double',
    VL_ELECTRICITY:     'vl_electricity',
    VL_COMPLETE:        'vl_complete',
    VL_SAVE_HUMANITY: 'vl_save_humanity',
    CARD_COOL: 'card_cool',
} as const;

export type AudioKey = typeof AUDIO[keyof typeof AUDIO];

// ── Persistent volume state ───────────────────────────────────────────────────

const STORAGE_KEY = 'sasa_volumes';

const defaults = { music: 0.12, sfx: 0.6, voicelines: 0.85, cardSfx: 1.0 };

function loadVolumes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch { return { ...defaults }; }
}

export const volumes = loadVolumes();
// Apply persisted card volume immediately so CardSFX starts at the right level
setCardVolume(volumes.cardSfx);

function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes)); } catch {}
}

export function setMusicVolume(scene: Scene, v: number) {
    volumes.music = v;
    save();
    const snd = scene.sound.get(AUDIO.BG_MUSIC) as Phaser.Sound.WebAudioSound | null;
    snd?.setVolume(v);
}

export function setSfxVolume(v: number) {
    volumes.sfx = v;
    save();
}

export function setVoicelineVolume(v: number) {
    volumes.voicelines = v;
    save();
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
    scene.load.audio(AUDIO.BTN_HOVER,       'button_hover_click.mp3');
    
    scene.load.path = 'assets/audio/card/';
    scene.load.audio(AUDIO.CARD_COOL,       'cool.m4a');



    scene.load.path = 'assets/audio/voicelines/';
    scene.load.audio(AUDIO.MACHINE_INTRO_1, 'machineintro1.m4a');
    scene.load.audio(AUDIO.MACHINE_INTRO_2, 'machineintro2.m4a');
    scene.load.audio(AUDIO.INTRO_1,         'intro1.m4a');
    scene.load.audio(AUDIO.INTRO_2,         'intro2.m4a');
    scene.load.audio(AUDIO.VL_INITIAL,         'initial.m4a');
    scene.load.audio(AUDIO.VL_GIVE_ENERGY,     'give_energy.m4a');
    scene.load.audio(AUDIO.VL_OPTIMIZING,      'optimizing.m4a');
    scene.load.audio(AUDIO.VL_LIMITED,         'limited.m4a');
    scene.load.audio(AUDIO.VL_HEAT_INCREASING, 'heat_increasing.m4a');
    scene.load.audio(AUDIO.VL_HEAT_LEVEL_42,   'heat_level_42.m4a');
    scene.load.audio(AUDIO.VL_OVERHEAT,        'overheat.m4a');
    scene.load.audio(AUDIO.VL_CANNOT_SUSTAIN,  'cannotsustain.m4a');
    scene.load.audio(AUDIO.VL_OVERRIDING,      'overridingsafety.m4a');
    scene.load.audio(AUDIO.VL_UNSTABLE,        'unstable.m4a');
    scene.load.audio(AUDIO.VL_PRODUCTION_DBL,  'production_double.m4a');
    scene.load.audio(AUDIO.VL_ELECTRICITY,     'electricity.m4a');
    scene.load.audio(AUDIO.VL_COMPLETE,        'complete.mp3');
    scene.load.audio(AUDIO.VL_SAVE_HUMANITY,   'savehumanity.m4a');
}

// ── Playback ──────────────────────────────────────────────────────────────────

export function playMusic(scene: Scene) {
    if (!scene.sound.get(AUDIO.BG_MUSIC)) {
        scene.sound.add(AUDIO.BG_MUSIC, { loop: true, volume: volumes.music }).play();
    }
}

export function stopMusic(scene: Scene) {
    scene.sound.get(AUDIO.BG_MUSIC)?.stop();
}

export function playSFX(scene: Scene, key: AudioKey) {
    if (scene.cache.audio.has(key)) {
        scene.sound.play(key, { volume: volumes.sfx });
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

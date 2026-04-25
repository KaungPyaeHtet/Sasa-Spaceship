import { Scene, GameObjects, Math as PMath } from 'phaser';
import { playHover } from '../ui/sounds';
import {
    volumes,
    setMusicVolume,
    setSfxVolume,
    setVoicelineVolume,
    setCardSfxVolume,
} from '../audio/AudioManager';

const CX      = 512;
const LABEL_X = 380;
const BAR_X   = 640;
const BAR_W   = 200;
const BAR_H   = 16;
const ROW_GAP = 52;

const STYLE_TITLE: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
    stroke: '#000000', strokeThickness: 7, align: 'center',
};
const STYLE_SECTION: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Arial Black', fontSize: 22, color: '#ffdd00',
    stroke: '#000000', strokeThickness: 5,
};
const STYLE_LABEL: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
    stroke: '#000000', strokeThickness: 3,
};
const STYLE_BTN: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Arial Black', fontSize: 22,
    stroke: '#000000', strokeThickness: 4,
};

export class PauseMenu extends Scene {
    constructor() { super('PauseMenu'); }

    create() {
        // Dimmed overlay over the game
        this.add.rectangle(CX, 384, 1024, 768, 0x000000, 0.6);

        // Panel
        this.add.rectangle(CX, 384, 800, 640, 0x0d1b2a, 0.96)
            .setStrokeStyle(2, 0x22cc88);

        this.add.text(CX, 120, 'PAUSED', STYLE_TITLE).setOrigin(0.5);

        // ── Audio ─────────────────────────────────────────────────────────────
        this.add.text(CX, 175, 'Audio', STYLE_SECTION).setOrigin(0.5);
        this.makeSliderRow(175 + ROW_GAP,     'Music',      volumes.music,      (v) => setMusicVolume(this, v));
        this.makeSliderRow(175 + ROW_GAP * 2, 'Card SFX',   volumes.cardSfx,    (v) => setCardSfxVolume(v));
        this.makeSliderRow(175 + ROW_GAP * 3, 'SFX',        volumes.sfx,        (v) => setSfxVolume(v));
        this.makeSliderRow(175 + ROW_GAP * 4, 'Voiceovers', volumes.voicelines, (v) => setVoicelineVolume(v));

        // ── Graphics ──────────────────────────────────────────────────────────
        this.add.text(CX, 175 + ROW_GAP * 5 + 10, 'Graphics', STYLE_SECTION).setOrigin(0.5);
        const fsY = 175 + ROW_GAP * 6 + 10;
        this.add.text(LABEL_X, fsY, 'Fullscreen', STYLE_LABEL).setOrigin(1, 0.5);
        this.makeToggle(BAR_X + BAR_W / 2, fsY, this.scale.isFullscreen,
            (on) => on ? this.scale.startFullscreen() : this.scale.stopFullscreen());

        // ── Continue button ───────────────────────────────────────────────────
        const continueBtn = this.add.text(CX, 660, 'Continue Playing', {
            fontFamily: 'Arial Black', fontSize: 26, color: '#22ffaa',
            stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueBtn
            .on('pointerover', () => { continueBtn.setColor('#ffffff'); playHover(this); })
            .on('pointerout',  () => continueBtn.setColor('#22ffaa'))
            .on('pointerdown', () => this.resume());
    }

    private resume() {
        this.scene.stop();
        this.scene.resume('Game');
    }

    // ─── Row builders ─────────────────────────────────────────────────────────

    private makeSliderRow(y: number, label: string, initial: number, onChange: (v: number) => void) {
        this.add.text(LABEL_X, y, label, STYLE_LABEL).setOrigin(1, 0.5);
        this.makeSlider(BAR_X, y, initial, onChange);
    }

    private makeSlider(x: number, y: number, initial: number, onChange: (v: number) => void) {
        this.add.rectangle(x + BAR_W / 2, y, BAR_W, BAR_H, 0x555555).setOrigin(0.5);

        const gfx = this.add.graphics();
        const drawFill = (value: number) => {
            gfx.clear();
            gfx.fillStyle(0x00cc66);
            gfx.fillRect(x, y - BAR_H / 2, BAR_W * value, BAR_H);
        };
        drawFill(initial);

        const handle = this.add.circle(x + BAR_W * initial, y, 12, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true });
        this.input.setDraggable(handle);

        const applyValue = (worldX: number) => {
            const cx = PMath.Clamp(worldX, x, x + BAR_W);
            handle.x = cx;
            drawFill((cx - x) / BAR_W);
            onChange((cx - x) / BAR_W);
        };

        handle.on('drag', (_p: Phaser.Input.Pointer, dragX: number) => applyValue(dragX));
        this.add.rectangle(x + BAR_W / 2, y, BAR_W, 30, 0x000000, 0)
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', (p: Phaser.Input.Pointer) => applyValue(p.worldX));
    }

    private makeToggle(x: number, y: number, initial: boolean, onToggle: (on: boolean) => void): GameObjects.Text {
        let state = initial;
        const btn = this.add.text(x, y, state ? 'ON' : 'OFF', {
            ...STYLE_BTN, color: state ? '#00ff88' : '#ff4444',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            state = !state;
            btn.setText(state ? 'ON' : 'OFF').setColor(state ? '#00ff88' : '#ff4444');
            onToggle(state);
        });

        return btn;
    }
}

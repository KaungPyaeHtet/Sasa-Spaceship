import { Scene } from 'phaser';
import { AUDIO, playSFX } from '../audio/AudioManager';

const PANELS = ['story1', 'story2', 'story3', 'story4'];

const PANEL_AUDIO = [AUDIO.INTRO_1, AUDIO.MACHINE_INTRO_1, AUDIO.INTRO_2, AUDIO.MACHINE_INTRO_2];

export class Story extends Scene {
    private current = 0;
    private panel!: Phaser.GameObjects.Image;
    private hint!: Phaser.GameObjects.Text;

    constructor() { super('Story'); }

    create() {
        this.current = 0;
        this.showPanel(0);

        this.input.on('pointerdown', () => this.advance());
    }

    private stopCurrentVoice() {
        const key = PANEL_AUDIO[this.current];
        if (key) this.sound.get(key)?.stop();
    }

    private showPanel(index: number) {
        if (this.panel) this.panel.destroy();

        this.panel = this.add.image(512, 384, PANELS[index])
            .setDisplaySize(1024, 768)
            .setDepth(0)
            .setAlpha(0);

        this.tweens.add({ targets: this.panel, alpha: 1, duration: 400, ease: 'Linear' });

        const key = PANEL_AUDIO[index];
        if (key) playSFX(this, key);

        if (this.hint) this.hint.destroy();
        const label = index < PANELS.length - 1 ? 'Click to continue...' : 'Click to start!';
        this.hint = this.add.text(512, 740, label, {
            fontSize: '16px', color: '#aaaaaa',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 1).setDepth(10).setAlpha(0);

        this.tweens.add({ targets: this.hint, alpha: 1, duration: 600, delay: 500 });
    }

    private advance() {
        this.stopCurrentVoice();
        this.current++;
        if (this.current >= PANELS.length) {
            this.scene.start('MainMenu');
        } else {
            this.showPanel(this.current);
        }
    }
}

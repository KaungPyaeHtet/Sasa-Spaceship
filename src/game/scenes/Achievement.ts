import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';
import { playSFX, AUDIO } from '../audio/AudioManager';

export class Achievement extends Scene {
    constructor() { super('Achievement'); }

    create() {
        // Full-screen achievement image
        this.add.image(512, 384, 'achievement_scene')
            .setDisplaySize(1024, 768);

        // "Continue" button at the bottom
        const btn = this.add.image(512, 700, 'blue_button')
            .setScale(0.1).setDepth(10)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => { btn.setTint(0xaaaaaa); playHover(this); })
            .on('pointerout',  () => btn.clearTint())
            .on('pointerdown', () => this.scene.start('MainMenu'));

        this.add.text(512, 700, 'Continue', {
            fontFamily: 'Arial Black', fontSize: '26px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(11);

        // Fade in and play victory sound
        this.cameras.main.setAlpha(0);
        this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 800,
            onComplete: () => playSFX(this, AUDIO.VICTORY),
        });
    }
}

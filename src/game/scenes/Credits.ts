import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';

const CREDITS = [
    { role: 'SASA SPACES', name: '', big: true },
    { role: '',             name: '', big: false },
    { role: 'Game Design',  name: 'Your Team', big: false },
    { role: 'Programming',  name: 'Your Team', big: false },
    { role: 'Art & Assets', name: 'Your Team', big: false },
    { role: 'Sound',        name: 'Your Team', big: false },
    { role: '',             name: '', big: false },
    { role: 'Special Thanks', name: '', big: true },
    { role: '',             name: '', big: false },
    { role: 'Phaser 3',     name: 'photonstorm / Phaser Studio', big: false },
    { role: 'Made with',    name: 'TypeScript + Vite',           big: false },
    { role: '',             name: '', big: false },
    { role: '— Thank you for playing —', name: '', big: true },
];

export class Credits extends Scene {
    constructor() {
        super('Credits');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000814);
        this.add.image(512, 384, 'background').setAlpha(0.15);

        // Build credit lines into a container that scrolls upward
        const container = this.add.container(0, 0);
        let offsetY = 768; // start below screen

        CREDITS.forEach(entry => {
            if (!entry.role && !entry.name) {
                offsetY += 24;
                return;
            }

            if (entry.big) {
                const t = this.add.text(512, offsetY, entry.role, {
                    fontFamily: 'Arial Black',
                    fontSize: '32px',
                    color: '#00aeff',
                    align: 'center',
                }).setOrigin(0.5, 0);
                container.add(t);
                offsetY += 52;
            } else {
                const role = this.add.text(380, offsetY, entry.role, {
                    fontSize: '18px',
                    color: '#888888',
                    align: 'right',
                }).setOrigin(1, 0);

                const name = this.add.text(400, offsetY, entry.name, {
                    fontSize: '18px',
                    color: '#ffffff',
                    fontStyle: 'bold',
                }).setOrigin(0, 0);

                container.add([role, name]);
                offsetY += 34;
            }
        });

        const totalHeight = offsetY + 200;

        // Scroll the container upward
        this.tweens.add({
            targets: container,
            y: -(totalHeight),
            duration: totalHeight * 18, // ~18ms per pixel → smooth scroll
            ease: 'Linear',
            onComplete: () => this.scene.start('MainMenu'),
        });

        // Skip button
        this.makeButton(512, 720, 'Skip → Main Menu', () => this.scene.start('MainMenu'));

        // Entrance fade
        this.cameras.main.setAlpha(0);
        this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 500 });
    }

    private makeButton(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.image(x, y, 'blue_button').setScale(0.1).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        bg.on('pointerdown', onClick)
          .on('pointerover', () => { bg.setTint(0xaaaaaa); playHover(this); })
          .on('pointerout',  () => bg.clearTint());
    }
}

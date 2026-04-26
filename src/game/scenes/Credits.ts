import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';

const CREDITS = [
    { role: '', name: '', big: false },
    { role: "Game Design", name: "Vincent", big: false},
    { role: 'Coding',  name: 'Ozzy', big: false },
    { role: 'Game Art & UI',  name: 'Kimmey', big: false },
    { role: 'Audio & Storyline', name: 'Nora', big: false },
    { role: 'Sound',        name: 'Alex', big: false },
    { role: '',             name: '', big: false },
    { role: 'Special Thanks', name: '', big: true },
    { role: '',             name: '', big: false },
    { role: 'Phaser 3',     name: 'Phaser Studio', big: false },
    { role: 'Made with',    name: 'TypeScript + Vite',           big: false },
    { role: '',             name: '', big: false },
    { role: '— Thank you for playing our game :) —', name: '', big: true },
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

        const logo = this.add.image(512, offsetY + 100, 'logo').setOrigin(0.5, 0).setScale(0.15);
        container.add(logo);
        offsetY += 350;

        CREDITS.forEach(entry => {
            if (!entry.role && !entry.name) {
                offsetY += 24;
                return;
            }

            if (entry.big) {
                const t = this.add.text(512, offsetY, entry.role, {
                    fontFamily: 'Supercharge',
                    fontSize: '34px',
                    color: '#00aeff',
                    align: 'center',
                }).setOrigin(0.5, 0);
                container.add(t);
                offsetY += 56;
            } else {
                const role = this.add.text(340, offsetY, entry.role, {
                    fontFamily: 'Supercharge',
                    fontSize: '17px',
                    color: '#888888',
                    align: 'right',
                }).setOrigin(1, 0);

                const name = this.add.text(360, offsetY, entry.name, {
                    fontFamily: 'Supercharge',
                    fontSize: '17px',
                    color: '#ffffff',
                }).setOrigin(0, 0);

                container.add([role, name]);
                offsetY += 34;
            }
        });

        // Stop when the last credit line rests near the vertical center of the screen
        const lastLineY = offsetY - 56; // top of the last big entry
        const stopY = 384 - lastLineY;  // container.y that puts last line at y=384

        const scrollDistance = Math.abs(stopY); // 0 → stopY (negative)
        const duration = scrollDistance * 18;

        this.tweens.add({
            targets: container,
            y: stopY,
            duration,
            ease: 'Linear',
            onComplete: () => {
                this.time.delayedCall(2000, () => this.scene.start('MainMenu'));
            },
        });

        // Skip button
        this.makeButton(512, 720, 'Skip', () => this.scene.start('MainMenu'));

        // Entrance fade
        this.cameras.main.setAlpha(0);
        this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 500 });
    }

    private makeButton(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.image(x, y, 'blue_button').setScale(0.1).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontFamily: 'Supercharge',
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

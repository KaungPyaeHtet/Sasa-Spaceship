import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';

interface GameOverData {
    won: boolean;
    points: number;
    products: number;
    level: { maxHeat: number; targetProducts: number };
}

export class GameOver extends Scene {
    private gameResult: GameOverData;

    constructor() {
        super('GameOver');
    }

    init(data: GameOverData) {
        this.gameResult = data ?? { won: false, points: 0, products: 0, level: { maxHeat: 50, targetProducts: 10 } };
    }

    create() {
        const { won, points, products, level } = this.gameResult;

        // ── Background tint ──────────────────────────────────────────────
        this.cameras.main.setBackgroundColor(won ? 0x001a00 : 0x1a0000);
        this.add.image(512, 384, 'background').setAlpha(0.3);

        // ── Overlay panel ────────────────────────────────────────────────
        this.add.rectangle(512, 384, 560, 420, 0x000000, 0.7)
            .setStrokeStyle(3, won ? 0x22cc88 : 0xff4444);

        // ── Headline ─────────────────────────────────────────────────────
        const headline  = won ? 'MISSION\nCOMPLETE!' : 'GAME\nOVER';
        const headColor = won ? '#22cc88' : '#ff4444';

        this.add.text(512, 210, headline, {
            fontFamily: 'Arial Black',
            fontSize: '58px',
            color: headColor,
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
        }).setOrigin(0.5);

        // ── Flavour line ─────────────────────────────────────────────────
        const flavour = won
            ? 'The spaceship has launched successfully!'
            : 'The reactor overheated. Systems failure.';

        this.add.text(512, 315, flavour, {
            fontSize: '16px',
            color: '#cccccc',
            align: 'center',
        }).setOrigin(0.5);

        // ── Stats ────────────────────────────────────────────────────────
        const statsY = 370;

        this.add.text(380, statsY, '📦 Products\n⭐ Points', {
            fontSize: '18px',
            color: '#aaaaaa',
            align: 'right',
        }).setOrigin(1, 0);

        this.add.text(644, statsY,
            `${products} / ${level.targetProducts}\n${points}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0, 0);

        // ── Buttons ───────────────────────────────────────────────────────
        this.makeButton(512, 490, 'Play Again', () => this.scene.start('LevelMenu'));
        this.makeButton(512, 555, 'Main Menu',  () => this.scene.start('MainMenu'));
        this.makeButton(512, 620, 'Credits',    () => this.scene.start('Credits'));

        // ── Entrance animation ────────────────────────────────────────────
        this.cameras.main.setAlpha(0);
        this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 600 });
    }

    private makeButton(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.image(x, y, 'blue_button').setScale(0.1).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        bg.on('pointerdown', onClick)
          .on('pointerover', () => { bg.setTint(0xaaaaaa); playHover(this); })
          .on('pointerout',  () => bg.clearTint());
    }
}

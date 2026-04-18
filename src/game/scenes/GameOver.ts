import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';
import { saveLevelResult } from '../data/progress';

interface GameOverData {
    won:             boolean;
    stars:           number;
    reason:          'overheat' | 'timeout';
    points:          number;
    products:        number;
    spaceshipsBuilt: number;
    levelIndex:      number;
    level:           { maxHeat: number; electricityNeeded: number; fuelNeeded: number; titaniumNeeded: number };
}

export class GameOver extends Scene {
    private gameResult: GameOverData;

    constructor() {
        super('GameOver');
    }

    init(data: GameOverData) {
        this.gameResult = data ?? { won: false, stars: 0, reason: 'timeout', points: 0, products: 0, spaceshipsBuilt: 0, levelIndex: 1, level: { maxHeat: 100, electricityNeeded: 10, fuelNeeded: 8, titaniumNeeded: 6 } };
        saveLevelResult(this.gameResult.levelIndex, this.gameResult.stars);
    }

    create() {
        const { won, stars, reason, points, products, spaceshipsBuilt, level } = this.gameResult;
        const totalNeeded = level.electricityNeeded + level.fuelNeeded + level.titaniumNeeded;

        // ── Background tint ──────────────────────────────────────────────
        this.cameras.main.setBackgroundColor(won ? 0x001a00 : 0x1a0000);
        this.add.image(512, 384, 'background').setAlpha(0.3);

        // ── Overlay panel ────────────────────────────────────────────────
        this.add.rectangle(512, 384, 560, 460, 0x000000, 0.75)
            .setStrokeStyle(3, won ? 0x22cc88 : 0xff4444);

        // ── Headline ─────────────────────────────────────────────────────
        let headline:  string;
        let headColor: string;
        if (!won) {
            headline  = 'MISSION\nFAILED';
            headColor = '#ff4444';
        } else if (stars === 3) {
            headline  = 'MISSION\nCOMPLETE!';
            headColor = '#22cc88';
        } else {
            headline  = 'MISSION\nPARTIAL';
            headColor = '#ffcc00';
        }

        this.add.text(512, 185, headline, {
            fontFamily: 'Arial Black',
            fontSize: '56px',
            color: headColor,
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
        }).setOrigin(0.5);

        // ── Star rating ───────────────────────────────────────────────────
        const starY = 310;
        const STAR_SPACING = 64;
        for (let i = 1; i <= 3; i++) {
            const filled = i <= stars;
            this.add.text(512 + (i - 2) * STAR_SPACING, starY,
                filled ? '★' : '☆',
                {
                    fontSize: '52px',
                    color: filled ? '#ffcc00' : '#444444',
                    stroke: '#000000',
                    strokeThickness: 4,
                }
            ).setOrigin(0.5);
        }

        // ── Flavour line ─────────────────────────────────────────────────
        const flavourMap: Record<number, string> = {
            0: reason === 'overheat' ? 'The reactor overheated. Systems failure.' : 'Time\'s up — no ships were built. Mission failed.',
            1: 'Barely made it — one ship launched in time.',
            2: 'Good work — two ships are underway!',
            3: 'Outstanding — three ships launched!',
        };
        this.add.text(512, 370, flavourMap[stars] ?? '', {
            fontSize: '15px',
            color: '#cccccc',
            align: 'center',
        }).setOrigin(0.5);

        // ── Stats ────────────────────────────────────────────────────────
        const statsY = 410;
        this.add.text(370, statsY, '🚀 Spaceships\n📦 Resources\n⭐ Points', {
            fontSize: '17px',
            color: '#aaaaaa',
            align: 'right',
            lineSpacing: 4,
        }).setOrigin(1, 0);

        this.add.text(650, statsY,
            `${spaceshipsBuilt}\n${products} / ${totalNeeded}\n${points}`, {
            fontSize: '17px',
            color: '#ffffff',
            fontStyle: 'bold',
            lineSpacing: 4,
        }).setOrigin(0, 0);

        // ── Buttons ───────────────────────────────────────────────────────
        this.makeButton(512, 490, 'Play Again',     () => this.scene.start('LevelMenu'));
        this.makeButton(512, 555, 'Upgrade Cards',  () => this.scene.start('CardUpgrade'));
        this.makeButton(512, 620, 'Main Menu',       () => this.scene.start('MainMenu'));

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

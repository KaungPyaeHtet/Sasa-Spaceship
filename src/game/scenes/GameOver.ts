import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';
import { saveLevelResult } from '../data/progress';

interface GameOverData {
    won:        boolean;
    stars:      number;
    reason:     'overheat' | 'timeout';
    levelIndex: number;
    timeTaken:  number;
}

export class GameOver extends Scene {
    private gameResult: GameOverData;

    constructor() {
        super('GameOver');
    }

    init(data: GameOverData) {
        this.gameResult = data ?? { won: false, stars: 0, reason: 'timeout', levelIndex: 1, timeTaken: 0 };
        saveLevelResult(this.gameResult.levelIndex, this.gameResult.stars);
    }

    create() {
        const { won, stars, timeTaken } = this.gameResult;

        this.cameras.main.setBackgroundColor(won ? 0x001a00 : 0x1a0000);
        this.add.image(512, 384, 'background').setAlpha(0.3);

        this.add.rectangle(512, 384, 480, 420, 0x000000, 0.75)
            .setStrokeStyle(3, won ? 0x22cc88 : 0xff4444);

        // Headline
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

        this.add.text(512, 200, headline, {
            fontFamily: 'Arial Black',
            fontSize:   '56px',
            color:      headColor,
            stroke:     '#000000',
            strokeThickness: 6,
            align:      'center',
        }).setOrigin(0.5);

        // Time taken
        const mins = Math.floor(timeTaken / 60);
        const secs = timeTaken % 60;
        const timeStr = mins > 0
            ? `${mins}m ${secs.toString().padStart(2, '0')}s`
            : `${secs}s`;

        this.add.text(512, 330, `Time: ${timeStr}`, {
            fontFamily: 'Arial',
            fontSize:   '22px',
            color:      '#cccccc',
        }).setOrigin(0.5);

        // Stars
        const STAR_SPACING = 64;
        for (let i = 1; i <= 3; i++) {
            const filled = i <= stars;
            this.add.text(512 + (i - 2) * STAR_SPACING, 400,
                filled ? '★' : '☆',
                {
                    fontSize:        '64px',
                    color:           filled ? '#ffcc00' : '#444444',
                    stroke:          '#000000',
                    strokeThickness: 4,
                }
            ).setOrigin(0.5);
        }

        // Buttons
        const isLevel10Complete = this.gameResult.levelIndex === 10 && won;
        this.makeButton(512, 500, 'Play Again', () => this.scene.start('LevelMenu'));
        this.makeButton(512, 570, isLevel10Complete ? 'View Achievement' : 'Main Menu',
            () => this.scene.start(isLevel10Complete ? 'Achievement' : 'MainMenu'));

        // Entrance animation
        this.cameras.main.setAlpha(0);
        this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 600 });
    }

    private makeButton(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.image(x, y, 'blue_button').setScale(0.1).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontFamily:      'Arial Black',
            fontSize:        '26px',
            color:           '#ffffff',
            stroke:          '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        bg.on('pointerdown', onClick)
          .on('pointerover', () => { bg.setTint(0xaaaaaa); playHover(this); })
          .on('pointerout',  () => bg.clearTint());
    }
}

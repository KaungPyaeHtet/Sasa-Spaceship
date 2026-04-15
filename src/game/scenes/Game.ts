import { Scene } from 'phaser';
import { levels } from '../data/levels';
import { cards } from '../data/cards';
import { createBackButton } from '../ui/BackButton';
import { createCardDisplay } from '../ui/CardDisplay';
import { StatusSprite } from '../ui/StatusSprite';

export class Game extends Scene {
    private levelData: typeof levels[0];
    private heat: number;
    private products: number;
    private overheatStatus: StatusSprite;
    private spaceshipStatus: StatusSprite;

    constructor() {
        super("Game");
    }

    init(data: { level: number }) {
        this.levelData = levels[data.level - 1];
        this.heat = 0;
        this.products = 0;
    }

    create() {
        this.add.image(512, 384, "background");

        this.overheatStatus  = new StatusSprite(this, 1024,  0, "overheat",  8);
        this.spaceshipStatus = new StatusSprite(this, 1024, 70, "spaceship", 8);

        createBackButton(this, "LevelMenu");
        this.spawnCards();
    }

    private spawnCards() {
        const cardWidth  = 140;
        const cardHeight = 200;
        const spacing    = 20;
        const totalWidth = cards.length * (cardWidth + spacing) - spacing;
        const startX     = (1024 - totalWidth) / 2;
        const y          = 768 - cardHeight / 2 - 20;

        cards.forEach((card, i) => {
            const x = startX + i * (cardWidth + spacing) + cardWidth / 2;
            createCardDisplay(this, x, y, cardWidth, cardHeight, card, (c) => {
                this.addHeat(c.heat);
                for (let j = 0; j < c.products; j++) this.completeProduct();
            });
        });
    }

    addHeat(amount: number) {
        this.heat = Math.min(this.heat + amount, this.levelData.maxHeat);
        this.overheatStatus.update(this.heat / this.levelData.maxHeat);

        if (this.heat >= this.levelData.maxHeat) {
            this.scene.start("GameOver");
        }
    }

    completeProduct() {
        this.products += 1;
        this.spaceshipStatus.update(this.products / this.levelData.targetProducts);

        if (this.products >= this.levelData.targetProducts) {
            this.scene.start("GameOver");
        }
    }
}

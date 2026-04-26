import { Scene } from "phaser";
import { createBackButton } from "../ui/BackButton";
import { playHover } from "../ui/sounds";
import { isLevelUnlocked, getBestStars } from "../data/progress";
import { playMusic } from "../audio/AudioManager";

export class LevelMenu extends Scene {
    constructor() {
        super("LevelMenu");
    }

    create() {
        playMusic(this);
        this.add.image(512, 384, "background");
        createBackButton(this, "MainMenu");


        this.add.text(512, 120, 'SELECT LEVEL', {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // Card Encyclopedia button (top-right)
        const encBtn = this.add.image(900, 64, 'blue_button')
            .setDisplaySize(180, 48).setInteractive({ useHandCursor: true })
            .on('pointerover', () => { encBtn.setTint(0xcccccc); playHover(this); })
            .on('pointerout',  () => encBtn.clearTint())
            .on('pointerdown', () => this.scene.start('CardInfo'));
        this.add.text(900, 64, 'Card Info', {
            fontFamily: 'Arial Black', fontSize: '18px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5);

        const cols     = 5;
        const spacingX = 160;
        const spacingY = 180;
        const startX   = 512 - (spacingX * (cols - 1)) / 2;
        const startY   = 280;

        for (let i = 1; i <= 10; i++) {
            const col      = (i - 1) % cols;
            const row      = Math.floor((i - 1) / cols);
            const x        = startX + col * spacingX;
            const y        = startY + row * spacingY;
            const unlocked = isLevelUnlocked(i);
            const best     = getBestStars(i);

            if (unlocked) {
                const bg = this.add
                    .image(x, y, "blue_box")
                    .setOrigin(0.5)
                    .setScale(0.05)
                    .setInteractive({ useHandCursor: true })
                    .on("pointerdown", () => this.scene.start("Game", { level: i }))
                    .on("pointerover", () => { bg.setTint(0xcccccc); playHover(this); })
                    .on("pointerout",  () => bg.clearTint());

                this.add.text(x, y - 14, String(i), {
                    fontFamily: "Arial Black",
                    fontSize: 28,
                    color: "#ffffff",
                }).setOrigin(0.5);

                // Star row below level number
                let starStr = '';
                for (let s = 1; s <= 3; s++) starStr += s <= best ? '★' : '☆';
                this.add.text(x, y + 20, starStr, {
                    fontSize: '32px',
                    color: '#ffcc00',
                }).setOrigin(0.5);

            } else {
                // Locked tile
                this.add.image(x, y, "blue_box")
                    .setOrigin(0.5)
                    .setScale(0.05)
                    .setTint(0x444444);

                this.add.text(x, y, '🔒', {
                    fontSize: '30px',
                }).setOrigin(0.5);
            }
        }

    }
}

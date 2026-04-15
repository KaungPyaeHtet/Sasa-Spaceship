import { Scene } from "phaser";
import { createBackButton } from "../ui/BackButton";

export class LevelMenu extends Scene {
    constructor() {
        super("LevelMenu");
    }

    create() {
        this.add.image(512, 384, "background");
        createBackButton(this, "MainMenu");

        // Level Boxes
        const cols = 5;
        const spacingX = 160;
        const spacingY = 160;
        const startX = 512 - (spacingX * (cols - 1)) / 2;
        const startY = 300;

        for (let i = 1; i <= 10; i++) {
            const col = (i - 1) % cols;
            const row = Math.floor((i - 1) / cols);
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const bg = this.add
                .image(x, y, "blue_box")
                .setOrigin(0.5)
                .setScale(0.05)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => this.scene.start("Game", { level: i }))
                .on("pointerover", () => {
                    bg.setTint(0xcccccc);
                })
                .on("pointerout", () => {
                    bg.clearTint();
                });

            this.add
                .text(x, y, String(i), {
                    fontFamily: "Arial Black",
                    fontSize: 32,
                    color: "#ffffff",
                })
                .setOrigin(0.5);
        }
    }

    // Deck Button
}

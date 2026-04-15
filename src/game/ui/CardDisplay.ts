import { Scene } from "phaser";
import { Card } from "../data/cards";

export function createCardDisplay(
    scene: Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    card: Card,
    onPlay: (card: Card) => void
) {
    const bg = scene.add.image(x, y, "card_sample").setScale(0.09);

    scene.add.text(x, y - h / 2 + 20, card.name, {
        fontSize: "14px", color: "#ffffff", align: "center", wordWrap: { width: w - 10 },
    }).setOrigin(0.5, 0);

    scene.add.text(x, y, `🔥 +${card.heat}\n📦 +${card.products}`, {
        fontSize: "18px", color: "#ffcc00", align: "center",
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true })
        .on("pointerover", () => bg.setTint(0xaaaaaa))
        .on("pointerout",  () => bg.clearTint())
        .on("pointerdown", () => onPlay(card));
}

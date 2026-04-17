import { Scene } from "phaser";
import { playHover } from "./sounds";

export function createBackButton(scene: Scene, target: string) {
    const btn = scene.add.text(20, 20, "← Back", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true })
        .on("pointerover", () => { btn.setColor("#aaaaaa"); playHover(scene); })
        .on("pointerout",  () => btn.setColor("#ffffff"))
        .on("pointerdown", () => scene.scene.start(target));

    return btn;
}

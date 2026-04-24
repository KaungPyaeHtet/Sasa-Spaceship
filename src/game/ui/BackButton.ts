import { Scene } from "phaser";
import { playHover } from "./sounds";

export function createBackButton(scene: Scene, target: string) {
    const btn = scene.add.image(100, 64, 'back_button')
        .setDisplaySize(140, 60)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => { btn.setAlpha(0.75); playHover(scene); })
        .on("pointerout",  () => btn.setAlpha(1))
        .on("pointerdown", () => scene.scene.start(target));

    return btn;
}

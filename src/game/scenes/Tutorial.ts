import { Scene, GameObjects } from "phaser";

export class Tutorial extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: GameObjects.Image;

    constructor() {
        super("Tutorial");
    }

    create() {
        this.background = this.add.image(512, 384, "background");
        this.input.on("pointerdown", () => {
            this.scene.start("MainMenu");
        });
    }
}

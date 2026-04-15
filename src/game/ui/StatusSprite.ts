import { Scene, Math as PhaserMath } from "phaser";

export class StatusSprite {
    private sprite: Phaser.GameObjects.Sprite;
    private frameCount: number;

    constructor(scene: Scene, x: number, y: number, baseKey: string, frameCount: number) {
        this.frameCount = frameCount;
        this.sprite = scene.add.sprite(x, y, `${baseKey}1`).setOrigin(1, 0).setScale(0.1);
    }

    // value: 0.0 to 1.0
    update(value: number) {
        const frame = PhaserMath.Clamp(Math.ceil(value * this.frameCount), 1, this.frameCount);
        this.sprite.setTexture(`${this.sprite.texture.key.replace(/\d+$/, "")}${frame}`);
    }
}

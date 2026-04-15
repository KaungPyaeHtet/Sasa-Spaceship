import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    private addAnimationSprite(x: number, y: number, defaultImg: string, scale: number, animation: string) {
        this.add
            .sprite(x, y, defaultImg)
            .setOrigin(1, 0)
            .setScale(scale)
            .play(animation)
    }
    constructor() {
        super("Game");
    }

    // All animation images will be processed first
    preload() {
        this.load.path = "assets/ui/overheat/";

        // Overheat UI
        for (let i = 1; i <= 8; i++) {
            this.load.image(`overheat${i}`, `overheat${i}.png`);
        }
        
        this.load.path = "assets/ui/spaceship/"
        // Spaceship UI
        for (let i = 1; i <= 8; i++) {
            this.load.image(`spaceship${i}`, `spaceship${i}.png`);
        }

    }

    create() {
        this.camera = this.cameras.main;

        this.background = this.add.image(512, 384, "background");

        // Overheat UI Creation
        this.anims.create({
            key: 'overheat_ui',
            frames: [
                { key : 'overheat1' },
                { key : 'overheat2' },
                { key : 'overheat3' },
                { key : 'overheat4' },
                { key : 'overheat5' },
                { key : 'overheat6' },
                { key : 'overheat7' },
                { key : 'overheat8' },
            ],
            frameRate: 8,
            repeat: -1
        })

        this.addAnimationSprite(1024, 0, "overheat1", 0.1, "overheat_ui")

        // Spaceship UI Creation
        this.anims.create({
            key: 'spaceship_ui',
            frames: [
                { key : 'spaceship1' },
                { key : 'spaceship2' },
                { key : 'spaceship3' },
                { key : 'spaceship4' },
                { key : 'spaceship5' },
                { key : 'spaceship6' },
                { key : 'spaceship7' },
                { key : 'spaceship8' },
            ],
            frameRate: 8,
            repeat: -1
        })
        
        this.addAnimationSprite(1024, 70, "spaceship1", 0.1, "spaceship_ui")
    }
}

import { Scene } from "phaser";
import { createAnimations } from "../data/animations";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, "background");

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        const percentText = this.add.text(512, 384 + 28, "0%", {
            fontSize: "18px",
            color: "#ffffff",
        }).setOrigin(0.5, 0);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
            percentText.setText(Math.floor(progress * 100) + "%");
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("card_sample", "cards/sample_card.png");

        this.load.path = "assets/ui/button/";
        this.load.image("blue_button", "blue.png");
        this.load.image("yellow_button", "yellow.png")
        this.load.path = "assets/ui/box/";
        this.load.image("blue_box", "blue.png");
        this.load.path = "assets/ui/overheat/";

        // Overheat UI
        for (let i = 1; i <= 8; i++) {
            this.load.image(`overheat${i}`, `overheat${i}.png`);
        }

        this.load.path = "assets/ui/spaceship/";
        // Spaceship UI
        for (let i = 1; i <= 8; i++) {
            this.load.image(`spaceship${i}`, `spaceship${i}.png`);
        }
        this.load.path = "assets/cards/";
        this.load.image("card_sample", "sample_card.png");
    }

    create() {
        createAnimations(this.anims);
        this.scene.transition({
            target: "MainMenu",
            duration: 500,
            moveBelow: true,
        });
    }
}

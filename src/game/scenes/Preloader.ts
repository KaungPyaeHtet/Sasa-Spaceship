import { Scene } from "phaser";
import { createAnimations } from "../data/animations";
import { VFX } from "../vfx/VFX";

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
        
        this.load.path = "assets/audio/";
        this.load.audio("btn_hover",   "button_hover_click.mp3");
        this.load.audio("bg_music",    "background_music.mp3");

        this.load.path = "assets/machine/level1_2/";
        for (let i = 1; i <= 4; i++) {
            this.load.image(`machine${i}`, `machine${i}.png`);
        }

        this.load.path = "assets/ui/spaceship/";
        this.load.image("spaceship_win", "spaceship1.png");

        // Cards — 3 upgrade tiers per card
        this.load.path = "assets/cards/Level 1/";
        this.load.image("boost_t1",       "L1 - Booster.png");
        this.load.image("cool_t1",        "L1 - Cooling.png");
        this.load.image("electricity_t1", "L1 - Electricity.png");
        this.load.image("fuel_t1",        "L1 - Fuel.png");
        this.load.image("solar_t1",       "L1 - Solar Cells.png");
        this.load.image("titanium_t1",    "L1 - Titanium.png");
        this.load.image("monitor_t1",     "L1 - Monitor.png");

        this.load.path = "assets/cards/Level 2/";
        this.load.image("boost_t2",       "L2 - Booster.png");
        this.load.image("cool_t2",        "L2 - Cooling System.png");
        this.load.image("electricity_t2", "L2 - Electricity.png");
        this.load.image("fuel_t2",        "L2 - Fuel.png");
        this.load.image("solar_t2",       "L2 - Solar Cells.png");
        this.load.image("titanium_t2",    "L2 - Titanium Material.png");
        this.load.image("monitor_t2",     "L2 - Monitor.png");

        this.load.path = "assets/cards/Level 3/";
        this.load.image("boost_t3",       "L3 - Booster.png");
        this.load.image("cool_t3",        "L3 - Cool Down.png");
        this.load.image("electricity_t3", "L3 - Electricity.png");
        this.load.image("fuel_t3",        "L3 - Fuel.png");
        this.load.image("solar_t3",       "L3 - Solar Cells.png");
        this.load.image("titanium_t3",    "L3 - Titanium.png");
        this.load.image("monitor_t3",     "L3 - Monitor.png");
    }

    create() {
        VFX.initTextures(this);
        createAnimations(this.anims);
        this.scene.transition({
            target: "MainMenu",
            duration: 500,
            moveBelow: true,
        });
    }
}

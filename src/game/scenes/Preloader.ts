import { Scene } from "phaser";
import { createAnimations } from "../data/animations";
import { VFX } from "../vfx/VFX";
import { preloadAudio } from "../audio/AudioManager";

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

        this.load.on("progress", (progress: number) => {
            bar.width = 4 + 460 * progress;
            percentText.setText(Math.floor(progress * 100) + "%");
        });

        // Silently skip files that fail to decode (e.g. unsupported audio format)
        this.load.on("loaderror", (file: { key: string; type: string }) => {
            console.warn(`[Preloader] skipped failed asset: ${file.type}/${file.key}`);
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.path = "assets/";
        this.load.image("logo", "logo.png");

        this.load.path = "assets/ui/button/";
        this.load.image("blue_button",   "blue.png");
        this.load.image("yellow_button", "yellow.png");
        this.load.image("back_button",   "back.png");
        this.load.image("setting_button", "setting.png");
        this.load.path = "assets/ui/box/";
        this.load.image("blue_box", "blue.png");
        this.load.path = "assets/ui/overheat/";

        preloadAudio(this);

        this.load.path = "assets/story/";
        this.load.image("story1", "scene1.png");
        this.load.image("story2", "scene2.png");
        this.load.image("story3", "scene3.png");
        this.load.image("story4", "scene4.png");

        this.load.path = "assets/machine/level1_2/";
        for (let i = 1; i <= 4; i++) {
            this.load.image(`machine${i}`, `machine${i}.png`);
        }

        this.load.path = "assets/spaceships/";
        this.load.image("spaceship_1",   "level1.png");
        this.load.image("spaceship_2",   "level2.png");
        this.load.image("spaceship_3",   "level3.png");
        this.load.image("spaceship_4",   "level4.png");
        this.load.image("spaceship_56",  "level56.png");
        this.load.image("spaceship_89",  "level89.png");
        this.load.image("spaceship_10",  "level10.png");

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
        this.load.image("monitor_t3", "L3 - Monitor.png");
        
        this.load.path = "assets/cards/Level 4/";
        this.load.image("boost_t4", "L4 - Booster.png");
        this.load.image("cool_t4", "L4 - Cooling.png");
        this.load.image("electricity_t4", "L4 - Electricity.png");
        this.load.image("fuel_t4", "L4 - Fuel.png");
        this.load.image("solar_t4", "L4 - Solar Cells.png");
        this.load.image("titanium_t4", "L4 - Titanium.png");
        this.load.image("monitor_t4", "L4 - Monitor.png");

        this.load.path = "assets/cards/Level 5/";
        this.load.image("boost_t5", "L5 - Booster.png");
        this.load.image("cool_t5", "L5 - Cooling.png");
        this.load.image("electricity_t5", "L5 - Electricity.png");
        this.load.image("fuel_t5", "L5 - Fuel.png");
        this.load.image("solar_t5", "L5 - Solar Cells.png");
        this.load.image("titanium_t5", "L5 - Titanium.png");
        this.load.image("monitor_t5", "L5 - Monitor.png");

        this.load.path = "assets/cards/Level 6/";
        this.load.image("boost_t6", "L6 - Booster.png");
        this.load.image("cool_t6", "L6 - Cooling.png");
        this.load.image("electricity_t6", "L6 - Electricity.png");
        this.load.image("fuel_t6", "L6 - Fuel.png");
        this.load.image("solar_t6", "L6 - Solar Cells.png");
        this.load.image("titanium_t6", "L6 - Titanium.png");
        this.load.image("monitor_t6", "L6 - Monitor.png");

        this.load.path = "assets/cards/Level 7/";
        this.load.image("boost_t7", "L7 - Booster.png");
        this.load.image("cool_t7", "L7 - Cooling.png");
        this.load.image("electricity_t7", "L7 - Electricity.png");
        this.load.image("fuel_t7", "L7 - Fuel.png");
        this.load.image("solar_t7", "L7 - Solar Cells.png");
        this.load.image("titanium_t7", "L7 - Titanium.png");
        this.load.image("monitor_t7", "L7 - Monitor.png");

        this.load.path = "assets/cards/Level 8/";
        this.load.image("boost_t8", "L8 - Booster.png");
        this.load.image("cool_t8", "L8 - Cooling.png");
        this.load.image("electricity_t8", "L8 - Electricity.png");
        this.load.image("fuel_t8", "L8 - Fuel.png");
        this.load.image("solar_t8", "L8 - Solar Cells.png");
        this.load.image("titanium_t8", "L8 - Titanium.png");
        this.load.image("monitor_t8", "L8 - Monitor.png");

        this.load.path = "assets/cards/Level 9/";
        this.load.image("boost_t9", "L9 - Booster.png");
        this.load.image("cool_t9", "L9 - Cooling.png");
        this.load.image("electricity_t9", "L9 - Electricity.png");
        this.load.image("fuel_t9", "L9 - Fuel.png");
        this.load.image("solar_t9", "L9 - Solar Cells.png");
        this.load.image("titanium_t9", "L9 - Titanium.png");
        this.load.image("monitor_t9", "L9 - Monitor.png");

        this.load.path = "assets/cards/Level 10/";
        this.load.image("boost_t10", "L10 - Booster.png");
        this.load.image("cool_t10", "L10 - Cooling.png");
        this.load.image("electricity_t10", "L10 - Electricity.png");
        this.load.image("fuel_t10", "L10 - Fuel.png");
        this.load.image("solar_t10", "L10 - Solar Cells.png");
        this.load.image("titanium_t10", "L10 - Titanium.png");
        this.load.image("monitor_t10", "L10 - Monitor.png");
    }

    create() {
        VFX.initTextures(this);
        createAnimations(this.anims);
        document.fonts.load('1em Supercharge').then(() => {
            this.scene.transition({
                // Change this in production
                target: "MainMenu",
                // target: "Story",
                duration: 500,
                moveBelow: true,
            });
        });
    }
}

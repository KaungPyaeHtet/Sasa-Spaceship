import { Scene, GameObjects, Math as PMath } from "phaser";

// ─── Shared text styles ───────────────────────────────────────────────────────

const STYLE_TITLE: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: "Arial Black", fontSize: 42, color: "#ffffff",
    stroke: "#000000", strokeThickness: 8, align: "center",
};

const STYLE_SECTION: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: "Arial Black", fontSize: 24, color: "#ffdd00",
    stroke: "#000000", strokeThickness: 5, align: "center",
};

const STYLE_LABEL: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: "Arial", fontSize: 18, color: "#ffffff",
    stroke: "#000000", strokeThickness: 3,
};

const STYLE_BUTTON: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: "Arial Black", fontSize: 22,
    stroke: "#000000", strokeThickness: 4,
};

const STYLE_BACK: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: "Arial Black", fontSize: 28, color: "#ffffff",
    stroke: "#000000", strokeThickness: 6, align: "center",
};

// ─── Layout constants ─────────────────────────────────────────────────────────

const CX = 512;         // canvas center X
const LABEL_X = 380;    // right-edge of labels
const BAR_X = 640;      // left-edge of sliders / toggles
const BAR_W = 200;
const BAR_H = 16;
const ROW_GAP = 55;

export class Setting extends Scene {
    background: GameObjects.Image;

    private masterVol = 1;
    private musicVol = 0.8;
    private sfxVol = 1;

    constructor() { super("Setting"); }

    create() {
        this.background = this.add.image(CX, 384, "background");
        this.add.text(CX, 40, "Settings", STYLE_TITLE).setOrigin(0.5);

        this.buildAudioSection(120);
        this.buildGraphicsSection(340);
        this.buildBackButton();
    }

    // ─── Sections ─────────────────────────────────────────────────────────────

    private buildAudioSection(y: number) {
        this.makeSectionLabel(CX, y, "Audio");

        this.makeSliderRow(y + ROW_GAP,      "Master Volume", this.masterVol, (v) => {
            this.masterVol = v;
            this.sound.setVolume(v);
        });
        this.makeSliderRow(y + ROW_GAP * 2,  "Music Volume",  this.musicVol, (v) => {
            this.musicVol = v;
            // this.sound.get('bgm')?.setVolume(v);
        });
        this.makeSliderRow(y + ROW_GAP * 3,  "SFX Volume",    this.sfxVol, (v) => {
            this.sfxVol = v;
        });
    }

    private buildGraphicsSection(y: number) {
        this.makeSectionLabel(CX, y, "Graphics");

        this.makeLabel(LABEL_X, y + ROW_GAP, "Fullscreen");
        this.makeToggle(
            BAR_X + BAR_W / 2, y + ROW_GAP,
            this.scale.isFullscreen,
            (on) => on ? this.scale.startFullscreen() : this.scale.stopFullscreen(),
        );
    }

    private buildBackButton() {
        this.add.text(CX, 700, "Back", STYLE_BACK)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", function (this: GameObjects.Text) { this.setColor("#aaaaaa"); })
            .on("pointerout",  function (this: GameObjects.Text) { this.setColor("#ffffff"); })
            .on("pointerdown", () => this.scene.start("MainMenu"));
    }

    // ─── Row builders ─────────────────────────────────────────────────────────

    private makeSliderRow(y: number, label: string, initial: number, onChange: (v: number) => void) {
        this.makeLabel(LABEL_X, y, label);
        this.makeSlider(BAR_X, y, initial, onChange);
    }

    // ─── UI primitives ────────────────────────────────────────────────────────

    private makeSectionLabel(x: number, y: number, text: string) {
        return this.add.text(x, y, text, STYLE_SECTION).setOrigin(0.5);
    }

    private makeLabel(x: number, y: number, text: string) {
        return this.add.text(x, y, text, STYLE_LABEL).setOrigin(1, 0.5);
    }

    private makeToggle(x: number, y: number, initial: boolean, onToggle: (on: boolean) => void): GameObjects.Text {
        let state = initial;
        const btn = this.add.text(x, y, state ? "ON" : "OFF", {
            ...STYLE_BUTTON,
            color: state ? "#00ff88" : "#ff4444",
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on("pointerdown", () => {
            state = !state;
            btn.setText(state ? "ON" : "OFF").setColor(state ? "#00ff88" : "#ff4444");
            onToggle(state);
        });

        return btn;
    }

    private makeSlider(x: number, y: number, initial: number, onChange: (v: number) => void) {
        // Track
        this.add.rectangle(x + BAR_W / 2, y, BAR_W, BAR_H, 0x555555).setOrigin(0.5);

        // Fill drawn via Graphics so width changes are reliable
        const gfx = this.add.graphics();
        const drawFill = (value: number) => {
            gfx.clear();
            gfx.fillStyle(0x00cc66);
            gfx.fillRect(x, y - BAR_H / 2, BAR_W * value, BAR_H);
        };
        drawFill(initial);

        // Handle
        const handle = this.add.circle(x + BAR_W * initial, y, 12, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true });
        this.input.setDraggable(handle);

        const applyValue = (worldX: number) => {
            const cx = PMath.Clamp(worldX, x, x + BAR_W);
            const value = (cx - x) / BAR_W;
            handle.x = cx;
            drawFill(value);
            onChange(value);
        };

        handle.on("drag", (_p: Phaser.Input.Pointer, dragX: number) => applyValue(dragX));

        // Click on track to jump
        this.add.rectangle(x + BAR_W / 2, y, BAR_W, 30, 0x000000, 0)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (p: Phaser.Input.Pointer) => applyValue(p.worldX));
    }
}

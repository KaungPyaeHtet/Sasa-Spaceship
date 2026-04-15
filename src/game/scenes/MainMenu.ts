import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    playTitle: GameObjects.Text;
    settingTitle: GameObjects.Text;
    tutorialTitle: GameObjects.Text;
    gameTitle: GameObjects.Text;


    private makeClickableText(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.image(x, y, "blue_button").setOrigin(0.5).setScale(0.1);

        const text = this.add
            .text(x, y, label, {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)

        bg.setInteractive({ useHandCursor: true })
            .on("pointerdown", onClick)
            .on("pointerover", () => {
                bg.setTint(0xcccccc);
            })
            .on("pointerout", () => {
                bg.clearTint();
            });

        return text;
    }
    
    constructor ()
    {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');
        
        this.gameTitle = this.add.text(512, 200, "Sasa Spaces", {
            fontFamily: "Bakbak One",
            fontSize: 110,
            color: "#00aeff",
            align: "center"
        }).setOrigin(0.5);

        const gradient = this.gameTitle.context.createLinearGradient(0, 0, this.gameTitle.width, 0);
        gradient.addColorStop(0, "#00EFFF");
        gradient.addColorStop(1, "#FFCC00");
        this.gameTitle.setFill(gradient);

        this.playTitle = this.makeClickableText(512, 380, 'Play', () => {
            this.scene.start('LevelMenu');
        });
        this.settingTitle = this.makeClickableText(512, 480, "Setting", () => {
            this.scene.start("Setting");
        });
        this.tutorialTitle = this.makeClickableText(512, 580, "Tutorial", () => {
            this.scene.start("Tutorial");
        });

    }
}

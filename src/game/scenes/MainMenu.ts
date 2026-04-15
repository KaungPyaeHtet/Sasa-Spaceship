import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    playTitle: GameObjects.Text;
    settingTitle: GameObjects.Text;
    tutorialTitle: GameObjects.Text;
    gameTitle: GameObjects.Text;


    private makeClickableText(x: number, y: number, label: string, onClick: () => void) {
        return this.add
            .text(x, y, label, {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", onClick)
            .on("pointerover", function (this: GameObjects.Text) {
                this.setColor("#d0ff00");
            })
            .on("pointerout", function (this: GameObjects.Text) {
                this.setColor("#ffffff");
            });
    }
    
    constructor ()
    {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');
        
        this.gameTitle = this.add.text(300, 200, "Sasa Spaces", {
            fontFamily: "Arial Black",
            fontSize: 60,
            color: "#00aeff",
            stroke: "#ffffff",
            strokeThickness: 12,
            align: "center"
        });

        this.playTitle = this.makeClickableText(512, 460, 'Play', () => {
            this.scene.start('Game');
        });
        this.settingTitle = this.makeClickableText(512, 520, "Setting", () => {
            this.scene.start("Setting");
        });
        this.tutorialTitle = this.makeClickableText(512, 580, "Tutorial", () => {
            this.scene.start("Tutorial");
        });

    }
}

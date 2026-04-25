import { Scene, GameObjects } from 'phaser';
import { playHover } from '../ui/sounds';
import { playMusic } from '../audio/AudioManager';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    playTitle: GameObjects.Text;
    settingTitle: GameObjects.Text;
    tutorialTitle: GameObjects.Text;


    private makeClickableText(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.image(x, y, "blue_button").setOrigin(0.5).setScale(0.1);

        const text = this.add
            .text(x, y, label, {
                fontFamily: "Supercharge",
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
                playHover(this);
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
        playMusic(this);
        this.background = this.add.image(512, 384, 'background');
        
        this.add.image(512, 200, 'logo').setOrigin(0.5).setScale(0.15);

        this.playTitle = this.makeClickableText(512, 360, 'Play', () => {
            this.scene.start('LevelMenu');
        });
        this.settingTitle = this.makeClickableText(512, 450, "Setting", () => {
            this.scene.start("Setting");
        });
        this.tutorialTitle = this.makeClickableText(512, 540, "Tutorial", () => {
            this.scene.start("Tutorial");
        });
        this.makeClickableText(512, 630, "Cards", () => {
            this.scene.start("CardInfo");
        });
        this.makeClickableText(512, 720, "Credits", () => {
            this.scene.start("Credits");
        });

    }
}

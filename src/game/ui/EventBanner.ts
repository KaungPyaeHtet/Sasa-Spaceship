import { Scene } from 'phaser';
import { GameEvent } from '../data/randomEvents';

export function showEventBanner(scene: Scene, evt: GameEvent) {
    const banner = scene.add.container(512, -60).setDepth(50);

    const bg = scene.add.rectangle(0, 0, 420, 52, 0x000000, 0.85)
        .setStrokeStyle(2, evt.color);
    const title = scene.add.text(0, -9,
        `${evt.icon}  ${evt.name.toUpperCase()}`,
        { fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 3, align: 'center' }
    ).setOrigin(0.5);
    const sub = scene.add.text(0, 12,
        evt.desc,
        { fontSize: '11px', color: '#cccccc', align: 'center' }
    ).setOrigin(0.5);

    banner.add([bg, title, sub]);

    scene.tweens.add({
        targets: banner, y: 50, duration: 350, ease: 'Back.Out',
        onComplete: () => {
            scene.time.delayedCall(evt.duration * 1000 - 400, () => {
                scene.tweens.add({
                    targets: banner, y: -80, duration: 300, ease: 'Quad.In',
                    onComplete: () => banner.destroy(),
                });
            });
        },
    });
}

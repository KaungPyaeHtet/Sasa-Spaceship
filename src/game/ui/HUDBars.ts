import { Scene } from 'phaser';

export const BAR_W  = 180;
export const BAR_X  = 1024 - BAR_W - 16;   // 828
export const BAR_H  = 20;

const RES_COLOR: Record<string, number> = {
    electricity: 0xaa44ff,
    fuel:        0xff8800,
    titanium:    0x88aacc,
};

export interface HeatBarRefs {
    fill:  Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
}

export interface ResBarRefs {
    fills:  Record<string, Phaser.GameObjects.Rectangle>;
    labels: Record<string, Phaser.GameObjects.Text>;
}

export function buildHeatBar(scene: Scene): HeatBarRefs {
    const y = 44;
    scene.add.text(BAR_X, y - 32, '🔥 HEAT', {
        fontSize: '13px', color: '#ff6644', fontStyle: 'bold',
    }).setDepth(8);
    scene.add.rectangle(BAR_X + BAR_W / 2, y, BAR_W, BAR_H, 0x222222).setDepth(8);

    const fill  = scene.add.rectangle(BAR_X, y, 0, BAR_H, 0xff2222).setOrigin(0, 0.5).setDepth(9);
    const label = scene.add.text(BAR_X + BAR_W / 2, y, '0', {
        fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    return { fill, label };
}

export function buildResourceBars(
    scene: Scene,
    levelData: { electricityNeeded: number; fuelNeeded: number; titaniumNeeded: number },
): ResBarRefs {
    const startY = 110;
    const gap    = 56;

    const fills:  Record<string, Phaser.GameObjects.Rectangle> = {};
    const labels: Record<string, Phaser.GameObjects.Text>      = {};

    const resources = ['electricity', 'fuel', 'titanium'] as const;
    const needed    = [levelData.electricityNeeded, levelData.fuelNeeded, levelData.titaniumNeeded];

    resources.forEach((res, i) => {
        const y     = startY + i * gap;
        const color = RES_COLOR[res];
        const req   = needed[i];

        scene.add.image(BAR_X + 10, y - 32, `${res}_t1`).setDisplaySize(20, 28).setDepth(8).setOrigin(0.5);
        scene.add.text(BAR_X + 24, y - 32, res.toUpperCase(), {
            fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
        }).setDepth(8).setOrigin(0, 0.5);
        scene.add.rectangle(BAR_X + BAR_W / 2, y, BAR_W, BAR_H, 0x222222).setDepth(8);

        fills[res]  = scene.add.rectangle(BAR_X, y, 0, BAR_H, color).setOrigin(0, 0.5).setDepth(9);
        labels[res] = scene.add.text(BAR_X + BAR_W / 2, y, `0 / ${req}`, {
            fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10).setAlpha(0);
    });

    return { fills, labels };
}

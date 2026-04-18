export function createAnimations(anims: Phaser.Animations.AnimationManager) {
    anims.create({
        key: "overheat_ui",
        frames: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ key: `overheat${i}` })),
        frameRate: 8,
    });

    anims.create({
        key: "spaceship_ui",
        frames: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ key: `spaceship${i}` })),
        frameRate: 8,
    });

    anims.create({
        key: "machine_run",
        frames: [1, 2, 3, 4].map((i) => ({ key: `machine${i}` })),
        frameRate: 4,
        repeat: -1,   // loop forever
    });
}

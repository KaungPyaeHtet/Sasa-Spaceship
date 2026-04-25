export function createAnimations(anims: Phaser.Animations.AnimationManager) {
    anims.create({
        key: "machine_run",
        frames: [1, 2, 3, 4].map((i) => ({ key: `machine${i}` })),
        frameRate: 4,
        repeat: -1,
    });
    anims.create({
        key: "machine_run_l5",
        frames: [1, 2, 3, 4].map((i) => ({ key: `machine_l5_${i}` })),
        frameRate: 4,
        repeat: -1,
    });
}

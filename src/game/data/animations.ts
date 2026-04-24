export function createAnimations(anims: Phaser.Animations.AnimationManager) {
    anims.create({
        key: "machine_run",
        frames: [1, 2, 3, 4].map((i) => ({ key: `machine${i}` })),
        frameRate: 4,
        repeat: -1,   // loop forever
    });
}

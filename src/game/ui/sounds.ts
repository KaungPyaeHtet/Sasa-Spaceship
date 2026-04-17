import { Scene } from 'phaser';

/** Play the hover/click sound if it has been loaded. Safe to call anywhere. */
export function playHover(scene: Scene) {
    if (scene.sound.get('btn_hover') || scene.cache.audio.has('btn_hover')) {
        scene.sound.play('btn_hover', { volume: 0.6 });
    }
}

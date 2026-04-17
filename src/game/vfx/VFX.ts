import { Scene } from 'phaser';
import { playHover } from '../ui/sounds';

// Per-card-type accent colours used for particles, borders, and floats
export const CARD_COLORS: Record<string, { bg: number; border: number; particle: number }> = {
    boost:       { bg: 0x2a1000, border: 0xff6600, particle: 0xff6600 },
    cool:        { bg: 0x001a2a, border: 0x00ccff, particle: 0x00ccff },
    electricity: { bg: 0x1a1a00, border: 0xffff00, particle: 0xffff00 },
    fuel:        { bg: 0x1a0800, border: 0xff4422, particle: 0xff4422 },
    solar:       { bg: 0x1a1400, border: 0xffcc00, particle: 0xffcc00 },
    titanium:    { bg: 0x111820, border: 0x88aacc, particle: 0x88aacc },
};

export class VFX {
    // ── One-time texture generation (call from Preloader.create) ──────────
    static initTextures(scene: Scene) {
        if (scene.textures.exists('vfx_dot')) return;

        // Soft glowing circle for general particles
        const g = scene.make.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(8, 8, 8);
        g.generateTexture('vfx_dot', 16, 16);

        // Tiny triangle for sparkle ambience
        g.clear();
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(6, 0, 12, 12, 0, 12);
        g.generateTexture('vfx_star', 12, 12);

        g.destroy();
    }

    // ── Particle burst (card play / finish) ───────────────────────────────
    static burst(scene: Scene, x: number, y: number, color: number, count = 22) {
        const emitter = scene.add.particles(x, y, 'vfx_dot', {
            speed:    { min: 60,  max: 300 },
            angle:    { min: 0,   max: 360 },
            lifespan: { min: 280, max: 650 },
            scale:    { start: 0.8, end: 0 },
            alpha:    { start: 1,   end: 0 },
            tint:     [color, 0xffffff],
            emitting: false,
        });
        emitter.setDepth(30);
        emitter.explode(count);
        scene.time.delayedCall(900, () => emitter.destroy());
    }

    // ── Upward floating reward text ────────────────────────────────────────
    static floatText(scene: Scene, x: number, y: number, text: string, color = '#ffffff') {
        const t = scene.add.text(x, y, text, {
            fontSize:        '22px',
            color,
            fontStyle:       'bold',
            stroke:          '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5).setDepth(35);

        scene.tweens.add({
            targets:  t,
            y:        y - 85,
            alpha:    0,
            duration: 1400,
            ease:     'Quad.Out',
            onComplete: () => t.destroy(),
        });
    }

    // ── Camera shake ───────────────────────────────────────────────────────
    static screenShake(scene: Scene, intensity = 0.005, duration = 240) {
        scene.cameras.main.shake(duration, intensity);
    }

    // ── Rectangular flash overlay ──────────────────────────────────────────
    static flashAt(scene: Scene, x: number, y: number, w: number, h: number, color = 0xffffff, alpha = 0.65) {
        const f = scene.add.rectangle(x, y, w, h, color, alpha).setDepth(20);
        scene.tweens.add({
            targets:  f,
            alpha:    0,
            duration: 350,
            onComplete: () => f.destroy(),
        });
    }

    // ── Pulsing drop-zone glow border ─────────────────────────────────────
    static setupDropZonePulse(scene: Scene, x: number, y: number, w: number, h: number): Phaser.GameObjects.Rectangle {
        const glow = scene.add
            .rectangle(x, y, w + 10, h + 10, 0x4488ff, 0)
            .setStrokeStyle(4, 0x4488ff)
            .setDepth(1);

        scene.tweens.add({
            targets:  glow,
            alpha:    { from: 0.1, to: 0.55 },
            yoyo:     true,
            repeat:   -1,
            duration: 850,
            ease:     'Sine.InOut',
        });

        return glow;
    }

    // ── Drop zone "accept" ring zoom-out ──────────────────────────────────
    static dropZoneAccept(scene: Scene, x: number, y: number, w: number, h: number) {
        const ring = scene.add
            .rectangle(x, y, w, h, 0xffffff, 0)
            .setStrokeStyle(6, 0xffffff)
            .setDepth(22);

        scene.tweens.add({
            targets:  ring,
            scaleX:   1.5,
            scaleY:   1.5,
            alpha:    0,
            duration: 400,
            ease:     'Quad.Out',
            onComplete: () => ring.destroy(),
        });
    }

    // ── Background ambient sparkles ────────────────────────────────────────
    static ambientParticles(scene: Scene) {
        const emitter = scene.add.particles(0, 0, 'vfx_star', {
            x:        { min: 0,   max: 1024 },
            y:        { min: 0,   max: 768  },
            speedY:   { min: -22, max: -6   },
            speedX:   { min: -6,  max: 6    },
            lifespan: { min: 2800, max: 5500 },
            scale:    { start: 0.28, end: 0  },
            alpha:    { start: 0.45, end: 0  },
            tint:     [0x4488ff, 0xffffff, 0xffcc44, 0x22cc88, 0xff88cc],
            frequency: 280,
        });
        emitter.setDepth(0);
    }

    // ── Deal-in entrance animation ────────────────────────────────────────
    static dealCard(scene: Scene, container: Phaser.GameObjects.Container, targetX: number, targetY: number, delay = 0) {
        container.setAlpha(0);
        container.setPosition(targetX, targetY + 90);
        container.setScale(0.85);

        scene.tweens.add({
            targets:  container,
            y:        targetY,
            alpha:    1,
            scaleX:   1,
            scaleY:   1,
            delay,
            duration: 380,
            ease:     'Back.Out',
        });
    }

    // ── Hover lift + tilt + shine + sound ────────────────────────────────
    static applyHoverEffects(
        scene: Scene,
        container: Phaser.GameObjects.Container,
        borderColor: number,
        shine: Phaser.GameObjects.Rectangle
    ) {
        const homeY: number = container.getData('homeY');
        const border: Phaser.GameObjects.Rectangle = container.getData('border');

        container.on('pointerover', () => {
            if (container.getData('dragging')) return;
            playHover(scene);
            if (border) border.setStrokeStyle(3, 0xffffff);
            scene.tweens.add({
                targets:  container,
                y:        homeY - 18,
                scaleX:   1.08,
                scaleY:   1.08,
                duration: 160,
                ease:     'Back.Out',
            });
            // Shine sweep
            shine.setVisible(true).setAlpha(0.35);
            shine.x = -80;
            scene.tweens.add({
                targets:  shine,
                x:        100,
                alpha:    0,
                duration: 420,
                ease:     'Quad.In',
                onComplete: () => shine.setVisible(false),
            });
        });

        container.on('pointermove', (ptr: Phaser.Input.Pointer) => {
            if (container.getData('dragging')) return;
            const localX  = ptr.worldX - container.x;
            const tiltDeg = Phaser.Math.Clamp((localX / 65) * 7, -7, 7);
            container.rotation = Phaser.Math.DegToRad(tiltDeg);
        });

        container.on('pointerout', () => {
            if (container.getData('dragging')) return;
            if (border) border.setStrokeStyle(2, borderColor);
            scene.tweens.add({
                targets:  container,
                y:        homeY,
                scaleX:   1,
                scaleY:   1,
                rotation: 0,
                duration: 200,
                ease:     'Back.Out',
            });
        });
    }
}

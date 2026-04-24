import { Scene } from "phaser";
import { Card } from "../data/cards";
import { CARD_COLORS, VFX } from "../vfx/VFX";

export const CARD_W = 130;
export const CARD_H = 190;

/**
 * Creates a draggable card container.
 * dealDelay staggers the fly-in animation (ms).
 */
export function createDraggableCard(
    scene: Scene,
    x: number,
    y: number,
    card: Card,
    dealDelay = 0
): Phaser.GameObjects.Container {
    const palette = CARD_COLORS[card.imageKey] ?? { bg: 0x1a2a4a, border: 0x4488ff, particle: 0x4488ff };

    // Full-card image as background
    const img = scene.add.image(0, 0, card.imageKey).setDisplaySize(CARD_W, CARD_H);

    // Dark overlay — hidden by default, fades in on hover
    const overlay = scene.add.rectangle(0, CARD_H / 4, CARD_W, CARD_H / 2, 0x000000, 0.68).setAlpha(0);

    // Coloured border ring
    const border = scene.add
        .rectangle(0, 0, CARD_W, CARD_H, 0x000000, 0)
        .setStrokeStyle(2, palette.border);

    // Name label — hidden by default
    const nameTxt = scene.add.text(0, -CARD_H / 2 + 10, card.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
        wordWrap: { width: CARD_W - 10 },
    }).setOrigin(0.5, 0).setAlpha(0);

    // Stats — hidden by default
    const heatSign = card.heat >= 0 ? '+' : '';
    const resAbbr: Record<string, string> = { electricity: 'ELEC', fuel: 'FUEL', titanium: 'TITA' };
    const resLine = card.resource
        ? `+${card.resourceAmount} ${resAbbr[card.resource]}`
        : 'COOLANT';
    const statsTxt = scene.add.text(
        0, CARD_H / 4 - 14,
        `${card.duration}s  HEAT ${heatSign}${card.heat}\n${resLine}  ★ +${card.points}`,
        { fontSize: '11px', color: '#ffee88', align: 'center', stroke: '#000000', strokeThickness: 2 }
    ).setOrigin(0.5, 0).setAlpha(0);

    // Description — hidden by default
    const descTxt = scene.add.text(0, CARD_H / 4 + 30, card.description, {
        fontSize: '10px',
        color: '#cccccc',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
        wordWrap: { width: CARD_W - 10 },
    }).setOrigin(0.5, 0).setAlpha(0);

    // Shine sweep layer — hidden by default
    const shine = scene.add
        .rectangle(-80, 0, 28, CARD_H + 10, 0xffffff, 0)
        .setVisible(false);

    const container = scene.add.container(x, y, [img, overlay, border, nameTxt, statsTxt, descTxt, shine]);
    container.setSize(CARD_W, CARD_H);
    container.setData('card', card);
    container.setData('homeX', x);
    container.setData('homeY', y);
    container.setData('dragging', false);
    container.setData('border', border);
    container.setData('details', [overlay, nameTxt, statsTxt, descTxt]);

    // Interactive
    container.setInteractive();
    scene.input.setDraggable(container);

    // Hover effects (lift, tilt, shine)
    VFX.applyHoverEffects(scene, container, palette.border, shine);

    // Deal-in animation
    VFX.dealCard(scene, container, x, y, dealDelay);

    return container;
}

// ─── Processing slot shown top-left while card is being processed ──────────

export interface ProcessingSlot {
    container: Phaser.GameObjects.Container;
    barFill:   Phaser.GameObjects.Rectangle;
    card:      Card;
    elapsed:   number;
}

const SLOT_W = 230;
const SLOT_H = 68;

export function createProcessingSlot(
    scene: Scene,
    x: number,
    y: number,
    card: Card
): ProcessingSlot {
    const palette = CARD_COLORS[card.imageKey] ?? { bg: 0x0d1b2a, border: 0x22cc88, particle: 0x22cc88 };

    const bg = scene.add.rectangle(0, 0, SLOT_W, SLOT_H, 0x080f18, 1)
        .setStrokeStyle(2, palette.border);

    const img = scene.add.image(-SLOT_W / 2 + 28, 0, card.imageKey)
        .setDisplaySize(42, 42);

    const nameTxt = scene.add.text(-SLOT_W / 2 + 58, -SLOT_H / 2 + 7, card.name, {
        fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    });

    const heatSign = card.heat >= 0 ? '+' : '';
    const resAbbr: Record<string, string> = { electricity: 'ELEC', fuel: 'FUEL', titanium: 'TITA' };
    const resStr = card.resource ? `+${card.resourceAmount} ${resAbbr[card.resource]}` : 'COOLANT';
    const infoTxt = scene.add.text(-SLOT_W / 2 + 58, -SLOT_H / 2 + 24,
        `H:${heatSign}${card.heat}  ${resStr}  ★+${card.points}`,
        { fontSize: '10px', color: '#ffcc00' }
    );

    // Progress bar
    const BAR_W    = SLOT_W - 24;
    const barTrack = scene.add.rectangle(0, SLOT_H / 2 - 12, BAR_W, 9, 0x1a2a3a);
    const barFill  = scene.add.rectangle(-(BAR_W / 2), SLOT_H / 2 - 12, BAR_W, 9, palette.border)
        .setOrigin(0, 0.5);

    const container = scene.add.container(x, y, [bg, img, nameTxt, infoTxt, barTrack, barFill]);
    container.setDepth(5);
    container.setAlpha(0);
    container.setScale(0.8);

    // Slot pop-in
    scene.tweens.add({
        targets:  container,
        alpha:    1,
        scaleX:   1,
        scaleY:   1,
        duration: 250,
        ease:     'Back.Out',
    });

    // Slot border pulse while processing
    scene.tweens.add({
        targets:  bg,
        alpha:    { from: 0.7, to: 1 },
        yoyo:     true,
        repeat:   -1,
        duration: 700,
        ease:     'Sine.InOut',
    });

    return { container, barFill, card, elapsed: 0 };
}

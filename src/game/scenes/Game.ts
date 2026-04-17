import { Scene } from 'phaser';
import { levels } from '../data/levels';
import { cardDefinitions, Card } from '../data/cards';
import { createBackButton } from '../ui/BackButton';
import { StatusSprite } from '../ui/StatusSprite';
import {
    createDraggableCard,
    createProcessingSlot,
    ProcessingSlot,
} from '../ui/CardDisplay';
import { VFX, CARD_COLORS } from '../vfx/VFX';

const HAND_SIZE      = 4;
const MAX_PROC_SLOTS = 3;
const DROP_ZONE_X    = 512;
const DROP_ZONE_Y    = 384;
const DROP_ZONE_W    = 220;
const DROP_ZONE_H    = 220;

export class Game extends Scene {
    private levelData: typeof levels[0];
    private heat: number;
    private products: number;
    private points: number;

    private overheatStatus: StatusSprite;
    private spaceshipStatus: StatusSprite;

    private deck:       Card[];
    private hand:       (Phaser.GameObjects.Container | null)[];
    private processing: (ProcessingSlot | null)[];

    private dropZonePulse: Phaser.GameObjects.Rectangle;

    /** X position of the dragged card on the previous frame (for tilt calc) */
    private prevDragX = 0;

    constructor() {
        super('Game');
    }

    init(data: { level: number }) {
        this.levelData = levels[data.level - 1];
        this.heat      = 0;
        this.products  = 0;
        this.points    = 0;
    }

    create() {
        // ── Background + ambient particles ───────────────────────────────
        this.add.image(512, 384, 'background');
        VFX.ambientParticles(this);

        // ── Status bars ──────────────────────────────────────────────────
        this.overheatStatus  = new StatusSprite(this, 1024,  0, 'overheat',  8);
        this.spaceshipStatus = new StatusSprite(this, 1024, 70, 'spaceship', 8);

        createBackButton(this, 'LevelMenu');

        // ── Drop zone ────────────────────────────────────────────────────
        this.add.rectangle(DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H, 0x000000, 0)
            .setStrokeStyle(1, 0x22334d);

        this.dropZonePulse = VFX.setupDropZonePulse(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H);

        this.add.text(DROP_ZONE_X, DROP_ZONE_Y, 'DROP\nCARD\nHERE', {
            fontSize:  '22px',
            color:     '#334455',
            align:     'center',
            fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0.6).setDepth(0);

        const zone = this.add.zone(DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H)
            .setRectangleDropZone(DROP_ZONE_W, DROP_ZONE_H);

        // ── Processing slots header ───────────────────────────────────────
        this.add.text(20, 145, 'PROCESSING', {
            fontSize: '11px', color: '#22cc88', fontStyle: 'bold',
        }).setDepth(6);

        this.processing = Array(MAX_PROC_SLOTS).fill(null);

        // ── Deck + hand ───────────────────────────────────────────────────
        this.deck = this.buildShuffledDeck();
        this.hand = Array(HAND_SIZE).fill(null);
        this.dealHand();

        // ── Drag events ───────────────────────────────────────────────────
        this.input.on('dragstart', (_ptr: unknown, obj: Phaser.GameObjects.Container) => {
            obj.setData('dragging', true);
            obj.setDepth(50);
            this.prevDragX = obj.x;
            // Reset any hover tween
            this.tweens.add({ targets: obj, scaleX: 1.1, scaleY: 1.1, duration: 100 });
        });

        this.input.on('drag', (_ptr: unknown, obj: Phaser.GameObjects.Container, dx: number, dy: number) => {
            const vx = dx - this.prevDragX;
            obj.x = dx;
            obj.y = dy;
            // Tilt card based on horizontal velocity
            const targetRot = Phaser.Math.Clamp(vx * 0.04, -0.35, 0.35);
            obj.rotation += (targetRot - obj.rotation) * 0.25;
            this.prevDragX = dx;
        });

        this.input.on('dragenter', (_ptr: unknown, _obj: unknown, dropZone: Phaser.GameObjects.Zone) => {
            if (dropZone === zone) this.dropZonePulse.setAlpha(0.45);
        });

        this.input.on('dragleave', (_ptr: unknown, _obj: unknown, dropZone: Phaser.GameObjects.Zone) => {
            if (dropZone === zone) this.dropZonePulse.setAlpha(0.1);
        });

        this.input.on('drop', (_ptr: unknown, obj: Phaser.GameObjects.Container, dropZone: Phaser.GameObjects.Zone) => {
            if (dropZone !== zone) return;
            this.playCard(obj);
        });

        this.input.on('dragend', (_ptr: unknown, obj: Phaser.GameObjects.Container, dropped: boolean) => {
            obj.setData('dragging', false);
            obj.setDepth(0);
            if (!dropped) {
                // Snap back with spring + straighten
                this.tweens.add({
                    targets:  obj,
                    x:        obj.getData('homeX'),
                    y:        obj.getData('homeY'),
                    rotation: 0,
                    scaleX:   1,
                    scaleY:   1,
                    duration: 280,
                    ease:     'Back.Out',
                });
            }
        });
    }

    update(_time: number, delta: number) {
        for (let i = 0; i < MAX_PROC_SLOTS; i++) {
            const slot = this.processing[i];
            if (!slot) continue;

            slot.elapsed += delta / 1000;
            const progress = Math.min(slot.elapsed / slot.card.duration, 1);

            // Bar shrinks right-to-left
            const maxW = 206; // SLOT_W - 24
            slot.barFill.width = maxW * (1 - progress);

            if (progress >= 1) this.finishCard(slot, i);
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private buildShuffledDeck(): Card[] {
        const pool = [...cardDefinitions, ...cardDefinitions];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool;
    }

    private drawCard(): Card {
        if (this.deck.length === 0) this.deck = this.buildShuffledDeck();
        return this.deck.pop()!;
    }

    private dealHand() {
        const cardY   = 768 - 110;
        const spacing = 150;
        const startX  = 512 - ((HAND_SIZE - 1) * spacing) / 2;

        for (let i = 0; i < HAND_SIZE; i++) {
            if (this.hand[i]) continue;
            const x         = startX + i * spacing;
            const card      = this.drawCard();
            const delay     = i * 70;
            const container = createDraggableCard(this, x, cardY, card, delay);
            container.setData('slotIndex', i);
            this.hand[i] = container;
        }
    }

    private playCard(container: Phaser.GameObjects.Container) {
        const slotIndex: number = container.getData('slotIndex');
        const card: Card        = container.getData('card');
        const palette           = CARD_COLORS[card.imageKey] ?? { particle: 0x4488ff };

        // Find a free processing slot
        const freeSlot = this.processing.indexOf(null);
        if (freeSlot === -1) {
            this.tweens.add({
                targets:  container,
                x:        container.getData('homeX'),
                y:        container.getData('homeY'),
                rotation: 0,
                scaleX:   1,
                scaleY:   1,
                duration: 280,
                ease:     'Back.Out',
            });
            this.showFullMessage();
            return;
        }

        // ── VFX: drop impact ──────────────────────────────────────────────
        VFX.burst(this, DROP_ZONE_X, DROP_ZONE_Y, palette.particle, 24);
        VFX.flashAt(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H, palette.particle, 0.5);
        VFX.dropZoneAccept(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H);
        VFX.screenShake(this, 0.004, 200);

        // Remove from hand
        this.hand[slotIndex] = null;
        this.dropZonePulse.setAlpha(0.1);

        // Fly card to processing row, shrink to nothing
        const destY = 165 + freeSlot * 84;
        this.tweens.add({
            targets:  container,
            x:        130,
            y:        destY,
            scaleX:   0,
            scaleY:   0,
            rotation: 0,
            duration: 280,
            ease:     'Quad.In',
            onComplete: () => container.destroy(),
        });

        // Create processing slot
        this.processing[freeSlot] = createProcessingSlot(this, 130, destY, card);

        // Refill hand with slight delay
        this.time.delayedCall(350, () => this.dealHand());
    }

    private finishCard(slot: ProcessingSlot, index: number) {
        const card    = slot.card;
        const palette = CARD_COLORS[card.imageKey] ?? { particle: 0x22cc88 };

        // ── Apply effects ─────────────────────────────────────────────────
        this.addHeat(card.heat);
        for (let i = 0; i < card.products; i++) this.completeProduct();
        this.points += card.points;

        // ── VFX: completion burst ─────────────────────────────────────────
        const wx = slot.container.x;
        const wy = slot.container.y;

        VFX.burst(this, wx, wy, palette.particle, 20);

        if (card.products > 0) {
            VFX.floatText(this, wx + 90, wy, `+${card.products} 📦`, '#88ffcc');
        }
        if (card.points > 0) {
            VFX.floatText(this, wx + 90, wy + 28, `+${card.points} ⭐`, '#ffee66');
        }
        if (card.heat !== 0) {
            const col = card.heat < 0 ? '#44ccff' : '#ff6644';
            VFX.floatText(this, wx + 90, wy + 56, `${card.heat > 0 ? '+' : ''}${card.heat} 🔥`, col);
        }

        // Screen shake proportional to heat impact
        if (Math.abs(card.heat) >= 8) VFX.screenShake(this, 0.003, 180);

        // Fade + scale-down slot
        this.tweens.add({
            targets:  slot.container,
            alpha:    0,
            scaleX:   0.8,
            scaleY:   0.8,
            duration: 320,
            ease:     'Quad.In',
            onComplete: () => slot.container.destroy(),
        });

        this.processing[index] = null;
    }

    private showFullMessage() {
        const txt = this.add.text(
            DROP_ZONE_X, DROP_ZONE_Y - DROP_ZONE_H / 2 - 22,
            'Processing slots full!',
            { fontSize: '14px', color: '#ff4444', fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(30);

        this.tweens.add({
            targets:  txt,
            y:        txt.y - 32,
            alpha:    0,
            duration: 1200,
            onComplete: () => txt.destroy(),
        });
    }

    private addHeat(amount: number) {
        this.heat = Math.min(Math.max(this.heat + amount, 0), this.levelData.maxHeat);
        this.overheatStatus.update(this.heat / this.levelData.maxHeat);
        if (this.heat >= this.levelData.maxHeat) this.endGame(false);
    }

    private completeProduct() {
        this.products += 1;
        this.spaceshipStatus.update(this.products / this.levelData.targetProducts);
        if (this.products >= this.levelData.targetProducts) this.endGame(true);
    }

    private endGame(won: boolean) {
        // Big screen flash before transition
        VFX.flashAt(this, 512, 384, 1024, 768, won ? 0x22cc88 : 0xff2200, 0.8);
        VFX.screenShake(this, 0.01, 400);
        this.time.delayedCall(500, () => {
            this.scene.start('GameOver', {
                won,
                points:   this.points,
                products: this.products,
                level:    this.levelData,
            });
        });
    }
}

import { Scene } from 'phaser';
import { levels } from '../data/levels';
import { cardDefinitions, Card, ResourceType } from '../data/cards';
import { createBackButton } from '../ui/BackButton';
import {
    createDraggableCard,
    createProcessingSlot,
    ProcessingSlot,
} from '../ui/CardDisplay';
import { VFX, CARD_COLORS } from '../vfx/VFX';
import { RANDOM_EVENTS, GameEvent } from '../data/randomEvents';
import { getCardTier } from '../data/progress';
import { getCardAtTier } from '../data/cardUpgrades';
import { playCardSFX, resumeAudioContext } from '../ui/CardSFX';

const HAND_SIZE         = 4;
const MAX_PROC_SLOTS    = 3;
const POWER_UNLOCK_COST = 20;
const DROP_ZONE_X       = 512;
const DROP_ZONE_Y       = 360;
const DROP_ZONE_W       = 240;
const DROP_ZONE_H       = 240;

const RES_ICON: Record<string, string> = {
    electricity: '⚡',
    fuel:        '🛢️',
    titanium:    '🔩',
};
const RES_COLOR: Record<string, number> = {
    electricity: 0xffff44,
    fuel:        0xff8800,
    titanium:    0x88aacc,
};

export class Game extends Scene {
    private levelData: typeof levels[0];
    private heat:   number;
    private points: number;

    // ── Resource counters ────────────────────────────────────────────────
    private resources: Record<string, number>;

    // ── HUD bars ─────────────────────────────────────────────────────────
    private heatBarFill:  Phaser.GameObjects.Rectangle;
    private heatBarLabel: Phaser.GameObjects.Text;
    private resBarFills:  Record<string, Phaser.GameObjects.Rectangle>  = {};
    private resBarLabels: Record<string, Phaser.GameObjects.Text>       = {};

    // ── Machine ───────────────────────────────────────────────────────────
    private machineImg:   Phaser.GameObjects.Sprite;
    private machineStage: number = 0; // 0-3 completed resources

    private deck:       Card[];
    private hand:       (Phaser.GameObjects.Container | null)[];
    private processing: (ProcessingSlot | null)[];

    private maxProcSlots  = 1;
    private powerUnlocked = false;
    private unlockBtn!:   Phaser.GameObjects.Container;

    private dropZonePulse: Phaser.GameObjects.Rectangle;
    private prevDragX = 0;

    // ── Timer ─────────────────────────────────────────────────────────────
    private timeRemaining: number;
    private timerText:     Phaser.GameObjects.Text;
    private timerBar:      Phaser.GameObjects.Rectangle;
    private gameEnded = false;

    // ── Spaceship launches ────────────────────────────────────────────────
    private spaceshipsBuilt    = 0;
    private shipLaunchInProgress = false;
    private shipCountTxt!: Phaser.GameObjects.Text;

    // ── Monitor card ──────────────────────────────────────────────────────
    private monitorActive  = false;
    private monitorTimeLeft = 0;
    private nextCardPreview: Phaser.GameObjects.Container | null = null;

    // ── Random events ─────────────────────────────────────────────────────
    private activeEvent:       GameEvent | null = null;
    private eventTimeLeft:     number = 0;
    private heatMultiplier:    number = 1;   // solar flare doubles this
    private processingPaused:  boolean = false; // system glitch freezes slots

    constructor() { super('Game'); }

    private levelIndex: number;

    init(data: { level: number }) {
        this.levelIndex    = data.level;
        this.levelData     = levels[data.level - 1];
        this.heat          = 0;
        this.points        = 0;
        this.resources     = { electricity: 0, fuel: 0, titanium: 0 };
        this.machineStage        = 0;
        this.timeRemaining       = this.levelData.timeLimit;
        this.gameEnded           = false;
        this.spaceshipsBuilt     = 0;
        this.shipLaunchInProgress = false;
    }

    create() {
        this.add.image(512, 384, 'background');
        VFX.ambientParticles(this);

        // Background music — loop for the whole session
        if (!this.sound.get('bg_music')) {
            this.sound.add('bg_music', { loop: true, volume: 0.12 }).play();
        }

        createBackButton(this, 'LevelMenu');

        // ── Countdown timer (top-centre) ──────────────────────────────────
        const TIMER_W = 220;
        const TIMER_X = 512;
        this.add.rectangle(TIMER_X, 18, TIMER_W, 14, 0x222222).setDepth(8);
        this.timerBar   = this.add.rectangle(TIMER_X - TIMER_W / 2, 18, TIMER_W, 14, 0x22cc88)
            .setOrigin(0, 0.5).setDepth(9);
        this.timerText  = this.add.text(TIMER_X, 32, `${this.levelData.timeLimit}s`, {
            fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3, align: 'center',
        }).setOrigin(0.5, 0).setDepth(10);

        // ── Spaceship counter (below timer) ───────────────────────────────
        this.shipCountTxt = this.add.text(TIMER_X, 48, '🚀 ×0', {
            fontSize: '13px', color: '#88ffcc', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3, align: 'center',
        }).setOrigin(0.5, 0).setDepth(10);

        // ── Machine image in drop zone ────────────────────────────────────
        this.machineImg = this.add.sprite(DROP_ZONE_X, DROP_ZONE_Y, 'machine1')
            .setDisplaySize(DROP_ZONE_W, DROP_ZONE_H)
            .setDepth(1);
        this.machineImg.play('machine_run');

        // Drop zone pulse ring + invisible hit zone on top
        this.dropZonePulse = VFX.setupDropZonePulse(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H);
        const zone = this.add.zone(DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H)
            .setRectangleDropZone(DROP_ZONE_W, DROP_ZONE_H);

        // ── HUD: heat bar (top-right) ─────────────────────────────────────
        this.buildHeatBar();

        // ── HUD: resource bars (right side) ──────────────────────────────
        this.buildResourceBars();
        this.buildComboPanel();

        // ── Processing array ──────────────────────────────────────────────
        this.processing = Array(MAX_PROC_SLOTS).fill(null);
        this.unlockBtn  = this.buildUnlockButton();

        // ── Deck + hand ───────────────────────────────────────────────────
        this.deck = this.buildShuffledDeck();
        this.hand = Array(HAND_SIZE).fill(null);
        this.dealHand();

        // ── Random events ─────────────────────────────────────────────────
        this.scheduleNextEvent();

        // ── Drag events ───────────────────────────────────────────────────
        this.input.on('dragstart', (_ptr: unknown, obj: Phaser.GameObjects.Container) => {
            obj.setData('dragging', true);
            obj.setDepth(50);
            this.prevDragX = obj.x;
            this.tweens.add({ targets: obj, scaleX: 1.25, scaleY: 1.25, duration: 120, ease: 'Back.Out' });
            const details: Phaser.GameObjects.GameObject[] = obj.getData('details') ?? [];
            this.tweens.add({ targets: details, alpha: 1, duration: 120 });
        });

        this.input.on('drag', (_ptr: unknown, obj: Phaser.GameObjects.Container, dx: number, dy: number) => {
            const vx = dx - this.prevDragX;
            obj.x = dx;
            obj.y = dy - 90;
            const targetRot = Math.max(-0.35, Math.min(0.35, vx * 0.04));
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
                this.tweens.add({
                    targets: obj,
                    x: obj.getData('homeX'), y: obj.getData('homeY'),
                    rotation: 0, scaleX: 1, scaleY: 1,
                    duration: 280, ease: 'Back.Out',
                });
                const details: Phaser.GameObjects.GameObject[] = obj.getData('details') ?? [];
                this.tweens.add({ targets: details, alpha: 0, duration: 150 });
            }
        });
    }

    update(_time: number, delta: number) {
        if (this.gameEnded) return;

        // ── Countdown ────────────────────────────────────────────────────
        this.timeRemaining -= delta / 1000;
        const t = Math.max(this.timeRemaining, 0);
        const ratio = t / this.levelData.timeLimit;
        this.timerBar.width = 220 * ratio;

        // Colour: green → yellow → red
        const r = ratio > 0.5 ? Math.floor((1 - ratio) * 2 * 255) : 255;
        const g = ratio > 0.5 ? 200 : Math.floor(ratio * 2 * 200);
        this.timerBar.setFillStyle((r << 16) | (g << 8));

        // Pulse + large text when ≤ 10 s
        const secs = Math.ceil(t);
        this.timerText.setText(`${secs}s`);
        if (secs <= 10) {
            this.timerText.setColor('#ff4444');
            this.timerText.setScale(1 + Math.sin(Date.now() * 0.01) * 0.06);
        }

        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.evaluateResult();
            return;
        }

        // ── Tick monitor reveal ───────────────────────────────────────────
        if (this.monitorActive) {
            this.monitorTimeLeft -= delta / 1000;
            if (this.monitorTimeLeft <= 0) this.deactivateMonitor();
        }

        // ── Tick active event ─────────────────────────────────────────────
        if (this.activeEvent) {
            this.eventTimeLeft -= delta / 1000;
            if (this.eventTimeLeft <= 0) {
                this.heatMultiplier   = 1;
                this.processingPaused = false;
                this.activeEvent      = null;
            }
        }

        // Heat accelerates as the reactor gets hotter AND as more resources are collected.
        // At 0 heat / 0 progress → 1× base rate.
        // At full heat + full progress → up to 2× base rate.
        const heatRatio     = this.heat / this.levelData.maxHeat;
        const progressRatio = this.calcProgress();
        const dynamicMult   = 1 + heatRatio * 0.6 + progressRatio * 0.4;
        this.addHeat(this.levelData.heatPerSecond * this.heatMultiplier * dynamicMult * (delta / 1000));

        if (!this.processingPaused) {
            for (let i = 0; i < MAX_PROC_SLOTS; i++) {
                const slot = this.processing[i];
                if (!slot) continue;
                slot.elapsed += delta / 1000;
                const progress = Math.min(slot.elapsed / slot.card.duration, 1);
                slot.barFill.width = 206 * (1 - progress);
                if (progress >= 1) this.finishCard(slot, i);
            }
        }
    }

    // ── HUD builders ───────────────────────────────────────────────────────

    private buildHeatBar() {
        const BAR_W = 180;
        const BAR_X = 1024 - BAR_W - 12;
        const BAR_H = 16;
        const y     = 20;

        this.add.text(BAR_X, y - 14, '🔥 HEAT', { fontSize: '11px', color: '#ff6644', fontStyle: 'bold' }).setDepth(8);
        this.add.rectangle(BAR_X + BAR_W / 2, y, BAR_W, BAR_H, 0x222222).setDepth(8);
        this.heatBarFill = this.add.rectangle(BAR_X, y, 0, BAR_H, 0xff4400).setOrigin(0, 0.5).setDepth(9);
        this.heatBarLabel = this.add.text(BAR_X + BAR_W / 2, y, '0', {
            fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10).setAlpha(0); // hidden until Monitor card used
    }

    private buildComboPanel() {
        const BAR_W  = 180;
        const BAR_X  = 1024 - BAR_W - 12;
        const panelY = 178; // below the 3 resource bars

        const combos = [
            { label: '⚡ + 🚀 Boost',     effect: 'x2 electricity speed' },
            { label: '🛢️ + 🚀 Boost',     effect: 'x2 fuel output'       },
            { label: '⚡ + ☀️ Solar',      effect: '+3 bonus electricity'  },
            { label: '❄️ + 🔥 any hot',   effect: 'extra -8 heat'         },
            { label: '🔩 + 🚀 Boost',     effect: 'x2 titanium output'    },
        ];

        // Panel background
        const panelH = 14 + combos.length * 30 + 10;
        this.add.rectangle(BAR_X + BAR_W / 2, panelY + panelH / 2, BAR_W + 8, panelH, 0x0a1020, 0.85)
            .setStrokeStyle(1, 0x334466)
            .setDepth(7);

        this.add.text(BAR_X + BAR_W / 2, panelY + 6, '✨ COMBOS', {
            fontSize: '10px', color: '#aaccff', fontStyle: 'bold', align: 'center',
        }).setOrigin(0.5, 0).setDepth(8);

        combos.forEach((c, i) => {
            const cy = panelY + 24 + i * 30;
            this.add.text(BAR_X + 4, cy, c.label, {
                fontSize: '10px', color: '#ddddff',
            }).setDepth(8);
            this.add.text(BAR_X + 4, cy + 12, `  → ${c.effect}`, {
                fontSize: '9px', color: '#88ccaa',
            }).setDepth(8);
        });
    }

    private buildResourceBars() {
        const BAR_W  = 180;
        const BAR_X  = 1024 - BAR_W - 12;
        const BAR_H  = 16;
        const startY = 56;
        const gap    = 36;

        (['electricity', 'fuel', 'titanium'] as ResourceType[]).forEach((res, i) => {
            if (!res) return;
            const needed = this.levelData[`${res}Needed` as keyof typeof this.levelData] as number;
            const y = startY + i * gap;
            const color = RES_COLOR[res];

            this.add.text(BAR_X, y - 14, `${RES_ICON[res]} ${res.toUpperCase()}`, {
                fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
            }).setDepth(8);
            this.add.rectangle(BAR_X + BAR_W / 2, y, BAR_W, BAR_H, 0x222222).setDepth(8);

            this.resBarFills[res] = this.add.rectangle(BAR_X, y, 0, BAR_H, color)
                .setOrigin(0, 0.5).setDepth(9);
            this.resBarLabels[res] = this.add.text(BAR_X + BAR_W / 2, y, `0 / ${needed}`, {
                fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
            }).setOrigin(0.5).setDepth(10).setAlpha(0); // hidden until Monitor card used
        });
    }

    // ── Card logic ─────────────────────────────────────────────────────────

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
        const base = this.deck.pop()!;
        return getCardAtTier(base.id, getCardTier(base.id));
    }

    private dealHand() {
        const cardY   = 768 - 110;
        const spacing = 150;
        const startX  = 512 - ((HAND_SIZE - 1) * spacing) / 2;
        for (let i = 0; i < HAND_SIZE; i++) {
            if (this.hand[i]) continue;
            const x         = startX + i * spacing;
            const container = createDraggableCard(this, x, cardY, this.drawCard(), i * 70);
            container.setData('slotIndex', i);
            this.hand[i] = container;
        }
    }

    private playCard(container: Phaser.GameObjects.Container) {
        const slotIndex: number = container.getData('slotIndex');
        const card: Card        = container.getData('card');
        const palette           = CARD_COLORS[card.imageKey] ?? { particle: 0x4488ff };

        const freeSlot = this.processing.slice(0, this.maxProcSlots).indexOf(null);
        if (freeSlot === -1) {
            this.tweens.add({
                targets: container,
                x: container.getData('homeX'), y: container.getData('homeY'),
                rotation: 0, scaleX: 1, scaleY: 1,
                duration: 280, ease: 'Back.Out',
            });
            this.showFullMessage();
            return;
        }

        resumeAudioContext();
        playCardSFX(card.id);
        VFX.burst(this, DROP_ZONE_X, DROP_ZONE_Y, palette.particle, 24);
        VFX.flashAt(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H, palette.particle, 0.4);
        VFX.dropZoneAccept(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H);
        VFX.screenShake(this, 0.004, 200);

        this.hand[slotIndex] = null;
        this.dropZonePulse.setAlpha(0.1);

        const destY = 165 + freeSlot * 84;
        this.tweens.add({
            targets: container,
            x: 130, y: destY, scaleX: 0, scaleY: 0, rotation: 0,
            duration: 280, ease: 'Quad.In',
            onComplete: () => container.destroy(),
        });

        this.processing[freeSlot] = createProcessingSlot(this, 130, destY, card);
        this.time.delayedCall(350, () => this.dealHand());
    }

    private finishCard(slot: ProcessingSlot, index: number) {
        const card    = slot.card;
        const palette = CARD_COLORS[card.imageKey] ?? { particle: 0x22cc88 };
        const wx = slot.container.x;
        const wy = slot.container.y;

        this.addHeat(card.heat);
        this.points += card.points;

        // Add to the correct resource
        if (card.resource && card.resourceAmount > 0) {
            this.addResource(card.resource, card.resourceAmount);
            VFX.floatText(this, wx + 100, wy,
                `${RES_ICON[card.resource]} +${card.resourceAmount}`,
                card.resource === 'electricity' ? '#ffff66'
                    : card.resource === 'fuel'  ? '#ffaa44'
                    : '#aabbdd');
        }
        if (card.points > 0) VFX.floatText(this, wx + 100, wy + 28, `+${card.points} ⭐`, '#ffee66');
        if (card.heat !== 0) {
            VFX.floatText(this, wx + 100, wy + 56,
                `${card.heat > 0 ? '+' : ''}${card.heat} 🔥`,
                card.heat < 0 ? '#44ccff' : '#ff6644');
        }

        VFX.burst(this, wx, wy, palette.particle, 20);
        if (Math.abs(card.heat) >= 8) VFX.screenShake(this, 0.003, 180);

        // Monitor card reveals stats
        if (card.id === 'monitor') {
            const tier     = getCardTier('monitor');
            const duration = [8, 12, 18][tier] ?? 8;
            this.activateMonitor(duration);
        }

        this.tweens.add({
            targets: slot.container,
            alpha: 0, scaleX: 0.8, scaleY: 0.8,
            duration: 320, ease: 'Quad.In',
            onComplete: () => slot.container.destroy(),
        });
        this.processing[index] = null;
    }

    // ── Monitor card logic ─────────────────────────────────────────────────

    private activateMonitor(duration: number) {
        this.monitorActive   = true;
        this.monitorTimeLeft = duration;

        // Show all labels
        this.heatBarLabel.setAlpha(1);
        Object.values(this.resBarLabels).forEach(l => l.setAlpha(1));

        // Next-card preview
        const nextCard = this.deck.length > 0
            ? getCardAtTier(this.deck[this.deck.length - 1].id, getCardTier(this.deck[this.deck.length - 1].id))
            : null;

        if (this.nextCardPreview) { this.nextCardPreview.destroy(); this.nextCardPreview = null; }

        if (nextCard) {
            const px = DROP_ZONE_X + DROP_ZONE_W / 2 + 80;
            const py = DROP_ZONE_Y - 70;
            const bg  = this.add.rectangle(0, 0, 130, 44, 0x000000, 0.85).setStrokeStyle(2, 0x44ff88);
            const lbl = this.add.text(0, -14, 'NEXT DRAW', { fontSize: '9px', color: '#44ff88', fontStyle: 'bold' }).setOrigin(0.5);
            const img = this.add.image(0, 8, nextCard.imageKey).setDisplaySize(28, 28);
            const nm  = this.add.text(16, 6, nextCard.name, { fontSize: '10px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
            this.nextCardPreview = this.add.container(px, py, [bg, lbl, img, nm]).setDepth(20).setAlpha(0);
            this.tweens.add({ targets: this.nextCardPreview, alpha: 1, duration: 300 });
        }

        // Scan flash
        VFX.flashAt(this, 512, 384, 1024, 768, 0x44ff88, 0.2);
        VFX.floatText(this, 512, 300, `🖥️ MONITOR ACTIVE  (${duration}s)`, '#44ff88');
    }

    private deactivateMonitor() {
        this.monitorActive = false;

        // Fade out labels
        this.tweens.add({ targets: this.heatBarLabel, alpha: 0, duration: 400 });
        Object.values(this.resBarLabels).forEach(l =>
            this.tweens.add({ targets: l, alpha: 0, duration: 400 })
        );

        // Fade out next-card preview
        if (this.nextCardPreview) {
            const preview = this.nextCardPreview;
            this.nextCardPreview = null;
            this.tweens.add({ targets: preview, alpha: 0, duration: 400, onComplete: () => preview.destroy() });
        }
    }

    // ── Resource / win logic ───────────────────────────────────────────────

    private addResource(type: string, amount: number) {
        const needed = this.levelData[`${type}Needed` as keyof typeof this.levelData] as number;
        this.resources[type] = Math.min(this.resources[type] + amount, needed);

        // Update bar
        const BAR_W = 180;
        const ratio = this.resources[type] / needed;
        this.resBarFills[type].width  = BAR_W * ratio;
        this.resBarLabels[type].setText(`${Math.floor(this.resources[type])} / ${needed}`);

        // Advance machine stage
        this.updateMachineStage();

        // All resources full → launch a spaceship and reset for the next one
        if (
            this.resources.electricity >= this.levelData.electricityNeeded &&
            this.resources.fuel        >= this.levelData.fuelNeeded &&
            this.resources.titanium    >= this.levelData.titaniumNeeded
        ) {
            this.launchSpaceship();
        }
    }

    private updateMachineStage() {
        const stages = [
            this.levelData.electricityNeeded,
            this.levelData.fuelNeeded,
            this.levelData.titaniumNeeded,
        ];
        const completed = [
            this.resources.electricity >= stages[0],
            this.resources.fuel        >= stages[1],
            this.resources.titanium    >= stages[2],
        ].filter(Boolean).length;

        if (completed !== this.machineStage) {
            this.machineStage = completed;
            VFX.burst(this, DROP_ZONE_X, DROP_ZONE_Y, 0x22cc88, 15);
        }
    }

    private calcProgress(): number {
        const total  = this.levelData.electricityNeeded + this.levelData.fuelNeeded + this.levelData.titaniumNeeded;
        const gained = this.resources.electricity + this.resources.fuel + this.resources.titanium;
        return gained / total;
    }

    private calcStars(): number {
        // Must build at least 1 spaceship to earn any star.
        // 1 ship = 1 star (minimum), 2 ships = 2 stars (average), 3+ ships = 3 stars (best).
        if (this.spaceshipsBuilt >= 3) return 3;
        if (this.spaceshipsBuilt >= 2) return 2;
        if (this.spaceshipsBuilt >= 1) return 1;
        return 0;
    }

    private evaluateResult() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        // If a ship launch is still animating, wait for it to finish first
        if (this.shipLaunchInProgress) {
            this.time.delayedCall(2000, () => this.evaluateResult());
            this.gameEnded = false;
            return;
        }

        const stars = this.calcStars();
        if (stars === 0) {
            this.endGame(false, 0, 'timeout');
        } else {
            VFX.flashAt(this, 512, 384, 1024, 768, stars >= 2 ? 0x22cc88 : 0xffcc00, 0.5);
            VFX.screenShake(this, 0.005, 300);
            this.time.delayedCall(500, () => this.endGame(true, stars, 'timeout'));
        }
    }

    private launchSpaceship() {
        if (this.shipLaunchInProgress) return;
        this.shipLaunchInProgress = true;

        this.spaceshipsBuilt++;
        this.shipCountTxt.setText(`🚀 ×${this.spaceshipsBuilt}`);

        VFX.flashAt(this, 512, 384, 1024, 768, 0x22cc88, 0.5);
        VFX.screenShake(this, 0.006, 350);
        this.machineImg.stop();

        // Banner
        VFX.floatText(this, DROP_ZONE_X, DROP_ZONE_Y - 140,
            `🚀 SPACESHIP #${this.spaceshipsBuilt} LAUNCHED!`, '#22ffaa');

        const ship = this.add.image(DROP_ZONE_X, DROP_ZONE_Y + 40, 'spaceship_win')
            .setDisplaySize(90, 90).setDepth(40).setAlpha(0);

        const exhaust = this.add.particles(DROP_ZONE_X, DROP_ZONE_Y + 80, 'vfx_dot', {
            speedY: { min: 40, max: 120 }, speedX: { min: -20, max: 20 },
            lifespan: { min: 300, max: 600 }, scale: { start: 0.5, end: 0 },
            tint: [0xff8800, 0xffff00, 0xffffff], frequency: 25,
        }).setDepth(39);

        this.tweens.add({
            targets: ship, alpha: 1, duration: 250,
            onComplete: () => {
                this.tweens.add({
                    targets: ship, y: -140, scaleX: 0.25, scaleY: 0.25,
                    duration: 1600, ease: 'Quad.In',
                    onComplete: () => {
                        ship.destroy();
                        exhaust.destroy();

                        // Reset resources and bars for the next ship
                        this.resources = { electricity: 0, fuel: 0, titanium: 0 };
                        const BAR_W = 180;
                        const needs: Record<string, number> = {
                            electricity: this.levelData.electricityNeeded,
                            fuel:        this.levelData.fuelNeeded,
                            titanium:    this.levelData.titaniumNeeded,
                        };
                        for (const res of ['electricity', 'fuel', 'titanium']) {
                            this.resBarFills[res].width = 0;
                            this.resBarLabels[res].setText(`0 / ${needs[res]}`);
                        }
                        void BAR_W;

                        // Restart machine animation
                        this.machineStage = 0;
                        this.machineImg.play('machine_run');

                        this.shipLaunchInProgress = false;
                    },
                });
            },
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private showFullMessage() {
        const txt = this.add.text(
            DROP_ZONE_X, DROP_ZONE_Y - DROP_ZONE_H / 2 - 22,
            'Processing slot full!',
            { fontSize: '14px', color: '#ff4444', fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(30);
        this.tweens.add({
            targets: txt, y: txt.y - 32, alpha: 0, duration: 1200,
            onComplete: () => txt.destroy(),
        });
    }

    private buildUnlockButton(): Phaser.GameObjects.Container {
        const btnX = DROP_ZONE_X;
        const btnY = DROP_ZONE_Y + DROP_ZONE_H / 2 + 44;
        const bg   = this.add.rectangle(0, 0, 230, 42, 0x1a0a2e, 1).setStrokeStyle(2, 0xaa44ff);
        const label = this.add.text(0, 0, `POWER UNLOCK  (${POWER_UNLOCK_COST} ⭐)`, {
            fontSize: '13px', color: '#cc88ff', fontStyle: 'bold', align: 'center',
        }).setOrigin(0.5);
        const container = this.add.container(btnX, btnY, [bg, label]).setDepth(10);
        this.tweens.add({ targets: bg, alpha: { from: 0.7, to: 1 }, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.InOut' });
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => { bg.setStrokeStyle(2, 0xffffff); label.setColor('#ffffff'); })
            .on('pointerout',  () => { bg.setStrokeStyle(2, 0xaa44ff); label.setColor('#cc88ff'); })
            .on('pointerdown', () => this.unlockPower());
        return container;
    }

    private unlockPower() {
        if (this.powerUnlocked) return;
        if (this.points < POWER_UNLOCK_COST) {
            this.tweens.add({
                targets: this.unlockBtn, x: this.unlockBtn.x + 8,
                yoyo: true, repeat: 4, duration: 5, ease: 'Linear',
                onComplete: () => { this.unlockBtn.x = DROP_ZONE_X; },
            });
            VFX.floatText(this, DROP_ZONE_X, DROP_ZONE_Y + DROP_ZONE_H / 2 + 20, `Need ${POWER_UNLOCK_COST} ⭐`, '#ff6644');
            return;
        }
        this.points -= POWER_UNLOCK_COST;
        this.powerUnlocked = true;
        this.maxProcSlots  = MAX_PROC_SLOTS;
        VFX.burst(this, DROP_ZONE_X, DROP_ZONE_Y + DROP_ZONE_H / 2 + 44, 0xaa44ff, 30);
        VFX.screenShake(this, 0.005, 250);
        VFX.floatText(this, DROP_ZONE_X, DROP_ZONE_Y + DROP_ZONE_H / 2 + 20, '⚡ POWER UNLOCKED!', '#cc88ff');
        this.unlockBtn.setVisible(false);

        const POWER_DURATION = 5;
        const badgeY = DROP_ZONE_Y + DROP_ZONE_H / 2 + 44;
        const badge = this.add.text(DROP_ZONE_X, badgeY,
            `⚡ POWER ACTIVE  (${POWER_DURATION}s)`, {
            fontSize: '13px', color: '#ffcc00', fontStyle: 'bold', align: 'center',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: badge, alpha: { from: 0.6, to: 1 }, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.InOut' });

        // Countdown and revert after POWER_DURATION seconds
        let remaining = POWER_DURATION;
        const tick = this.time.addEvent({
            delay: 1000,
            repeat: POWER_DURATION - 1,
            callback: () => {
                remaining--;
                if (remaining > 0) {
                    badge.setText(`⚡ POWER ACTIVE  (${remaining}s)`);
                } else {
                    badge.destroy();
                    tick.remove();
                    this.maxProcSlots  = 1;
                    this.powerUnlocked = false;
                    // Re-show the button so the player can use it again
                    this.unlockBtn.setVisible(true);
                    VFX.floatText(this, DROP_ZONE_X, badgeY, '⚡ POWER ENDED', '#aa44ff');
                }
            },
        });
    }

    private addHeat(amount: number) {
        this.heat = Math.min(Math.max(this.heat + amount, 0), this.levelData.maxHeat);
        const ratio = this.heat / this.levelData.maxHeat;
        const BAR_W = 180;
        this.heatBarFill.width = BAR_W * ratio;
        const r = ratio < 0.5 ? Math.floor(ratio * 2 * 255) : 255;
        const g = ratio < 0.5 ? 200 : Math.floor((1 - ratio) * 2 * 200);
        this.heatBarFill.setFillStyle((r << 16) | (g << 8));
        this.heatBarLabel.setText(`${Math.floor(this.heat)} / ${this.levelData.maxHeat}`);
        if (this.heat >= this.levelData.maxHeat) this.endGame(false, 0);
    }

    // ── Random event logic ─────────────────────────────────────────────────

    private scheduleNextEvent() {
        if (this.gameEnded) return;
        // Fire an event every 12–20 s
        const delay = 12000 + Math.random() * 8000;
        this.time.delayedCall(delay, () => {
            if (this.gameEnded) return;
            // Pick an event valid for this level
            const eligible = RANDOM_EVENTS.filter(e => e.minLevel <= this.levelIndex);
            if (eligible.length === 0) { this.scheduleNextEvent(); return; }
            const evt = eligible[Math.floor(Math.random() * eligible.length)];
            this.triggerEvent(evt);
            this.scheduleNextEvent();
        });
    }

    private triggerEvent(evt: GameEvent) {
        this.activeEvent      = evt;
        this.eventTimeLeft    = evt.duration;

        if (evt.key === 'solar_flare')   this.heatMultiplier   = 2;
        if (evt.key === 'system_glitch') this.processingPaused = true;
        if (evt.key === 'meteor_shower') this.addHeat(25);

        this.showEventBanner(evt);
        VFX.flashAt(this, 512, 384, 1024, 768, evt.color, 0.35);
        VFX.screenShake(this, 0.006, 400);
    }

    private showEventBanner(evt: GameEvent) {
        // Dark pill banner sliding in from top
        const banner = this.add.container(512, -60).setDepth(50);
        const bg = this.add.rectangle(0, 0, 420, 52, 0x000000, 0.85)
            .setStrokeStyle(2, evt.color);
        const title = this.add.text(0, -9,
            `${evt.icon}  ${evt.name.toUpperCase()}`,
            { fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
              stroke: '#000000', strokeThickness: 3, align: 'center' }
        ).setOrigin(0.5);
        const sub = this.add.text(0, 12,
            evt.desc,
            { fontSize: '11px', color: '#cccccc', align: 'center' }
        ).setOrigin(0.5);
        banner.add([bg, title, sub]);

        // Slide in, hold, slide out
        this.tweens.add({
            targets: banner, y: 50, duration: 350, ease: 'Back.Out',
            onComplete: () => {
                this.time.delayedCall(evt.duration * 1000 - 400, () => {
                    this.tweens.add({
                        targets: banner, y: -80, duration: 300, ease: 'Quad.In',
                        onComplete: () => banner.destroy(),
                    });
                });
            },
        });
    }

    private endGame(won: boolean, stars: number, reason: 'overheat' | 'timeout' = 'overheat') {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.sound.get('bg_music')?.stop();
        VFX.flashAt(this, 512, 384, 1024, 768, won ? 0x22cc88 : 0xff2200, 0.8);
        VFX.screenShake(this, 0.01, 400);
        this.time.delayedCall(500, () => {
            this.scene.start('GameOver', {
                won,
                stars,
                reason,
                points:          this.points,
                products:        this.resources.electricity + this.resources.fuel + this.resources.titanium,
                spaceshipsBuilt: this.spaceshipsBuilt,
                levelIndex:      this.levelIndex,
                level:           this.levelData,
            });
        });
    }
}

import { Scene } from 'phaser';
import { levels } from '../data/levels';
import { cardDefinitions, Card } from '../data/cards';
import { playHover } from '../ui/sounds';
import {
    createDraggableCard,
    createProcessingSlot,
    ProcessingSlot,
} from '../ui/CardDisplay';
import { VFX, CARD_COLORS } from '../vfx/VFX';
import { RANDOM_EVENTS, GameEvent } from '../data/randomEvents';
import { getCardAtTier, tierForLevel } from '../data/cardUpgrades';
import { playCardSFX } from '../ui/CardSFX';
import { stopMusic, playGameMusic, playSFX, playCardSound, playVoiceline, playPixelCrunch, AUDIO } from '../audio/AudioManager';
import { buildHeatBar, buildResourceBars, HeatBarRefs, ResBarRefs } from '../ui/HUDBars';
import { buildComboPanel } from '../ui/ComboPanel';
import { showEventBanner } from '../ui/EventBanner';

const HAND_SIZE         = 4;
const MAX_PROC_SLOTS    = 3;
const POWER_UNLOCK_COST = 10;
const DROP_ZONE_X       = 512;
const DROP_ZONE_Y       = 360;
const DROP_ZONE_W       = 240;
const DROP_ZONE_H       = 240;

const RES_ICON: Record<string, string> = {
    electricity: '⚡',
    fuel:        '◉',
    titanium:    '◆',
};

export class Game extends Scene {
    private levelData: typeof levels[0];
    private heat:   number;
    private points: number;

    // ── Resource counters ────────────────────────────────────────────────
    private resources: Record<string, number>;

    // ── HUD bars ─────────────────────────────────────────────────────────
    private heatBar!:  HeatBarRefs;
    private resBars!:  ResBarRefs;

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
    private evaluatingResult = false;

    // ── Spaceship launches ────────────────────────────────────────────────
    private spaceshipsBuilt    = 0;
    private shipLaunchInProgress = false;
    private shipCountTxt!:     Phaser.GameObjects.Text;
    private unlockBtnBg!:      Phaser.GameObjects.Rectangle;
    private unlockBtnFill!:    Phaser.GameObjects.Rectangle;
    private unlockBtnIcon!:    Phaser.GameObjects.Text;
    private unlockPulseTween:  Phaser.Tweens.Tween | null = null;

    // ── Monitor card ──────────────────────────────────────────────────────
    private monitorActive  = false;
    private monitorTimeLeft = 0;
    private nextCardPreview: Phaser.GameObjects.Container | null = null;

    // ── Random events ─────────────────────────────────────────────────────
    private activeEvent:       GameEvent | null = null;
    private eventTimeLeft:     number = 0;
    private heatMultiplier:    number = 1;   // solar flare doubles this
    private processingPaused:  boolean = false; // system glitch freezes slots
    private powerOnCooldown:   boolean = false;
    private heat42Played:      boolean = false;
    private timeLowPlayed:     boolean = false;
    private usedCombos:        Set<string> = new Set();
    private boostActive:       boolean = false;
    private boostTimeLeft:     number  = 0;

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
        this.evaluatingResult    = false;
        this.spaceshipsBuilt     = 0;
        this.shipLaunchInProgress = false;
        this.monitorActive    = false;
        this.monitorTimeLeft  = 0;
        this.heatMultiplier   = 1;
        this.processingPaused = false;
        this.powerOnCooldown  = false;
        this.maxProcSlots     = 1;
        this.powerUnlocked    = false;
        this.heat42Played     = false;
        this.timeLowPlayed    = false;
        this.usedCombos       = new Set();
        this.boostActive      = false;
        this.boostTimeLeft    = 0;
        this.nextCardPreview  = null;
        this.activeEvent      = null;
        this.eventTimeLeft    = 0;
        this.unlockPulseTween = null;
    }

    create() {
        this.add.image(512, 384, 'background');
        VFX.ambientParticles(this);

        // Stop lobby music and start in-game music
        playGameMusic(this, this.levelIndex);

        // Back button with exit confirmation
        const backBtn = this.add.image(100, 64, 'back_button')
            .setDisplaySize(140, 60).setDepth(20)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => { backBtn.setAlpha(0.75); playHover(this); })
            .on('pointerout',  () => backBtn.setAlpha(1))
            .on('pointerdown', () => this.showExitConfirm());


        // Settings icon (top-right)
        const settingBtn = this.add.image(990, 720, 'setting_button')
            .setDisplaySize(50, 50)
            .setDepth(20)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => settingBtn.setAlpha(0.75))
            .on('pointerout',  () => settingBtn.setAlpha(1))
            .on('pointerdown', () => { this.scene.pause(); this.scene.launch('PauseMenu'); });

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
        this.add.image(TIMER_X - 22, 57, this.shipKeyForLevel())
            .setDisplaySize(18, 18).setOrigin(0.5).setDepth(10);
        this.shipCountTxt = this.add.text(TIMER_X - 10, 57, '0 / 3', {
            fontSize: '13px', color: '#555555', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0, 0.5).setDepth(10);

        // ── Machine image in drop zone ────────────────────────────────────
        const machineFirstFrame = this.levelIndex >= 5 ? 'machine_l5_1' : 'machine1';
        this.machineImg = this.add.sprite(DROP_ZONE_X, DROP_ZONE_Y, machineFirstFrame)
            .setDisplaySize(DROP_ZONE_W, DROP_ZONE_H)
            .setDepth(1);
        this.machineImg.play(this.levelIndex >= 5 ? 'machine_run_l5' : 'machine_run');

        // Drop zone pulse ring + invisible hit zone on top
        this.dropZonePulse = VFX.setupDropZonePulse(this, DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H);
        const zone = this.add.zone(DROP_ZONE_X, DROP_ZONE_Y, DROP_ZONE_W, DROP_ZONE_H)
            .setRectangleDropZone(DROP_ZONE_W, DROP_ZONE_H);

        // ── HUD: heat bar (top-right) ─────────────────────────────────────
        this.heatBar = buildHeatBar(this);

        // ── HUD: resource bars (right side) ──────────────────────────────
        this.resBars = buildResourceBars(this, this.levelData);
        buildComboPanel(this);

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
        if (!this.timeLowPlayed && t <= 15) {
            this.timeLowPlayed = true;
            playVoiceline(this, AUDIO.VL_TIME_LOW);
        }
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

        // ── Tick boost window ─────────────────────────────────────────────
        if (this.boostActive) {
            this.boostTimeLeft -= delta / 1000;
            if (this.boostTimeLeft <= 0) {
                this.boostActive = false;
                VFX.floatText(this, 130, 180, '⚡ BOOST ENDED', '#ffaa44');
            }
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
        // Idle (no cards processing) → 0.4× rate.
        const heatRatio     = this.heat / this.levelData.maxHeat;
        const progressRatio = this.calcProgress();
        const dynamicMult   = 1 + heatRatio * 0.6 + progressRatio * 0.4;
        const activeSlots   = this.processing.filter(s => s !== null).length;
        // 0 slots → 0.4×  |  1 slot → 1×  |  2 slots → 1.15×  |  3 slots → 1.3×
        const idleMult      = activeSlots > 0 ? 1 + (activeSlots - 1) * 0.15 : 0.4;
        this.addHeat(this.levelData.heatPerSecond * this.heatMultiplier * dynamicMult * idleMult * (delta / 1000));

        if (!this.processingPaused) {
            for (let i = 0; i < MAX_PROC_SLOTS; i++) {
                const slot = this.processing[i];
                if (!slot) continue;
                const prevElapsed = slot.elapsed;
                slot.elapsed += delta / 1000;
                const progress = Math.min(slot.elapsed / slot.card.duration, 1);
                slot.barFill.width = 206 * (1 - progress);

                // Gradually add resources as the card processes
                if (slot.card.resource && slot.card.resourceAmount > 0) {
                    const prevProgress = Math.min(prevElapsed / slot.card.duration, 1);
                    const delta_progress = progress - prevProgress;
                    if (delta_progress > 0) {
                        const chunk = slot.card.resourceAmount * delta_progress;
                        const needed = this.levelData[`${slot.card.resource}Needed` as keyof typeof this.levelData] as number;
                        const BAR_W  = 180;
                        this.resources[slot.card.resource] = Math.min(this.resources[slot.card.resource] + chunk, needed);
                        const ratio  = this.resources[slot.card.resource] / needed;
                        this.resBars.fills[slot.card.resource].width = BAR_W * ratio;
                        this.resBars.labels[slot.card.resource].setText(`${Math.floor(this.resources[slot.card.resource])} / ${needed}`);
                        this.updateMachineStage();
                        this.checkWinCondition();
                    }
                }

                if (!this.shipLaunchInProgress && progress >= 1) this.finishCard(slot, i);
            }
        }
    }

    // ── Card logic ─────────────────────────────────────────────────────────

    private buildShuffledDeck(): Card[] {
        const weights: Record<string, number> = {
            electricity: 4,
            fuel:        4,
            titanium:    4,
            cool:        3,
            boost:       3,
            solar:       2,
            monitor:     1,
        };
        const pool: Card[] = [];
        for (const card of cardDefinitions) {
            const count = weights[card.id] ?? 1;
            for (let i = 0; i < count; i++) pool.push(card);
        }
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool;
    }

    private drawCard(): Card {
        if (this.deck.length === 0) this.deck = this.buildShuffledDeck();
        const base = this.deck.pop()!;
        return getCardAtTier(base.id, tierForLevel(this.levelIndex), this.levelIndex);
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
        if (this.monitorActive) this.refreshNextCardPreview();
    }

    private refreshNextCardPreview() {
        if (this.nextCardPreview) { this.nextCardPreview.destroy(); this.nextCardPreview = null; }
        if (this.deck.length === 0) return;

        const nextCard = getCardAtTier(this.deck[this.deck.length - 1].id, tierForLevel(this.levelIndex), this.levelIndex);
        const spacing  = 150;
        const px = 512 + ((HAND_SIZE - 1) * spacing) / 2 + spacing;
        const py = 768 - 110;
        const img    = this.add.image(0, 0, nextCard.imageKey).setDisplaySize(130, 190);
        const border = this.add.rectangle(0, 0, 130, 190, 0x000000, 0).setStrokeStyle(2, 0x44ff88);
        const badge  = this.add.rectangle(0, -74, 100, 22, 0x000000, 0.85).setStrokeStyle(1, 0x44ff88);
        const lbl    = this.add.text(0, -74, 'NEXT DRAW', { fontSize: '10px', color: '#44ff88', fontStyle: 'bold' }).setOrigin(0.5);
        this.nextCardPreview = this.add.container(px, py, [img, border, badge, lbl]).setDepth(20).setAlpha(0);
        this.tweens.add({ targets: this.nextCardPreview, alpha: 0.85, duration: 300 });
    }

    private playCard(container: Phaser.GameObjects.Container) {
        if (this.gameEnded) return;
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

        const cardSfxKey = playCardSFX(card.id);
        if (cardSfxKey) playCardSound(this, cardSfxKey as import('../audio/AudioManager').AudioKey);
        playPixelCrunch(this);
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
        if (card.id === 'boost') this.activateBoost();
        else if (this.boostActive) {
            // Cut remaining processing time in half
            const slot = this.processing[freeSlot];
            if (slot) {
                const remaining = slot.card.duration - slot.elapsed;
                slot.card = { ...slot.card, duration: slot.elapsed + remaining * 0.5 };
            }
        }
        this.time.delayedCall(350, () => this.dealHand());
    }

    private activateBoost() {
        const BOOST_DURATION = 5;
        this.boostActive   = true;
        this.boostTimeLeft = BOOST_DURATION;

        // Cut remaining time in half for all active cards
        for (const slot of this.processing) {
            if (!slot || slot.card.id === 'boost') continue;
            const remaining = slot.card.duration - slot.elapsed;
            slot.card = { ...slot.card, duration: slot.elapsed + remaining * 0.5 };
        }

        VFX.floatText(this, 130, 200, `⚡ BOOST  ½ time (${BOOST_DURATION}s)`, '#ffaa44');
    }

    private finishCard(slot: ProcessingSlot, index: number) {
        const card    = slot.card;
        const palette = CARD_COLORS[card.imageKey] ?? { particle: 0x22cc88 };
        const wx = slot.container.x;
        const wy = slot.container.y;

        this.addHeat(card.heat);
        this.points += card.points;
        this.refreshStarCount();

        // Resource was already drip-fed during processing — just show the float text and trigger win check
        if (card.resource && card.resourceAmount > 0) {
            VFX.floatText(this, wx + 100, wy,
                `${RES_ICON[card.resource]} +${card.resourceAmount}`,
                card.resource === 'electricity' ? '#ffff66'
                    : card.resource === 'fuel'  ? '#ffaa44'
                    : '#aabbdd');
            this.updateMachineStage();
            this.checkWinCondition();
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
            const duration = [8, 12, 18][tierForLevel(this.levelIndex)] ?? 8;
            this.activateMonitor(duration);
        }

        this.checkCombo(card);

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
        this.heatBar.label.setAlpha(1);
        Object.values(this.resBars.labels).forEach(l => l.setAlpha(1));

        // Next-card preview
        this.refreshNextCardPreview();

        // Scan flash
        VFX.flashAt(this, 512, 384, 1024, 768, 0x44ff88, 0.2);
        VFX.floatText(this, 512, 300, `🖥️ MONITOR ACTIVE  (${duration}s)`, '#44ff88');
    }

    private deactivateMonitor() {
        this.monitorActive = false;

        // Fade out labels
        this.tweens.add({ targets: this.heatBar.label, alpha: 0, duration: 400 });
        Object.values(this.resBars.labels).forEach(l =>
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
        this.resBars.fills[type].width  = BAR_W * ratio;
        this.resBars.labels[type].setText(`${Math.floor(this.resources[type])} / ${needed}`);

        // Advance machine stage
        this.updateMachineStage();
        this.checkWinCondition();
    }

    private checkWinCondition() {
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
        if (this.evaluatingResult || this.gameEnded) return;
        this.evaluatingResult = true;

        // If a ship launch is still animating, wait for it to finish first
        if (this.shipLaunchInProgress) {
            this.time.delayedCall(2000, () => {
                this.evaluatingResult = false;
                this.evaluateResult();
            });
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

        // Cancel any cards still processing — launch fires immediately
        for (let i = 0; i < this.processing.length; i++) {
            const slot = this.processing[i];
            if (!slot) continue;
            this.tweens.add({
                targets: slot.container, alpha: 0, scaleX: 0.8, scaleY: 0.8,
                duration: 250, ease: 'Quad.In',
                onComplete: () => slot.container.destroy(),
            });
            this.processing[i] = null;
        }

        this.spaceshipsBuilt++;
        const shipColor = this.spaceshipsBuilt >= 3 ? '#ffcc00'
                        : this.spaceshipsBuilt >= 2 ? '#88ffcc'
                        : '#aaffee';
        this.shipCountTxt.setText(`${this.spaceshipsBuilt} / 3`).setColor(shipColor);

        playSFX(this, AUDIO.LAUNCH);
        VFX.flashAt(this, 512, 384, 1024, 768, 0x22cc88, 0.5);
        VFX.screenShake(this, 0.006, 350);
        this.machineImg.stop();

        // Heat relief on launch
        this.addHeat(-20);
        VFX.floatText(this, DROP_ZONE_X + 160, DROP_ZONE_Y, '−20 🔥', '#88ddff');

        // Banner
        VFX.floatText(this, DROP_ZONE_X, DROP_ZONE_Y - 140,
            `🚀 SPACESHIP #${this.spaceshipsBuilt} LAUNCHED!`, '#22ffaa');

        // Ship starts small (far away) and grows as it rises toward the camera, then shoots off
        const ship = this.add.image(DROP_ZONE_X, DROP_ZONE_Y + 60, this.shipKeyForLevel())
            .setDisplaySize(40, 40).setDepth(40).setAlpha(0);

        const exhaust = this.add.particles(DROP_ZONE_X, DROP_ZONE_Y + 80, 'vfx_dot', {
            speedY: { min: 60, max: 160 }, speedX: { min: -30, max: 30 },
            lifespan: { min: 400, max: 700 }, scale: { start: 0.8, end: 0 },
            tint: [0xff8800, 0xffff44, 0xffffff], frequency: 18,
        }).setDepth(39);

        // Phase 1: fade in and grow toward camera
        this.tweens.add({
            targets: ship, alpha: 1, scaleX: 3.2, scaleY: 3.2,
            y: DROP_ZONE_Y - 80,
            duration: 900, ease: 'Quad.Out',
            onComplete: () => {
                // Phase 2: blast upward and fade out
                this.tweens.add({
                    targets: ship, y: -200, scaleX: 0.4, scaleY: 0.4, alpha: 0,
                    duration: 900, ease: 'Quad.In',
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
                            this.resBars.fills[res].width = 0;
                            this.resBars.labels[res].setText(`0 / ${needs[res]}`);
                        }
                        void BAR_W;

                        this.shipLaunchInProgress = false;

                        if (this.spaceshipsBuilt >= 3) {
                            playVoiceline(this, AUDIO.VL_SAVE_HUMANITY);
                            this.time.delayedCall(1200, () => this.endGame(true, 3, 'timeout'));
                            return;
                        }

                        // Restart machine animation for next ship
                        this.machineStage = 0;
                        this.machineImg.play(this.levelIndex >= 5 ? 'machine_run_l5' : 'machine_run');
                    },
                });
            },
        });
    }

    private showExitConfirm() {
        const group: Phaser.GameObjects.GameObject[] = [];
        const add = <T extends Phaser.GameObjects.GameObject>(obj: T) => { group.push(obj); return obj; };

        add(this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.6).setDepth(50));
        add(this.add.rectangle(512, 384, 440, 200, 0x111111, 1).setStrokeStyle(2, 0xffffff).setDepth(51));
        add(this.add.text(512, 320, 'Progress will not be saved.\nAre you sure you want to exit?', {
            fontSize: '20px', color: '#ffffff', align: 'center',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(52));

        const close = () => group.forEach(o => o.destroy());

        const makeBtn = (x: number, label: string, color: number, onClick: () => void) => {
            const bg = add(this.add.rectangle(x, 410, 160, 48, color).setDepth(52).setInteractive({ useHandCursor: true }));
            add(this.add.text(x, 410, label, {
                fontSize: '20px', color: '#ffffff', fontFamily: 'Arial Black',
                stroke: '#000000', strokeThickness: 4,
            }).setOrigin(0.5).setDepth(53));
            bg.on('pointerover', () => bg.setAlpha(0.75))
              .on('pointerout',  () => bg.setAlpha(1))
              .on('pointerdown', onClick);
        };

        makeBtn(420, 'Exit', 0xcc2222, () => { stopMusic(this); this.scene.start('LevelMenu'); });
        makeBtn(604, 'Stay', 0x227722, () => close());
    }

    private checkCombo(finished: Card) {
        // Combos only trigger during active power mode
        if (!this.powerUnlocked) return;

        const activeSlots = this.processing.filter((s): s is ProcessingSlot => s !== null);
        const activeIds   = activeSlots.map(s => s.card.id);
        const hotIds      = ['fuel', 'boost', 'titanium'];

        const tryCombo = (key: string, fire: () => void) => {
            if (this.usedCombos.has(key)) return;
            this.usedCombos.add(key);
            fire();
        };

        // ── Boost combos ──────────────────────────────────────────────────
        if (finished.id === 'boost') {
            for (const slot of activeSlots) {
                if (['electricity', 'fuel', 'titanium'].includes(slot.card.id)) {
                    const res = slot.card.id;
                    tryCombo(`boost:${res}`, () => {
                        this.addResource(slot.card.resource!, slot.card.resourceAmount);
                        const color = res === 'electricity' ? 0xaa44ff : res === 'fuel' ? 0xff8800 : 0x88aacc;
                        this.showComboBanner(`BOOST COMBO!  +${res.toUpperCase()}`, color);
                    });
                }
            }
        }
        if (finished.id === 'electricity' && activeIds.includes('boost'))
            tryCombo('boost:electricity', () => { this.addResource('electricity', finished.resourceAmount); this.showComboBanner('BOOST COMBO!  +ELECTRICITY', 0xaa44ff); });
        if (finished.id === 'fuel' && activeIds.includes('boost'))
            tryCombo('boost:fuel', () => { this.addResource('fuel', finished.resourceAmount); this.showComboBanner('BOOST COMBO!  +FUEL', 0xff8800); });
        if (finished.id === 'titanium' && activeIds.includes('boost'))
            tryCombo('boost:titanium', () => { this.addResource('titanium', finished.resourceAmount); this.showComboBanner('BOOST COMBO!  +TITANIUM', 0x88aacc); });

        // ── Solar combo ───────────────────────────────────────────────────
        if (finished.id === 'electricity' && activeIds.includes('solar'))
            tryCombo('solar:electricity', () => { this.addResource('electricity', 3); this.showComboBanner('SOLAR COMBO!  +3 ELECTRICITY', 0xffee44); });
        if (finished.id === 'solar' && activeIds.includes('electricity'))
            tryCombo('solar:electricity', () => { this.addResource('electricity', 3); this.showComboBanner('SOLAR COMBO!  +3 ELECTRICITY', 0xffee44); });

        // ── Cryo combo ────────────────────────────────────────────────────
        if (finished.id === 'cool' && activeIds.some(id => hotIds.includes(id)))
            tryCombo('cryo:cool', () => { this.addHeat(-8); this.showComboBanner('CRYO COMBO!  -8 HEAT', 0x00ccff); });
        if (hotIds.includes(finished.id) && activeIds.includes('cool'))
            tryCombo('cryo:cool', () => { this.addHeat(-8); this.showComboBanner('CRYO COMBO!  -8 HEAT', 0x00ccff); });
    }

    private showComboBanner(message: string, color: number) {
        this.timeRemaining += 3;
        VFX.floatText(this, 512, 55, '+3s', '#44ffaa');

        const hex = '#' + color.toString(16).padStart(6, '0');
        const banner = this.add.text(512, 80, message, {
            fontSize: '22px',
            color: hex,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center',
        }).setOrigin(0.5).setDepth(50).setAlpha(0);

        this.tweens.add({
            targets: banner,
            alpha: { from: 0, to: 1 },
            y: { from: 95, to: 75 },
            duration: 250,
            ease: 'Back.Out',
            onComplete: () => {
                this.time.delayedCall(900, () => {
                    this.tweens.add({
                        targets: banner,
                        alpha: 0,
                        y: 55,
                        duration: 400,
                        ease: 'Quad.In',
                        onComplete: () => banner.destroy(),
                    });
                });
            },
        });

        VFX.screenShake(this, 0.003, 200);
    }

    private shipKeyForLevel(): string {
        const i = this.levelIndex;
        if (i === 0) return 'spaceship_1';
        if (i === 1) return 'spaceship_2';
        if (i === 2) return 'spaceship_3';
        if (i === 3) return 'spaceship_4';
        if (i <= 5) return 'spaceship_56';
        if (i <= 8) return 'spaceship_89';
        return 'spaceship_10';
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private refreshStarCount() {
        if (!this.unlockBtnFill) return;
        const ratio = Math.min(this.points / POWER_UNLOCK_COST, 1);
        const ready = ratio >= 1 && !this.powerUnlocked && !this.powerOnCooldown;

        this.unlockBtnFill.setSize(this.unlockBtnFill.width, Math.max(56 * ratio, 1));
        this.unlockBtnFill.setAlpha(ratio > 0 && !this.powerOnCooldown ? 1 : 0);
        this.unlockBtnIcon.setAlpha(this.powerOnCooldown ? 0.15 : 0.15 + 0.85 * ratio);
        this.unlockBtnBg.setStrokeStyle(2, ready ? 0xcc88ff : 0x441166);

        if (ready && !this.unlockPulseTween) {
            this.unlockBtnBg.setInteractive({ useHandCursor: true });
            this.unlockPulseTween = this.tweens.add({
                targets: this.unlockBtnIcon,
                alpha: { from: 0.7, to: 1 },
                yoyo: true, repeat: -1, duration: 500, ease: 'Sine.InOut',
            });
        } else if (!ready) {
            this.unlockBtnBg.disableInteractive();
            this.unlockPulseTween?.stop();
            this.unlockPulseTween = null;
        }
    }

    private showFullMessage() {
        const txt = this.add.text(
            DROP_ZONE_X, DROP_ZONE_Y - DROP_ZONE_H / 2 - 22,
            'Processing slot full!',
            { fontSize: '20px', color: '#ff4444', fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(30);
        this.tweens.add({
            targets: txt, y: txt.y - 32, alpha: 0, duration: 1200,
            onComplete: () => txt.destroy(),
        });
    }

    private buildUnlockButton(): Phaser.GameObjects.Container {
        const BTN_X  = 130;
        const BTN_Y  = 680;
        const SIZE   = 60;

        this.unlockBtnBg = this.add.rectangle(0, 0, SIZE, SIZE, 0x0d0020)
            .setStrokeStyle(2, 0x441166);
        this.unlockBtnFill = this.add.rectangle(0, SIZE / 2 - 2, SIZE - 6, 1, 0xaa44ff)
            .setOrigin(0.5, 1).setAlpha(0);
        this.unlockBtnIcon = this.add.text(0, 0, '⚡', { fontSize: '28px' })
            .setOrigin(0.5).setAlpha(0.15);

        this.unlockBtnBg
            .on('pointerover', () => {
                if (this.points >= POWER_UNLOCK_COST && !this.powerUnlocked)
                    this.unlockBtnBg.setStrokeStyle(2, 0xffffff);
            })
            .on('pointerout', () => {
                if (this.points >= POWER_UNLOCK_COST && !this.powerUnlocked)
                    this.unlockBtnBg.setStrokeStyle(2, 0xcc88ff);
            })
            .on('pointerdown', () => this.unlockPower());

        return this.add.container(BTN_X, BTN_Y, [
            this.unlockBtnBg, this.unlockBtnFill, this.unlockBtnIcon,
        ]).setDepth(10);
    }

    private unlockPower() {
        if (this.powerUnlocked || this.powerOnCooldown || this.points < POWER_UNLOCK_COST) return;

        const bx = this.unlockBtn.x;
        const by = this.unlockBtn.y;

        // Reset points to 0 on use, clear combo history for this session
        this.points        = 0;
        this.usedCombos    = new Set();
        this.powerUnlocked = true;
        this.maxProcSlots  = MAX_PROC_SLOTS;

        this.unlockPulseTween?.stop();
        this.unlockPulseTween = null;
        this.refreshStarCount();
        this.unlockBtn.setVisible(false);

        playSFX(this, AUDIO.CARD_POWER);
        VFX.burst(this, bx, by, 0xaa44ff, 30);
        VFX.screenShake(this, 0.005, 250);
        VFX.floatText(this, bx, by - 44, '⚡ POWER UNLOCKED!', '#cc88ff');

        const POWER_DURATION  = 5;
        const COOLDOWN        = 8;

        const badge = this.add.text(bx, by, `⚡ POWER ACTIVE  (${POWER_DURATION}s)`, {
            fontSize: '12px', color: '#ffcc00', fontStyle: 'bold', align: 'center',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: badge, alpha: { from: 0.6, to: 1 }, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.InOut' });

        let remaining = POWER_DURATION;
        const activeTick = this.time.addEvent({
            delay: 1000,
            repeat: POWER_DURATION - 1,
            callback: () => {
                remaining--;
                if (remaining > 0) {
                    badge.setText(`⚡ POWER ACTIVE  (${remaining}s)`);
                } else {
                    badge.destroy();
                    activeTick.remove();
                    this.maxProcSlots  = 1;
                    this.powerUnlocked = false;
                    this.powerOnCooldown = true;
                    this.usedCombos    = new Set();
                    this.unlockBtn.setVisible(true);
                    this.refreshStarCount();
                    VFX.floatText(this, bx, by, '⚡ POWER ENDED', '#aa44ff');

                    // ── 8s cooldown ──────────────────────────────────────
                    const cdBadge = this.add.text(bx, by + 38, `COOLDOWN  ${COOLDOWN}s`, {
                        fontSize: '11px', color: '#886699', fontStyle: 'bold', align: 'center',
                        stroke: '#000000', strokeThickness: 2,
                    }).setOrigin(0.5).setDepth(10);

                    let cd = COOLDOWN;
                    const cdTick = this.time.addEvent({
                        delay: 1000,
                        repeat: COOLDOWN - 1,
                        callback: () => {
                            cd--;
                            if (cd > 0) {
                                cdBadge.setText(`COOLDOWN  ${cd}s`);
                            } else {
                                cdBadge.destroy();
                                cdTick.remove();
                                this.powerOnCooldown = false;
                                this.refreshStarCount();
                                VFX.floatText(this, bx, by, '⚡ READY', '#cc88ff');
                            }
                        },
                    });
                }
            },
        });
    }

    private addHeat(amount: number) {
        this.heat = Math.min(Math.max(this.heat + amount, 0), this.levelData.maxHeat);
        const ratio = this.heat / this.levelData.maxHeat;
        const BAR_W = 180;
        this.heatBar.fill.width = BAR_W * ratio;
        const g = Math.floor((1 - ratio) * 80);
        this.heatBar.fill.setFillStyle((0xff << 16) | (g << 8));
        this.heatBar.label.setText(`${Math.floor(this.heat)} / ${this.levelData.maxHeat}`);

        if (!this.heat42Played && ratio >= 0.42) {
            this.heat42Played = true;
            playVoiceline(this, AUDIO.VL_HEAT_LEVEL_42);
        }

        if (this.heat >= this.levelData.maxHeat) this.endGame(false, 0);
    }

    // ── Random event logic ─────────────────────────────────────────────────

    private scheduleNextEvent() {
        if (this.gameEnded) return;
        const delay = 12000 + Math.random() * 8000;
        this.time.delayedCall(delay, () => {
            if (this.gameEnded) return;
            // Skip if an event is already active — wait for next schedule
            if (this.activeEvent) { this.scheduleNextEvent(); return; }
            const eligible = RANDOM_EVENTS.filter(e => e.minLevel <= this.levelIndex);
            if (eligible.length === 0) { this.scheduleNextEvent(); return; }
            const evt = eligible[Math.floor(Math.random() * eligible.length)];
            this.triggerEvent(evt);
            this.scheduleNextEvent();
        });
    }

    private triggerEvent(evt: GameEvent) {
        // Always reset any lingering effects before applying new ones
        this.heatMultiplier   = 1;
        this.processingPaused = false;

        this.activeEvent      = evt;
        this.eventTimeLeft    = evt.duration;

        if (evt.key === 'solar_flare')   { this.heatMultiplier   = 1.25; playVoiceline(this, AUDIO.VL_SOLAR_FLARE); }
        if (evt.key === 'system_glitch') { this.processingPaused = true;  playVoiceline(this, AUDIO.VL_SYSTEM_GLITCH); }
        if (evt.key === 'meteor_shower') { this.addHeat(5);              playVoiceline(this, AUDIO.VL_METEORITE); }

        showEventBanner(this, evt);
        VFX.flashAt(this, 512, 384, 1024, 768, evt.color, 0.35);
        VFX.screenShake(this, 0.006, 400);
    }

    private endGame(won: boolean, stars: number, reason: 'overheat' | 'timeout' = 'overheat') {
        if (this.gameEnded) return;
        this.gameEnded    = true;
        this.maxProcSlots = 1;
        this.powerUnlocked = false;
        stopMusic(this);

        // ── Voiceovers on game end ────────────────────────────────────────
        if (!won && reason === 'overheat') {
            playVoiceline(this, AUDIO.VL_OVERHEAT);
        }
        // Win voiceover (VL_SAVE_HUMANITY) is played in launchSpaceship before endGame is called

        VFX.flashAt(this, 512, 384, 1024, 768, won ? 0x22cc88 : 0xff2200, 0.8);
        VFX.screenShake(this, 0.01, 400);
        this.time.delayedCall(500, () => {
            this.scene.start('GameOver', {
                won,
                stars,
                reason,
                levelIndex: this.levelIndex,
                timeTaken:  Math.round(this.levelData.timeLimit - this.timeRemaining),
            });
        });
    }
}

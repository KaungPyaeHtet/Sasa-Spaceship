import { Scene } from 'phaser';
import { CARD_UPGRADES, CardUpgradeDef, getCardAtTier } from '../data/cardUpgrades';
import { getCardTier, upgradeCard, getStarBalance } from '../data/progress';
import { playHover } from '../ui/sounds';

// Row 1: 4 cards   Row 2: 3 cards (centred)
const ROW1 = 4;
const CARD_W = 226;
const CARD_H = 295;
const GAP_X  = 12;
const GAP_Y  = 18;
const IMG_H  = 130;  // image takes top portion of card

// Row 1 — evenly fills the screen
const ROW1_TOTAL = ROW1 * CARD_W + (ROW1 - 1) * GAP_X;          // 956
const ROW1_START = (1024 - ROW1_TOTAL) / 2 + CARD_W / 2;         // 147
const ROW1_Y     = 140 + CARD_H / 2;                             // 287

// Row 2 — 3 cards, horizontally centred
const ROW2 = 3;
const ROW2_TOTAL = ROW2 * CARD_W + (ROW2 - 1) * GAP_X;          // 702
const ROW2_START = (1024 - ROW2_TOTAL) / 2 + CARD_W / 2;         // 275
const ROW2_Y     = ROW1_Y + CARD_H + GAP_Y;                      // 600

const TIER_COLOR = [0x4488ff, 0x22cc88, 0xffcc00] as const;
const TIER_ROMAN = ['I', 'II', 'III'] as const;

const TIER_DESC: Record<string, [string, string, string]> = {
    electricity: [
        'Basic capacitor. Generates moderate electricity with some heat.',
        'Enhanced coil. More output, lower heat signature.',
        'Overclocked array. Maximum electricity, minimal heat.',
    ],
    solar: [
        'Standard panel. Slow but zero heat — reliable filler.',
        'High-efficiency cells. Faster output, still heat-free.',
        'Max-output array. Best clean electricity in the deck.',
    ],
    fuel: [
        'Basic fuel cell. Decent propellant, runs hot.',
        'Refined cell. Better yield, slightly cooler burn.',
        'High-grade compound. Premium fuel, controlled burn.',
    ],
    boost: [
        'Standard booster. High fuel output but extreme heat.',
        'Boosted injector. More fuel, marginally safer.',
        'Hyper-boost. Massive fuel surge — handle with care.',
    ],
    titanium: [
        'Raw ore. Slow to process, solid hull material.',
        'Processed alloy. Faster smelting, better yield.',
        'Aerospace alloy. Maximum hull material per run.',
    ],
    cool: [
        'Basic coolant flush. Reliable heat relief.',
        'Advanced coolant. Deeper cooling per use.',
        'Cryo-burst. Dramatic heat drop in an instant.',
    ],
    monitor: [
        'Scans systems for 8 s — reveals all stats & next card.',
        'Deep scan for 12 s — full HUD transparency.',
        'Full intel for 18 s — total battlefield awareness.',
    ],
};

const RES_ICON: Record<string, string> = { electricity: '⚡', fuel: '🛢️', titanium: '🔩' };

export class CardUpgrade extends Scene {
    private balanceTxt!: Phaser.GameObjects.Text;

    constructor() { super('CardUpgrade'); }

    create() {
        this.add.image(512, 384, 'background').setAlpha(0.45);
        this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.45);

        // Header
        this.add.text(512, 28, 'CARD UPGRADES', {
            fontFamily: 'Arial Black', fontSize: '32px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5);

        this.balanceTxt = this.add.text(512, 66, '', {
            fontSize: '14px', color: '#ffcc00', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);
        this.refreshBalance();

        // Back button
        const backBg = this.add.rectangle(52, 28, 88, 32, 0x111122)
            .setStrokeStyle(1, 0x4488ff).setInteractive({ useHandCursor: true });
        this.add.text(52, 28, '← Back', { fontSize: '13px', color: '#aaccff' }).setOrigin(0.5);
        backBg.on('pointerover', () => { backBg.setFillStyle(0x223355); playHover(this); });
        backBg.on('pointerout',  () => backBg.setFillStyle(0x111122));
        backBg.on('pointerdown', () => this.scene.start('LevelMenu'));

        // Row 1 — 4 cards
        for (let i = 0; i < 4 && i < CARD_UPGRADES.length; i++) {
            const x = ROW1_START + i * (CARD_W + GAP_X);
            this.buildCard(CARD_UPGRADES[i], x, ROW1_Y);
        }

        // Row 2 — remaining cards, centred
        for (let i = 4; i < CARD_UPGRADES.length; i++) {
            const col = i - 4;
            const x   = ROW2_START + col * (CARD_W + GAP_X);
            this.buildCard(CARD_UPGRADES[i], x, ROW2_Y);
        }
    }

    private buildCard(def: CardUpgradeDef, cx: number, cy: number) {
        const tier       = getCardTier(def.id);
        const tColor     = TIER_COLOR[tier];
        const canUpgrade = tier < 2;
        const cost       = canUpgrade ? def.tierCosts[tier] : 0;
        const canAfford  = canUpgrade && getStarBalance() >= cost;

        // Shell
        const bg = this.add.rectangle(cx, cy, CARD_W, CARD_H, 0x07111e)
            .setStrokeStyle(canAfford ? 2 : 1, tColor);
        if (canAfford) {
            this.tweens.add({ targets: bg, alpha: { from: 0.7, to: 1 }, yoyo: true, repeat: -1, duration: 900 });
        }

        // Full-width card image
        const imgKey = getCardAtTier(def.id, tier).imageKey;
        this.add.image(cx, cy - CARD_H / 2 + IMG_H / 2, imgKey)
            .setDisplaySize(CARD_W - 2, IMG_H);

        // Divider under image
        this.add.rectangle(cx, cy - CARD_H / 2 + IMG_H, CARD_W - 2, 1, tColor, 0.7);

        // Tier badge (top-right)
        this.add.rectangle(cx + CARD_W / 2 - 22, cy - CARD_H / 2 + 13, 36, 22, tColor);
        this.add.text(cx + CARD_W / 2 - 22, cy - CARD_H / 2 + 13,
            `T${TIER_ROMAN[tier]}`, { fontSize: '12px', color: '#000000', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // Card name
        const nameY = cy - CARD_H / 2 + IMG_H + 16;
        this.add.text(cx, nameY, def.id.toUpperCase(), {
            fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        // Tier label
        this.add.text(cx, nameY + 18, def.tierLabels[tier], {
            fontSize: '11px', color: `#${tColor.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5);

        // Stats row
        const t      = def.tiers[tier as 0|1|2];
        const durStr = `⏱ ${t.duration}s`;
        const htStr  = `🔥 ${t.heat > 0 ? '+' : ''}${t.heat}`;
        const resStr = t.resourceAmount > 0
            ? `${RES_ICON[def.id] ?? '🖥️'} +${t.resourceAmount}`
            : def.id === 'cool' ? '❄️ cools' : '🖥️ scans';
        const ptStr  = `⭐ +${t.points}`;

        const statsY = nameY + 36;
        this.add.text(cx, statsY, `${durStr}   ${htStr}`, {
            fontSize: '11px', color: '#cccccc',
        }).setOrigin(0.5);
        this.add.text(cx, statsY + 16, `${resStr}   ${ptStr}`, {
            fontSize: '11px', color: '#ffee88',
        }).setOrigin(0.5);

        // Description
        const descArr = TIER_DESC[def.id];
        if (descArr) {
            this.add.text(cx, statsY + 35, descArr[tier], {
                fontSize: '10px', color: '#7799aa', align: 'center',
                wordWrap: { width: CARD_W - 20 },
            }).setOrigin(0.5, 0);
        }

        // Tier pips
        const pipY = cy + CARD_H / 2 - 38;
        for (let i = 0; i < 3; i++) {
            this.add.text(cx - 20 + i * 20, pipY,
                i <= tier ? '●' : '○', {
                fontSize: '13px',
                color: i <= tier
                    ? `#${TIER_COLOR[i].toString(16).padStart(6, '0')}`
                    : '#2a2a44',
            }).setOrigin(0.5);
        }

        // Upgrade button / MAX badge
        const btnY = cy + CARD_H / 2 - 17;
        if (canUpgrade) {
            const nextColor = TIER_COLOR[(tier + 1) as 0|1|2];
            const btnBg  = this.add.rectangle(cx, btnY, CARD_W - 14, 26,
                canAfford ? 0x0d2244 : 0x0e0e18)
                .setStrokeStyle(1, canAfford ? nextColor : 0x2a2a44)
                .setInteractive({ useHandCursor: canAfford });
            const btnTxt = this.add.text(cx, btnY,
                canAfford
                    ? `↑ Upgrade → T${TIER_ROMAN[(tier + 1) as 0|1|2]}   ⭐ ${cost}`
                    : `Need ⭐ ${cost} to upgrade`, {
                fontSize: '11px', fontStyle: 'bold',
                color: canAfford ? `#${nextColor.toString(16).padStart(6, '0')}` : '#444466',
            }).setOrigin(0.5);

            if (canAfford) {
                btnBg.on('pointerover', () => { btnBg.setFillStyle(0x1a3a66); playHover(this); });
                btnBg.on('pointerout',  () => btnBg.setFillStyle(0x0d2244));
                btnBg.on('pointerdown', () => {
                    if (upgradeCard(def.id, cost)) {
                        this.scene.restart();
                    } else {
                        this.tweens.add({
                            targets: [btnBg, btnTxt], x: `+=6`,
                            yoyo: true, repeat: 4, duration: 35,
                            onComplete: () => { btnBg.x = cx; btnTxt.x = cx; },
                        });
                        this.showNotEnough(cx, cy);
                    }
                });
            }
        } else {
            this.add.text(cx, btnY, '★  MAX TIER  ★', {
                fontSize: '12px', color: '#ffcc00', fontStyle: 'bold',
            }).setOrigin(0.5);
        }
    }

    private showNotEnough(cx: number, cy: number) {
        const txt = this.add.text(cx, cy - CARD_H / 2 - 18, 'Not enough ⭐!', {
            fontSize: '13px', color: '#ff4444', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({ targets: txt, y: txt.y - 26, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
    }

    private refreshBalance() {
        this.balanceTxt.setText(`⭐ Available stars: ${getStarBalance()}   — earn more by completing levels`);
    }
}

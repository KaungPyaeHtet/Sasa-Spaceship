import { Scene } from 'phaser';
import { cardDefinitions } from '../data/cards';
import { CARD_COLORS } from '../vfx/VFX';
import { playHover } from '../ui/sounds';

const COMBOS: Record<string, { partner: string; icon: string; effect: string; color: string }[]> = {
    electricity: [
        { partner: 'Booster',     icon: '', effect: 'BOOST COMBO — instantly awards a free copy of your Electricity output', color: '#aaffcc' },
        { partner: 'Solar Panel', icon: '', effect: 'SOLAR COMBO — awards +3 bonus Electricity on top of normal output',      color: '#ffee88' },
    ],
    fuel: [
        { partner: 'Booster', icon: '', effect: 'BOOST COMBO — instantly awards a free copy of your Fuel output', color: '#aaffcc' },
    ],
    titanium: [
        { partner: 'Booster', icon: '', effect: 'BOOST COMBO — instantly awards a free copy of your Titanium output', color: '#aaffcc' },
    ],
    cool: [
        { partner: 'Fuel / Booster / Titanium', icon: '', effect: 'CRYO COMBO — process alongside any hot card for an extra −8 heat reduction', color: '#88ddff' },
    ],
    boost: [
        { partner: 'Electricity', icon: '', effect: 'BOOST COMBO — grants a free Electricity bonus', color: '#cc88ff' },
        { partner: 'Fuel',        icon: '', effect: 'BOOST COMBO — grants a free Fuel bonus',        color: '#cc88ff' },
        { partner: 'Titanium',    icon: '', effect: 'BOOST COMBO — grants a free Titanium bonus',    color: '#cc88ff' },
    ],
    solar: [
        { partner: 'Electricity', icon: '', effect: 'SOLAR COMBO — awards +3 bonus Electricity when processed together', color: '#ffee88' },
    ],
    monitor: [],
};

const TIPS: Record<string, string> = {
    electricity: 'Fastest card available — no heat means you can spam it safely in early levels.',
    fuel:        'Core fuel source but generates heat. Pair with Coolant or Cryo Combo to stay safe.',
    titanium:    'Highest resource value per card. Combine with Booster to double output and clear bars fast.',
    cool:        'Slow to process but essential. Drop it before heat gets critical, not after. Pair with a hot card in another slot for the Cryo bonus.',
    boost:       'Produces nothing alone. Cuts remaining processing time in half for all active cards — more valuable on long cards like Coolant than short ones.',
    solar:       'Niche but free. Zero heat and pairs with Electricity for a quick +3 bonus. Good when you just need a few more points.',
    monitor:     'Near-instant (0.5s). Use it to peek at your next card so you can plan the combo ahead of time.',
};

const CARD_ORDER = ['electricity', 'fuel', 'titanium', 'cool', 'boost', 'solar', 'monitor'];

export class CardInfo extends Scene {
    private detailGroup:   Phaser.GameObjects.GameObject[] = [];
    private selectorGroup: Phaser.GameObjects.GameObject[] = [];
    private currentTier    = 1;
    private currentCardIdx = 0;
    private tierLabel!:    Phaser.GameObjects.Text;

    constructor() { super('CardInfo'); }

    create() {
        this.add.image(512, 384, 'background').setAlpha(0.4);
        this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.55);

        // Back button
        const backBtn = this.add.image(80, 40, 'back_button').setDisplaySize(120, 50)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => { backBtn.setAlpha(0.75); playHover(this); })
            .on('pointerout',  () => backBtn.setAlpha(1))
            .on('pointerdown', () => this.scene.start('LevelMenu'));

        // Tier switcher (bottom centre)
        const prevBtn = this.add.text(380, 742, '◀', {
            fontSize: '22px', color: '#aaaaaa', fontStyle: 'bold',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          .on('pointerover', () => prevBtn.setColor('#ffffff'))
          .on('pointerout',  () => prevBtn.setColor('#aaaaaa'))
          .on('pointerdown', () => this.changeTier(-1));

        this.tierLabel = this.add.text(512, 742, 'Level 1', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        const nextBtn = this.add.text(644, 742, '▶', {
            fontSize: '22px', color: '#aaaaaa', fontStyle: 'bold',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          .on('pointerover', () => nextBtn.setColor('#ffffff'))
          .on('pointerout',  () => nextBtn.setColor('#aaaaaa'))
          .on('pointerdown', () => this.changeTier(1));

        this.buildSelector();
        this.showCard();
    }

    private changeTier(dir: number) {
        this.currentTier = Math.max(1, Math.min(10, this.currentTier + dir));
        this.tierLabel.setText(`Level ${this.currentTier}`);
        this.buildSelector();
        this.showCard();
    }

    private buildSelector() {
        this.selectorGroup.forEach(o => o.destroy());
        this.selectorGroup = [];
        const sadd = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.selectorGroup.push(o); return o; };

        const cards  = CARD_ORDER.map(id => cardDefinitions.find(c => c.id === id)!);
        const startX = 512 - ((cards.length - 1) * 108) / 2;
        const tier   = this.currentTier;

        cards.forEach((card, i) => {
            const x   = startX + i * 108;
            const pal = CARD_COLORS[card.imageKey] ?? { border: 0x4488ff, bg: 0x1a2a4a, particle: 0x4488ff };

            const bg = sadd(this.add.rectangle(x, 115, 90, 130, 0x0a1020)
                .setStrokeStyle(2, pal.border)
                .setInteractive({ useHandCursor: true }));

            sadd(this.add.image(x, 108, `${card.imageKey}_t${tier}`).setDisplaySize(82, 118));

            bg.on('pointerover', () => { bg.setFillStyle(0x1a2a3a); playHover(this); })
              .on('pointerout',  () => bg.setFillStyle(0x0a1020))
              .on('pointerdown', () => { this.currentCardIdx = i; this.showCard(); });
        });
    }

    private showCard() {
        this.detailGroup.forEach(o => o.destroy());
        this.detailGroup = [];

        const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
            this.detailGroup.push(o);
            return o;
        };

        const cards  = CARD_ORDER.map(id => cardDefinitions.find(c => c.id === id)!);
        const card   = cards[this.currentCardIdx];
        const index  = this.currentCardIdx;
        const tier   = this.currentTier;
        const bonus  = tier - 1;
        const scaledDuration = parseFloat((card.duration + bonus * 0.10).toFixed(2));
        const scaledResource = card.resourceAmount > 0 ? card.resourceAmount + bonus : 0;
        const pal    = CARD_COLORS[card.imageKey] ?? { border: 0x4488ff, bg: 0x1a2a4a, particle: 0x4488ff };
        const combos = COMBOS[card.id] ?? [];
        const tip    = TIPS[card.id] ?? '';

        // Selection highlight on selector
        const startX = 512 - ((cards.length - 1) * 108) / 2;
        add(this.add.rectangle(startX + index * 108, 115, 94, 134, 0x000000, 0)
            .setStrokeStyle(3, 0xffffff));

        // Large card image (left)
        add(this.add.rectangle(200, 450, 220, 310, 0x050d18).setStrokeStyle(3, pal.border));
        add(this.add.image(200, 445, `${card.imageKey}_t${tier}`).setDisplaySize(210, 300));

        // Particle burst behind card
        add(this.add.particles(200, 445, 'vfx_dot', {
            speed: { min: 20, max: 60 }, lifespan: { min: 400, max: 900 },
            scale: { start: 0.4, end: 0 }, tint: [pal.particle],
            frequency: 120, quantity: 1,
        }));

        // Stats panel (right of card image)
        const SX = 430;
        let   SY = 240;

        add(this.add.text(SX, SY, 'STATS', {
            fontSize: '13px', color: '#aaaaaa', fontStyle: 'bold', letterSpacing: 3,
        }));
        SY += 26;

        const statRows: [string, string, string][] = [
            ['Process time', `${scaledDuration}s`,                                                                                     '#ffffff'],
            ['Heat',         card.heat > 0 ? `+${card.heat}` : card.heat < 0 ? `${card.heat}` : 'None',                               card.heat > 0 ? '#ff6655' : card.heat < 0 ? '#88ddff' : '#888888'],
            ['Resource',     scaledResource > 0 ? `+${scaledResource} ${card.resource!.toUpperCase()}` : 'None',                       scaledResource > 0 ? '#aaffcc' : '#888888'],
            ['Power Points', card.points > 0 ? `+${card.points}` : 'None',                                                            card.points > 0 ? '#ffcc44' : '#888888'],
        ];

        statRows.forEach(([label, value, col]) => {
            add(this.add.text(SX, SY, label, { fontSize: '15px', color: '#888888' }));
            add(this.add.text(SX + 260, SY, value, { fontSize: '15px', color: col, fontStyle: 'bold' }).setOrigin(1, 0));
            add(this.add.rectangle(SX + 128, SY + 20, 260, 1, 0x223344));
            SY += 38;
        });

        // Description
        SY += 6;
        add(this.add.text(SX, SY, 'DESCRIPTION', {
            fontSize: '13px', color: '#aaaaaa', fontStyle: 'bold', letterSpacing: 3,
        }));
        SY += 24;
        add(this.add.text(SX, SY, card.description, {
            fontSize: '14px', color: '#dddddd', wordWrap: { width: 270 }, lineSpacing: 4,
        }));
        SY += 56;

        // Tip
        add(this.add.text(SX, SY, 'TIP', {
            fontSize: '13px', color: '#aaaaaa', fontStyle: 'bold', letterSpacing: 3,
        }));
        SY += 24;
        add(this.add.text(SX, SY, tip, {
            fontSize: '13px', color: '#99bbff', wordWrap: { width: 270 }, lineSpacing: 4, fontStyle: 'italic',
        }));
        SY += 70;

        // Combos
        add(this.add.text(SX, SY, 'COMBOS', {
            fontSize: '13px', color: '#aaaaaa', fontStyle: 'bold', letterSpacing: 3,
        }));
        SY += 24;

        if (combos.length === 0) {
            add(this.add.text(SX, SY, 'No combos for this card.', { fontSize: '13px', color: '#555555', fontStyle: 'italic' }));
        } else {
            combos.forEach(combo => {
                const row = add(this.add.rectangle(SX + 130, SY + 18, 266, 38, 0x0a1428).setStrokeStyle(1, 0x334466));
                void row;
                add(this.add.text(SX + 6, SY + 4, combo.partner, {
                    fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
                }));
                add(this.add.text(SX + 6, SY + 20, combo.effect, {
                    fontSize: '10px', color: combo.color, wordWrap: { width: 258 },
                }));
                SY += 46;
            });
        }

        // Animate panel in
        this.tweens.add({ targets: this.detailGroup, alpha: 1, duration: 180, ease: 'Linear' });
        this.detailGroup.forEach(obj => {
            if ('setAlpha' in obj) (obj as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0);
        });
    }
}

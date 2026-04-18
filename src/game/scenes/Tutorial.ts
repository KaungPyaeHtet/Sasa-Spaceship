import { Scene } from 'phaser';
import { VFX } from '../vfx/VFX';

interface TutorialStep {
    title:   string;
    body:    string;
    // highlight rectangle (null = no highlight, just a general overlay)
    hl:      { x: number; y: number; w: number; h: number } | null;
}

const STEPS: TutorialStep[] = [
    {
        title: 'Welcome to Sasa Spaces!',
        body:  'You are the engineer of a deep-space rocket. Build the ship by processing resource cards before time runs out.\n\nClick NEXT to learn the controls.',
        hl:    null,
    },
    {
        title: 'Your Hand',
        body:  'Four cards are dealt to you at the bottom of the screen.\n\nEach card has a resource type, heat cost, processing time, and point value.\n\nDrag a card up to the machine to start processing it.',
        hl:    { x: 512, y: 658, w: 640, h: 130 },
    },
    {
        title: 'The Machine',
        body:  'Drop a card onto the machine in the centre to process it.\n\nThe machine animates while it works. It advances through 4 stages as you complete more resources.\n\nOnly one card at a time until you unlock Power Mode!',
        hl:    { x: 512, y: 360, w: 260, h: 260 },
    },
    {
        title: 'Processing Slots',
        body:  'When a card is processing, a slot appears on the left showing the card name, stats, and a progress bar.\n\nWait for the bar to empty — then the resources are added and the card is finished.',
        hl:    { x: 130, y: 260, w: 250, h: 220 },
    },
    {
        title: 'Heat Bar',
        body:  'The reactor heats up every second — and even faster when you process hot cards like Fuel and Boost.\n\nIf heat reaches MAX the reactor explodes and the mission fails immediately.\n\nUse the Coolant card to reduce heat!',
        hl:    { x: 920, y: 30, w: 200, h: 100 },
    },
    {
        title: 'Resource Progress Bars',
        body:  'You need three types of resources to launch the rocket:\n⚡ Electricity   🛢️ Fuel   🔩 Titanium\n\nFill all three bars to win. The more you fill in 45 seconds, the more stars you earn.',
        hl:    { x: 920, y: 130, w: 200, h: 130 },
    },
    {
        title: 'Combo Effects',
        body:  'Certain card combinations create powerful synergies!\n\n⚡ + 🚀 Boost → 2× electricity speed\n🛢️ + 🚀 Boost → 2× fuel output\n⚡ + ☀️ Solar → +3 bonus electricity\n❄️ + hot card → extra −8 heat\n\nProcess them in the same session for the bonus.',
        hl:    { x: 920, y: 290, w: 200, h: 180 },
    },
    {
        title: 'Timer & Star Rating',
        body:  'You have 45 seconds per level.\n\nThe bar at the top counts down. When it hits zero your progress is rated:\n\n★★★  All resources full\n★★    Good progress\n★      Minimum threshold\n✗       Below minimum → FAIL',
        hl:    { x: 512, y: 22, w: 240, h: 28 },
    },
    {
        title: 'Power Unlock',
        body:  'Earn enough points and you can unlock POWER MODE.\n\nThis opens 3 processing slots so you can run multiple cards at once — great for combos!\n\nClick the unlock button near the machine when you have enough stars.',
        hl:    { x: 512, y: 460, w: 240, h: 50 },
    },
    {
        title: 'Random Events',
        body:  'Watch out — random events can strike during a mission!\n\n☄️ Meteor Shower — instant heat spike\n🌞 Solar Flare — heat builds 2× faster for a few seconds\n⚠️ System Glitch — processing freezes briefly\n\nReact fast and keep the reactor cool!',
        hl:    null,
    },
    {
        title: 'Ready to Launch?',
        body:  "That's everything you need to know.\n\nGood luck, engineer. The galaxy is counting on you!\n\nPress START to begin your first mission.",
        hl:    null,
    },
];

export class Tutorial extends Scene {
    private step = 0;
    private overlay:   Phaser.GameObjects.Graphics;
    private panel:     Phaser.GameObjects.Container;
    private titleTxt:  Phaser.GameObjects.Text;
    private bodyTxt:   Phaser.GameObjects.Text;
    private stepLabel: Phaser.GameObjects.Text;

    constructor() { super('Tutorial'); }

    create() {
        // ── Static game-screen replica (non-interactive backdrop) ──────────
        this.add.image(512, 384, 'background').setAlpha(0.55);
        VFX.ambientParticles(this);

        // Timer bar mock
        this.add.rectangle(512, 18, 220, 14, 0x333333);
        this.add.rectangle(512 - 110, 18, 220, 14, 0x22cc88).setOrigin(0, 0.5);
        this.add.text(512, 32, '45s', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0);

        // Heat bar mock
        this.add.text(832, 6,  '🔥 HEAT',        { fontSize: '11px', color: '#ff6644', fontStyle: 'bold' });
        this.add.rectangle(922, 20, 180, 16, 0x333333);
        this.add.rectangle(832, 20, 60,  16, 0xff4400).setOrigin(0, 0.5);
        this.add.text(922, 20, '12 / 100',        { fontSize: '10px', color: '#fff' }).setOrigin(0.5);

        // Resource bars mock
        const resBars = [
            { icon: '⚡', label: 'ELECTRICITY', color: 0xffff44, fill: 0.4 },
            { icon: '🛢️', label: 'FUEL',        color: 0xff8800, fill: 0.2 },
            { icon: '🔩', label: 'TITANIUM',    color: 0x88aacc, fill: 0.6 },
        ];
        resBars.forEach(({ icon, label, color, fill }, i) => {
            const y = 56 + i * 36;
            this.add.text(832, y - 14, `${icon} ${label}`, { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' });
            this.add.rectangle(922, y, 180, 16, 0x333333);
            this.add.rectangle(832, y, 180 * fill, 16, color).setOrigin(0, 0.5);
        });

        // Combo panel mock
        this.add.rectangle(922, 267, 188, 164, 0x0a1020, 0.85).setStrokeStyle(1, 0x334466);
        this.add.text(922, 183, '✨ COMBOS', { fontSize: '10px', color: '#aaccff', fontStyle: 'bold' }).setOrigin(0.5, 0);
        [
            ['⚡ + 🚀 Boost', '→ x2 electricity speed'],
            ['🛢️ + 🚀 Boost', '→ x2 fuel output'],
            ['⚡ + ☀️ Solar',  '→ +3 bonus electricity'],
            ['❄️ + 🔥 any hot','→ extra −8 heat'],
            ['🔩 + 🚀 Boost', '→ x2 titanium output'],
        ].forEach(([lbl, eff], i) => {
            const cy = 198 + i * 30;
            this.add.text(835, cy,      lbl, { fontSize: '10px', color: '#ddddff' });
            this.add.text(835, cy + 12, eff, { fontSize: '9px',  color: '#88ccaa' });
        });

        // Machine mock
        this.add.sprite(512, 360, 'machine1').setDisplaySize(240, 240).setAlpha(0.7);

        // Processing slot mock
        this.add.rectangle(130, 200, 230, 68, 0x080f18).setStrokeStyle(2, 0x22cc88).setAlpha(0.8);
        this.add.text(20, 175, 'Fuel Cell', { fontSize: '12px', color: '#fff', fontStyle: 'bold' });
        this.add.text(20, 190, '🔥+8  🛢️+3  ⭐+12', { fontSize: '10px', color: '#ffcc00' });
        this.add.rectangle(130, 232, 206, 9, 0x1a2a3a);
        this.add.rectangle(24,  232, 120, 9, 0x22cc88).setOrigin(0, 0.5);

        // Card hand mock
        const cardY = 658;
        ['electricity', 'fuel', 'titanium', 'cool'].forEach((key, i) => {
            const cx = 362 + i * 150;
            this.add.image(cx, cardY, key).setDisplaySize(130, 190).setAlpha(0.85);
        });

        // Unlock button mock
        this.add.rectangle(512, 460, 230, 42, 0x1a0a2e).setStrokeStyle(2, 0xaa44ff).setAlpha(0.9);
        this.add.text(512, 460, '⚡ POWER UNLOCK  (20 ⭐)', { fontSize: '12px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(0.5);

        // ── Dark overlay (punched out around highlight) ────────────────────
        this.overlay = this.add.graphics().setDepth(20);

        // ── Explanation panel ──────────────────────────────────────────────
        const PANEL_W = 420;
        const PANEL_H = 220;
        const PANEL_X = 512;
        const PANEL_Y = 384;

        const panelBg = this.add.rectangle(0, 0, PANEL_W, PANEL_H, 0x000000, 0.92)
            .setStrokeStyle(2, 0x4488ff);
        this.titleTxt = this.add.text(0, -PANEL_H / 2 + 18, '', {
            fontSize: '17px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3, align: 'center',
            wordWrap: { width: PANEL_W - 24 },
        }).setOrigin(0.5, 0);
        this.bodyTxt = this.add.text(0, -PANEL_H / 2 + 48, '', {
            fontSize: '12px', color: '#cccccc', align: 'center',
            wordWrap: { width: PANEL_W - 28 },
            lineSpacing: 4,
        }).setOrigin(0.5, 0);

        // Next button
        const nextBg  = this.add.rectangle(PANEL_W / 2 - 60, PANEL_H / 2 - 22, 110, 34, 0x1144aa)
            .setStrokeStyle(1, 0x4488ff).setInteractive({ useHandCursor: true });
        const nextTxt = this.add.text(PANEL_W / 2 - 60, PANEL_H / 2 - 22, 'NEXT →', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        // Skip button
        const skipBg  = this.add.rectangle(-PANEL_W / 2 + 55, PANEL_H / 2 - 22, 90, 34, 0x222222)
            .setStrokeStyle(1, 0x555555).setInteractive({ useHandCursor: true });
        const skipTxt = this.add.text(-PANEL_W / 2 + 55, PANEL_H / 2 - 22, 'SKIP', {
            fontSize: '13px', color: '#888888',
        }).setOrigin(0.5);

        this.stepLabel = this.add.text(0, PANEL_H / 2 - 22, '', {
            fontSize: '11px', color: '#556677',
        }).setOrigin(0.5);

        this.panel = this.add.container(PANEL_X, PANEL_Y, [
            panelBg, this.titleTxt, this.bodyTxt,
            nextBg, nextTxt, skipBg, skipTxt, this.stepLabel,
        ]).setDepth(30);

        nextBg.on('pointerover', () => nextBg.setFillStyle(0x2255cc));
        nextBg.on('pointerout',  () => nextBg.setFillStyle(0x1144aa));
        nextBg.on('pointerdown', () => this.advance());

        skipBg.on('pointerover', () => skipBg.setFillStyle(0x333333));
        skipBg.on('pointerout',  () => skipBg.setFillStyle(0x222222));
        skipBg.on('pointerdown', () => this.scene.start('MainMenu'));

        this.step = 0;
        this.showStep();
    }

    private showStep() {
        const s = STEPS[this.step];
        const isLast = this.step === STEPS.length - 1;

        this.titleTxt.setText(s.title);
        this.bodyTxt.setText(s.body);
        this.stepLabel.setText(`${this.step + 1} / ${STEPS.length}`);

        // Update next button label on last step
        const nextTxt = this.panel.getAt(4) as Phaser.GameObjects.Text;
        nextTxt.setText(isLast ? 'START ▶' : 'NEXT →');

        // Reposition panel: push it down if highlight is in the top half, else up
        const hl = s.hl;
        if (hl && hl.y < 400) {
            this.panel.setPosition(512, 580);
        } else if (hl && hl.y > 500) {
            this.panel.setPosition(512, 220);
        } else {
            this.panel.setPosition(512, 384);
        }

        // Redraw overlay
        this.overlay.clear();
        // Full dark rectangle
        this.overlay.fillStyle(0x000000, 0.65);
        this.overlay.fillRect(0, 0, 1024, 768);

        if (hl) {
            // Cut out highlight by overdrawing with full alpha 0 (erase isn't available,
            // so we draw a bright border ring instead to frame the area)
            this.overlay.fillStyle(0x000000, 0);
            this.overlay.fillRect(hl.x - hl.w / 2, hl.y - hl.h / 2, hl.w, hl.h);
            this.overlay.lineStyle(3, 0x4488ff, 1);
            this.overlay.strokeRect(hl.x - hl.w / 2 - 2, hl.y - hl.h / 2 - 2, hl.w + 4, hl.h + 4);
        }

        // Animate panel pop-in
        this.panel.setScale(0.88).setAlpha(0);
        this.tweens.add({ targets: this.panel, scaleX: 1, scaleY: 1, alpha: 1, duration: 220, ease: 'Back.Out' });
    }

    private advance() {
        if (this.step >= STEPS.length - 1) {
            this.scene.start('MainMenu');
            return;
        }
        this.step++;
        this.showStep();
    }
}

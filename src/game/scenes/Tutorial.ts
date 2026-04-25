import { Scene } from 'phaser';
import { VFX } from '../vfx/VFX';

interface TutorialStep {
    title: string;
    body:  string;
    hl:    { x: number; y: number; w: number; h: number } | null;
}

const STEPS: TutorialStep[] = [
    {
        title: 'Welcome to Sasa Spaces!',
        body:  'You are the chief engineer of a deep-space rocket factory.\n\nProcess resource cards to fill your ship\'s requirements — Electricity, Fuel, and Titanium — before time runs out.\n\nLaunch 3 ships to win with 3 stars!',
        hl:    null,
    },
    {
        title: 'Objective',
        body:  'Fill all three resource bars to launch one spaceship.\nLaunch 3 ships before the timer expires.\n\n★★★  All 3 ships launched\n★★    2 ships launched\n★      1 ship launched\n✗       0 ships → MISSION FAILED',
        hl:    { x: 920, y: 200, w: 200, h: 250 },
    },
    {
        title: 'Your Hand',
        body:  'Three cards are dealt to you at the bottom.\n\nEach card shows:\n• Resource type it produces\n• Heat it generates\n• Processing time\n• Point value\n\nDrag a card up to the machine to process it.',
        hl:    { x: 512, y: 660, w: 700, h: 140 },
    },
    {
        title: 'The Machine',
        body:  'Drop a card onto the glowing machine in the centre to begin processing it.\n\nThe machine animates while working and advances through 4 upgrade stages as you complete more resources.\n\nYou start with 1 processing slot.',
        hl:    { x: 512, y: 360, w: 260, h: 260 },
    },
    {
        title: 'Processing Slots',
        body:  'Each active card gets its own slot on the left showing the card name, stats, and a progress bar.\n\nWhen the bar empties, resources are added to your stock and the card is finished.\n\nUnlock Power Mode to run up to 3 cards at once!',
        hl:    { x: 130, y: 260, w: 250, h: 200 },
    },
    {
        title: '⚡ Electricity Card',
        body:  'Processes in 1s • No heat • +3 Electricity • 5 pts\n\nFastest card in the game. Generates no heat so it\'s safe to spam early on.\n\nCombo: pair with Solar or Boost for bonus electricity.',
        hl:    { x: 365, y: 660, w: 140, h: 140 },
    },
    {
        title: '🛢️ Fuel Cell Card',
        body:  'Processes in 2s • +5 heat • +3 Fuel • 1 pt\n\nCore fuel source but adds heat. Use Coolant between runs to keep the reactor safe.\n\nCombo: pair with Boost to double fuel output.',
        hl:    { x: 512, y: 660, w: 140, h: 140 },
    },
    {
        title: '🔩 Titanium Card',
        body:  'Processes in 2s • +5 heat • +4 Titanium • 2 pts\n\nHighest resource value per card. Generates heat like Fuel.\n\nCombo: pair with Boost to double titanium output.',
        hl:    { x: 660, y: 660, w: 140, h: 140 },
    },
    {
        title: '❄️ Coolant Card',
        body:  'Processes in 5s • −25 heat • No resources • 0 pts\n\nSlow but essential. Drops heat by 25 points.\n\nCombo: process alongside any hot card (Fuel, Boost, Titanium) to trigger the CRYO COMBO for an extra −8 heat on top.',
        hl:    { x: 810, y: 660, w: 140, h: 140 },
    },
    {
        title: '🚀 Booster Card',
        body:  'Processes in 2s • No heat • No direct resource • 0 pts\n\nDoesn\'t produce resources on its own but triggers powerful BOOST COMBOs.\n\nProcess it alongside Electricity, Fuel, or Titanium to grant a free bonus copy of that resource instantly.',
        hl:    { x: 365, y: 660, w: 140, h: 140 },
    },
    {
        title: '☀️ Solar Panel Card',
        body:  'Processes in 2s • No heat • No direct resource • 5 pts\n\nPure combo card. By itself it does nothing special.\n\nSOLAR COMBO: process it alongside an Electricity card to award +3 bonus electricity on top of the normal output.',
        hl:    { x: 512, y: 660, w: 140, h: 140 },
    },
    {
        title: '🔭 Monitor Card',
        body:  'Processes in 0.5s • No heat • No resources • 0 pts\n\nLightest card in the deck. Completes almost instantly.\n\nReveals your next upcoming card so you can plan your strategy ahead of time.',
        hl:    { x: 660, y: 660, w: 140, h: 140 },
    },
    {
        title: '🔥 Heat Bar',
        body:  'The reactor heats up every second passively, and faster when processing Fuel or Titanium.\n\nIf heat reaches MAX — instant mission failure regardless of your progress!\n\nKeep it low with Coolant cards and avoid stacking hot cards at the same time.',
        hl:    { x: 920, y: 30, w: 200, h: 60 },
    },
    {
        title: '✨ Combo System',
        body:  'Run compatible cards in the same session for bonus effects:\n\n🚀+⚡  Boost+Electric   → free +Electricity\n🚀+🛢️  Boost+Fuel       → free +Fuel\n🚀+🔩  Boost+Titanium   → free +Titanium\n☀️+⚡  Solar+Electric   → +3 bonus electricity\n❄️+any hot card       → extra −8 heat',
        hl:    { x: 920, y: 285, w: 200, h: 200 },
    },
    {
        title: '⚡ Power Mode',
        body:  'Earn 20 points to unlock POWER MODE.\n\nThis opens 2 extra processing slots (3 total) so you can run multiple cards simultaneously — essential for triggering combos and clearing resources fast.\n\nCosts are reset between ships so keep earning points!',
        hl:    { x: 512, y: 460, w: 250, h: 50 },
    },
    {
        title: '⏱️ Timer',
        body:  'The bar at the top counts down the mission time.\n\nIt turns yellow then red as time runs short.\n\nCombo bonuses award +3 seconds each — chain combos to buy yourself more time!\n\nIf the timer hits zero, your current ship count is rated.',
        hl:    { x: 512, y: 22, w: 240, h: 28 },
    },
    {
        title: '⚠️ Random Events',
        body:  'From level 3 onwards, random events can strike mid-mission:\n\n☄️ Meteor Shower (L3+) — instant heat spike, react fast!\n🌞 Solar Flare (L5+) — heat builds 2× faster for 6s\n⚠️ System Glitch (L7+) — all processing freezes for 4s\n\nA warning banner flashes when an event hits. Keep Coolant ready!',
        hl:    null,
    },
    {
        title: 'Ready to Launch?',
        body:  'That\'s everything, engineer!\n\n• Process cards → fill 3 resource bars\n• Launch ship → repeat up to 3 times\n• Manage heat or it\'s mission failure\n• Combo cards for bonuses & extra time\n\nGood luck. The galaxy is counting on you!',
        hl:    null,
    },
];

export class Tutorial extends Scene {
    private step       = 0;
    private overlay:   Phaser.GameObjects.Graphics;
    private panel:     Phaser.GameObjects.Container;
    private titleTxt:  Phaser.GameObjects.Text;
    private bodyTxt:   Phaser.GameObjects.Text;
    private stepLabel: Phaser.GameObjects.Text;
    private nextTxt:   Phaser.GameObjects.Text;

    constructor() { super('Tutorial'); }

    create() {
        // ── Game screen replica (matches Game.ts layout exactly) ───────────
        this.add.image(512, 384, 'background');
        VFX.ambientParticles(this);

        // Back button area (visual only)
        this.add.image(100, 64, 'back_button').setDisplaySize(140, 60).setAlpha(0.5);

        // Settings button (visual only)
        this.add.image(990, 720, 'setting_button').setDisplaySize(50, 50).setAlpha(0.5);

        // Timer bar
        const TIMER_W = 220;
        this.add.rectangle(512, 18, TIMER_W, 14, 0x222222).setDepth(8);
        this.add.rectangle(512 - TIMER_W / 2, 18, TIMER_W, 14, 0x22cc88).setOrigin(0, 0.5).setDepth(9);
        this.add.text(512, 32, '60s', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5, 0).setDepth(10);

        // Ship counter
        this.add.text(502, 57, '0 / 3', { fontSize: '13px', color: '#555555', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0, 0.5).setDepth(10);

        // Heat bar (top-right) — matches HUDBars.ts BAR_X=828
        const BAR_X = 828; const BAR_W = 180; const BAR_H = 20;
        this.add.text(BAR_X, 12, '🔥 HEAT', { fontSize: '13px', color: '#ff6644', fontStyle: 'bold' }).setDepth(8);
        this.add.rectangle(BAR_X + BAR_W / 2, 44, BAR_W, BAR_H, 0x222222).setDepth(8);
        this.add.rectangle(BAR_X, 44, BAR_W * 0.3, BAR_H, 0xff2222).setOrigin(0, 0.5).setDepth(9);
        this.add.text(BAR_X + BAR_W / 2, 44, '36 / 120', { fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5).setDepth(10);

        // Resource bars
        const resData = [
            { icon: '⚡', label: 'ELECTRICITY', color: 0xaa44ff, fill: 0.45, y: 110 },
            { icon: '◉',  label: 'FUEL',        color: 0xff8800, fill: 0.25, y: 166 },
            { icon: '◆',  label: 'TITANIUM',    color: 0x88aacc, fill: 0.6,  y: 222 },
        ];
        resData.forEach(({ icon, label, color, fill, y }) => {
            this.add.image(BAR_X + 10, y - 32, `${label.toLowerCase()}_t1`).setDisplaySize(20, 28).setDepth(8).setOrigin(0.5);
            this.add.text(BAR_X + 24, y - 32, `${icon} ${label}`, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setDepth(8).setOrigin(0, 0.5);
            this.add.rectangle(BAR_X + BAR_W / 2, y, BAR_W, BAR_H, 0x222222).setDepth(8);
            this.add.rectangle(BAR_X, y, BAR_W * fill, BAR_H, color).setOrigin(0, 0.5).setDepth(9);
            this.add.text(BAR_X + BAR_W / 2, y, `${Math.round(fill * 3)} / 3`, { fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5).setDepth(10);
        });

        // Combo panel (matches ComboPanel.ts positioning)
        this.add.rectangle(922, 370, 188, 164, 0x0a1020, 0.85).setStrokeStyle(1, 0x334466).setDepth(8);
        this.add.text(922, 290, '✨ COMBOS', { fontSize: '11px', color: '#aaccff', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(9);
        [
            ['🚀 + ⚡ Boost+Electric', '→ free +Electricity'],
            ['🚀 + 🛢️ Boost+Fuel',    '→ free +Fuel'],
            ['🚀 + 🔩 Boost+Titanium','→ free +Titanium'],
            ['☀️ + ⚡ Solar+Electric', '→ +3 bonus elec'],
            ['❄️ + 🔥 Cryo+Hot',      '→ extra −8 heat'],
        ].forEach(([lbl, eff], i) => {
            const cy = 305 + i * 30;
            this.add.text(836, cy,      lbl, { fontSize: '10px', color: '#ddddff' }).setDepth(9);
            this.add.text(836, cy + 13, eff, { fontSize: '9px',  color: '#88ccaa' }).setDepth(9);
        });

        // Machine
        const machineSprite = this.add.sprite(512, 360, 'machine1').setDisplaySize(240, 240).setDepth(1);
        try { machineSprite.play('machine_run'); } catch {}

        // Processing slot mock (left side)
        this.add.rectangle(130, 200, 230, 68, 0x080f18).setStrokeStyle(2, 0x22cc88).setDepth(8);
        this.add.text(20, 177, 'Fuel Cell', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setDepth(9);
        this.add.text(20, 193, '🔥+5  🛢️+3  ⭐+1', { fontSize: '10px', color: '#ffcc00' }).setDepth(9);
        this.add.rectangle(130, 232, 206, 9, 0x1a2a3a).setDepth(8);
        this.add.rectangle(24,  232, 120, 9, 0x22cc88).setOrigin(0, 0.5).setDepth(9);

        // Power unlock button mock
        this.add.rectangle(512, 460, 240, 42, 0x1a0a2e).setStrokeStyle(2, 0xaa44ff).setDepth(8);
        this.add.text(512, 460, '⚡ POWER UNLOCK  (20 ⭐)', { fontSize: '12px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);

        // Card hand mock — 3 cards matching HAND_SIZE
        const cardKeys = ['electricity', 'fuel', 'titanium'];
        const handStartX = 512 - (cardKeys.length - 1) * 150 / 2;
        cardKeys.forEach((key, i) => {
            const cx = handStartX + i * 150;
            this.add.image(cx, 660, `${key}_t1`).setDisplaySize(130, 190).setAlpha(0.9).setDepth(5);
        });

        // ── Dark overlay (cutout highlight) ───────────────────────────────
        this.overlay = this.add.graphics().setDepth(20);

        // ── Explanation panel ─────────────────────────────────────────────
        const PANEL_W = 460;
        const PANEL_H = 260;

        const panelBg = this.add.rectangle(0, 0, PANEL_W, PANEL_H, 0x050d18, 0.95)
            .setStrokeStyle(2, 0x4488ff);

        this.titleTxt = this.add.text(0, -PANEL_H / 2 + 18, '', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3, align: 'center',
            wordWrap: { width: PANEL_W - 28 },
        }).setOrigin(0.5, 0);

        this.bodyTxt = this.add.text(0, -PANEL_H / 2 + 50, '', {
            fontSize: '12px', color: '#cccccc', align: 'left',
            wordWrap: { width: PANEL_W - 32 },
            lineSpacing: 5,
        }).setOrigin(0.5, 0);

        // Next button
        const nextBg = this.add.rectangle(PANEL_W / 2 - 65, PANEL_H / 2 - 22, 120, 36, 0x1144aa)
            .setStrokeStyle(1, 0x4488ff).setInteractive({ useHandCursor: true });
        this.nextTxt = this.add.text(PANEL_W / 2 - 65, PANEL_H / 2 - 22, 'NEXT →', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        // Skip button
        const skipBg = this.add.rectangle(-PANEL_W / 2 + 55, PANEL_H / 2 - 22, 90, 36, 0x1a1a1a)
            .setStrokeStyle(1, 0x444444).setInteractive({ useHandCursor: true });
        this.add.text(-PANEL_W / 2 + 55, PANEL_H / 2 - 22, 'SKIP', {
            fontSize: '13px', color: '#666666',
        }).setOrigin(0.5);

        this.stepLabel = this.add.text(0, PANEL_H / 2 - 22, '', {
            fontSize: '11px', color: '#445566',
        }).setOrigin(0.5);

        this.panel = this.add.container(512, 384, [
            panelBg, this.titleTxt, this.bodyTxt,
            nextBg, this.nextTxt, skipBg,
            this.add.text(-PANEL_W / 2 + 55, PANEL_H / 2 - 22, 'SKIP', { fontSize: '13px', color: '#666666' }).setOrigin(0.5),
            this.stepLabel,
        ]).setDepth(30);

        nextBg.on('pointerover', () => nextBg.setFillStyle(0x2255cc))
              .on('pointerout',  () => nextBg.setFillStyle(0x1144aa))
              .on('pointerdown', () => this.advance());

        skipBg.on('pointerover', () => skipBg.setFillStyle(0x2a2a2a))
              .on('pointerout',  () => skipBg.setFillStyle(0x1a1a1a))
              .on('pointerdown', () => this.scene.start('MainMenu'));

        this.step = 0;
        this.showStep();
    }

    private showStep() {
        const s      = STEPS[this.step];
        const isLast = this.step === STEPS.length - 1;

        this.titleTxt.setText(s.title);
        this.bodyTxt.setText(s.body);
        this.stepLabel.setText(`${this.step + 1} / ${STEPS.length}`);
        this.nextTxt.setText(isLast ? 'START ▶' : 'NEXT →');

        // Position panel away from highlight area
        const hl = s.hl;
        let panelY = 384;
        if (hl) {
            if (hl.y < 350) panelY = Math.min(620, hl.y + hl.h / 2 + 160);
            else            panelY = Math.max(150, hl.y - hl.h / 2 - 160);
        }
        this.panel.setPosition(512, panelY);

        // Overlay with highlight cutout
        this.overlay.clear();
        this.overlay.fillStyle(0x000000, 0.68);
        this.overlay.fillRect(0, 0, 1024, 768);

        if (hl) {
            // Bright border ring to frame the highlighted area
            this.overlay.lineStyle(3, 0x4488ff, 1);
            this.overlay.strokeRect(hl.x - hl.w / 2 - 3, hl.y - hl.h / 2 - 3, hl.w + 6, hl.h + 6);
            // Corner accents
            const cx = hl.x - hl.w / 2 - 3, cy = hl.y - hl.h / 2 - 3;
            const cw = hl.w + 6,             ch = hl.h + 6;
            this.overlay.lineStyle(3, 0x88ccff, 1);
            [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]].forEach(([ox, oy]) => {
                this.overlay.strokeRect(ox - 5, oy - 5, 10, 10);
            });
        }

        // Panel pop-in animation
        this.panel.setScale(0.9).setAlpha(0);
        this.tweens.add({ targets: this.panel, scaleX: 1, scaleY: 1, alpha: 1, duration: 200, ease: 'Back.Out' });
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

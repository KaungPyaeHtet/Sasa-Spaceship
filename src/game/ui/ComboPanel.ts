import { Scene } from 'phaser';
import { BAR_W, BAR_X } from './HUDBars';

const COMBOS: { card1: string; card2: string; effect: string }[] = [
    { card1: 'electricity_t1', card2: 'boost_t1',  effect: 'x2 electricity speed' },
    { card1: 'fuel_t1',        card2: 'boost_t1',  effect: 'x2 fuel output'       },
    { card1: 'electricity_t1', card2: 'solar_t1',  effect: '+3 bonus electricity'  },
    { card1: 'cool_t1',        card2: 'fuel_t1',   effect: 'extra -8 heat'         },
    { card1: 'titanium_t1',    card2: 'boost_t1',  effect: 'x2 titanium output'   },
];

const PANEL_W  = 226;
const CARD_W   = 44;
const CARD_H   = 62;
const ROW_H    = 76;
const PANEL_X  = BAR_X + BAR_W / 2;  // centre same as bars

export function buildComboPanel(scene: Scene) {
    const panelY = 260;
    const panelH = 28 + COMBOS.length * ROW_H + 8;

    const panel = scene.add.container(0, 0).setDepth(20).setAlpha(0).setVisible(false);

    const bg = scene.add.rectangle(PANEL_X, panelY + panelH / 2, PANEL_W, panelH, 0x08111e, 0.97)
        .setStrokeStyle(1, 0x2a4466);
    panel.add(bg);

    panel.add(scene.add.text(PANEL_X, panelY + 10, 'COMBOS', {
        fontSize: '13px', color: '#aaccff', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5, 0));

    const LEFT = BAR_X + (PANEL_W - BAR_W) / 2 - 8;  // left edge of panel content

    COMBOS.forEach((c, i) => {
        const cy = panelY + 28 + i * ROW_H + ROW_H / 2;

        // Card 1
        panel.add(scene.add.image(LEFT + CARD_W / 2, cy, c.card1).setDisplaySize(CARD_W, CARD_H));

        // "+"
        panel.add(scene.add.text(LEFT + CARD_W + 5, cy, '+', {
            fontSize: '16px', color: '#888888',
        }).setOrigin(0, 0.5));

        // Card 2
        panel.add(scene.add.image(LEFT + CARD_W + 18 + CARD_W / 2, cy, c.card2).setDisplaySize(CARD_W, CARD_H));

        // Arrow + effect
        panel.add(scene.add.text(LEFT + CARD_W * 2 + 26, cy - 8, `→ ${c.effect}`, {
            fontSize: '11px', color: '#88ddaa',
            wordWrap: { width: 92 },
            lineSpacing: 2,
        }).setOrigin(0, 0.5));
    });

    // ── ? toggle button ───────────────────────────────────────────────────────
    let open = false;
    const btnX = BAR_X + BAR_W - 10;
    const btnY = panelY - 14;

    const btnBg  = scene.add.circle(btnX, btnY, 11, 0x223355).setDepth(21).setInteractive({ useHandCursor: true });
    const btnTxt = scene.add.text(btnX, btnY, '?', {
        fontSize: '14px', color: '#aaccff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22);

    const toggle = () => {
        open = !open;
        panel.setVisible(open);
        scene.tweens.add({ targets: panel, alpha: open ? 1 : 0, duration: 150 });
        btnBg.setFillStyle(open ? 0x334488 : 0x223355);
        btnTxt.setColor(open ? '#ffffff' : '#aaccff');
    };

    btnBg
        .on('pointerdown', toggle)
        .on('pointerover', () => btnBg.setFillStyle(0x334488))
        .on('pointerout',  () => btnBg.setFillStyle(open ? 0x334488 : 0x223355));
}

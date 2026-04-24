export interface GameEvent {
    key:        string;
    name:       string;
    icon:       string;
    desc:       string;
    color:      number;
    duration:   number;  // seconds the effect lasts
    minLevel:   number;  // first level this can appear
}

export const RANDOM_EVENTS: GameEvent[] = [
    {
        key:      'meteor_shower',
        name:     'Meteor Shower',
        icon:     '☄️',
        desc:     'Impact tremors spike reactor heat!',
        color:    0xff4400,
        duration: 5,
        minLevel: 3,
    },
    {
        key:      'solar_flare',
        name:     'Solar Flare',
        icon:     '🌞',
        desc:     'Solar radiation doubles heat build-up!',
        color:    0xffcc00,
        duration: 6,
        minLevel: 5,
    },
    {
        key:      'system_glitch',
        name:     'System Glitch',
        icon:     '⚠️',
        desc:     'Processing systems malfunction!',
        color:    0x44aaff,
        duration: 4,
        minLevel: 7,
    },
];

export type ResourceType = 'electricity' | 'fuel' | 'titanium' | null;

export type Card = {
    id: string;
    name: string;
    imageKey: string;
    duration: number;        // seconds to process
    heat: number;            // heat delta (negative = cooling)
    resource: ResourceType;  // which component this card builds
    resourceAmount: number;  // how much resource it contributes
    points: number;
    description: string;
};

export const cardDefinitions: Card[] = [
    // Electricity common resource card
    {
        id: 'electricity',
        name: 'Electric',
        imageKey: 'electricity',
        duration: 2,
        heat: 0,
        resource: 'electricity',
        resourceAmount: 3,
        points: 2,
        description: 'Increases electricity stat',
    },
    // Solar should be purely power effect card
    {
        id: 'solar',
        name: 'Solar Panel',
        imageKey: 'solar',
        duration: 2,
        heat: 0,
        resource: 'electricity',
        resourceAmount: 0,
        points: 5,
        description: 'Charges the power',
    },
    // Fuel common resource card
    {
        id: 'fuel',
        name: 'Fuel Cell',
        imageKey: 'fuel',
        duration: 2,
        heat: 3,
        resource: 'fuel',
        resourceAmount: 4,
        points: 2,
        description: 'Increase fuel stat',
    },
    // Increase the rate of all other cards duration
    {
        id: 'boost',
        name: 'Booster',
        imageKey: 'boost',
        duration: 1,
        heat: 3,
        resource: 'fuel',
        resourceAmount: 0,
        points: 1,
        description: 'Decrease time for all cards',
    },
    // Titanium common card
    {
        id: 'titanium',
        name: 'Titanium',
        imageKey: 'titanium',
        duration: 3,
        heat: 3,
        resource: 'titanium',
        resourceAmount: 5,
        points: 2,
        description: 'Increase Titanium Stat',
    },
    // this should purely be cooling effect and should take time
    {
        id: 'cool',
        name: 'Coolant',
        imageKey: 'cool',
        duration: 3,
        heat: -35,
        resource: null,
        resourceAmount: 0,
        points: 1,
        description: 'Reduces heat by 35',
    },
    // Monitors the stats
    {
        id: 'monitor',
        name: 'Monitor',
        imageKey: 'monitor',
        duration: 0.5,
        heat: 0,
        resource: null,
        resourceAmount: 0,
        points: 1,
        description: 'Reveals stats & next card',
    },
];

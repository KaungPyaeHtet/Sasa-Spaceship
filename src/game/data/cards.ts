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
    {
        id: 'electricity',
        name: 'Electric',
        imageKey: 'electricity',
        duration: 2,
        heat: 5,
        resource: 'electricity',
        resourceAmount: 2,
        points: 8,
        description: 'Powers the engine',
    },
    {
        id: 'solar',
        name: 'Solar Panel',
        imageKey: 'solar',
        duration: 6,
        heat: 0,
        resource: 'electricity',
        resourceAmount: 3,
        points: 7,
        description: 'Clean electricity',
    },
    {
        id: 'fuel',
        name: 'Fuel Cell',
        imageKey: 'fuel',
        duration: 5,
        heat: 8,
        resource: 'fuel',
        resourceAmount: 3,
        points: 12,
        description: 'Propulsion fuel',
    },
    {
        id: 'boost',
        name: 'Booster',
        imageKey: 'boost',
        duration: 3,
        heat: 15,
        resource: 'fuel',
        resourceAmount: 5,
        points: 10,
        description: 'Fast but hot',
    },
    {
        id: 'titanium',
        name: 'Titanium',
        imageKey: 'titanium',
        duration: 4,
        heat: 3,
        resource: 'titanium',
        resourceAmount: 4,
        points: 15,
        description: 'Hull plating',
    },
    {
        id: 'cool',
        name: 'Coolant',
        imageKey: 'cool',
        duration: 4,
        heat: -10,
        resource: null,
        resourceAmount: 0,
        points: 5,
        description: 'Reduces heat',
    },
    {
        id: 'monitor',
        name: 'Monitor',
        imageKey: 'monitor',
        duration: 3,
        heat: 0,
        resource: null,
        resourceAmount: 0,
        points: 2,
        description: 'Reveals stats & next card',
    },
];

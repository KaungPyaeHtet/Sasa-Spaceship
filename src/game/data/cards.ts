export type Card = {
    id: string;
    name: string;
    imageKey: string;
    duration: number;   // seconds to process
    heat: number;       // heat delta when processed (negative = cooling)
    products: number;   // products generated
    points: number;     // score points
    description: string;
};

export const cardDefinitions: Card[] = [
    {
        id: 'boost',
        name: 'Booster',
        imageKey: 'boost',
        duration: 3,
        heat: 15,
        products: 3,
        points: 10,
        description: 'Fast but hot',
    },
    {
        id: 'cool',
        name: 'Coolant',
        imageKey: 'cool',
        duration: 4,
        heat: -10,
        products: 0,
        points: 5,
        description: 'Reduces heat',
    },
    {
        id: 'electricity',
        name: 'Electric',
        imageKey: 'electricity',
        duration: 2,
        heat: 5,
        products: 2,
        points: 8,
        description: 'Quick energy burst',
    },
    {
        id: 'fuel',
        name: 'Fuel Cell',
        imageKey: 'fuel',
        duration: 5,
        heat: 8,
        products: 4,
        points: 12,
        description: 'Steady output',
    },
    {
        id: 'solar',
        name: 'Solar Panel',
        imageKey: 'solar',
        duration: 6,
        heat: 0,
        products: 2,
        points: 7,
        description: 'Clean energy',
    },
    {
        id: 'titanium',
        name: 'Titanium',
        imageKey: 'titanium',
        duration: 4,
        heat: 3,
        products: 5,
        points: 15,
        description: 'Heavy production',
    },
];
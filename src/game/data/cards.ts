export type Card = {
    name: string;
    heat: number;
    products: number;
};

export const cards: Card[] = [
    { name: "Basic Worker", heat: 5,  products: 1 },
    { name: "Overclocked",  heat: 15, products: 3 },
];

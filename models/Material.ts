export type MaterialCategory = 'tiles' | 'wood' | 'paint' | 'wallpaper' | 'fabric' | 'other';

export interface Material {
    id: string;
    name: string;
    category: MaterialCategory;
    pricePerUnit: number;
    unit: string; // e.g., 'sqft', 'liter', 'roll', 'meter'
    color: string;
    image: string;
}

export type RoomType = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Bathroom' | 'Office' | 'Dining Room' | 'Other';
export type StyleTheme = 'Modern' | 'Minimalist' | 'Industrial' | 'Scandinavian' | 'Bohemian' | 'Classic' | 'Art Deco';
export type LightingType = 'Warm' | 'Cool' | 'Natural' | 'Accent' | 'Ambient';
export type FlooringType = 'Hardwood' | 'Marble' | 'Tiles' | 'Carpet' | 'Concrete' | 'Laminate';
export type WallFinish = 'Paint' | 'Wallpaper' | 'Exposed Brick' | 'Wood Paneling' | 'Stone' | 'Plaster';

export interface ARDesignParams {
    roomType: RoomType;
    styleTheme: StyleTheme;
    lighting: LightingType;
    flooring: FlooringType;
    wallFinish: WallFinish;
    ceilingHeight: number;        // in feet
    roomLength: number;           // in feet
    roomWidth: number;            // in feet
    colorPalette: string[];       // hex colours
    furnitureStyle: string;       // free text
    notes: string;
}

export interface Project {
    id: string;
    name: string;
    clientName: string;
    rooms: number;
    estimatedBudget: number;
    createdAt: string;
    dormantAt?: string;            // ISO date — after which project becomes dormant
    image?: string;
    status: 'planning' | 'in_progress' | 'completed' | 'dormant';
    arParams?: ARDesignParams;
}

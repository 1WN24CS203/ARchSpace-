export interface Project {
    id: string;
    name: string;
    clientName: string;
    rooms: number;
    estimatedBudget: number;
    createdAt: string;
    image?: string;
    status: 'planning' | 'in_progress' | 'completed';
}

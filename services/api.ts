import { Project } from '../models/Project';
import { Material } from '../models/Material';

export const getProjects = async (): Promise<Project[]> => {
    return []; // Return empty array for a fresh state
};

export const getMaterials = async (): Promise<Material[]> => {
    return []; // Return empty array for a fresh state
};

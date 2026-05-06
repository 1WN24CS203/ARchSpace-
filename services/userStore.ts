import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Project } from '@/models/Project';

export type AuthUser = {
  email: string;
  displayName?: string | null;
};

export type UserProfile = {
  displayName?: string | null;
};

const AUTH_USER_KEY = 'archspace:authUser';

function profileKey(email: string) {
  return `archspace:profile:${email}`;
}

function projectsKey(email: string) {
  return `archspace:projects:${email}`;
}

export async function getStoredAuthUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function setStoredAuthUser(user: AuthUser | null): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(profileKey(email));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function setUserProfile(email: string, profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(profileKey(email), JSON.stringify(profile));
}

export async function getUserProjects(email: string): Promise<Project[]> {
  const raw = await AsyncStorage.getItem(projectsKey(email));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Project[];
  } catch {
    return [];
  }
}

export async function setUserProjects(email: string, projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(projectsKey(email), JSON.stringify(projects));
}

export async function addUserProject(email: string, project: Project): Promise<Project[]> {
  const existing = await getUserProjects(email);
  const next = [project, ...existing];
  await setUserProjects(email, next);
  return next;
}

// ── GLB / GLTF model assets per project ────────────────────────────────────
export type ModelAsset = {
  id: string;
  name: string;
  uri: string;        // local file:// URI copied to cache
  size?: number;      // bytes
  addedAt: string;
};

function modelsKey(email: string, projectId: string) {
  return `archspace:models:${email}:${projectId}`;
}

export async function getProjectModels(email: string, projectId: string): Promise<ModelAsset[]> {
  const raw = await AsyncStorage.getItem(modelsKey(email, projectId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ModelAsset[]) : [];
  } catch { return []; }
}

export async function setProjectModels(email: string, projectId: string, models: ModelAsset[]): Promise<void> {
  await AsyncStorage.setItem(modelsKey(email, projectId), JSON.stringify(models));
}

export async function addProjectModel(email: string, projectId: string, model: ModelAsset): Promise<ModelAsset[]> {
  const existing = await getProjectModels(email, projectId);
  const next = [model, ...existing];
  await setProjectModels(email, projectId, next);
  return next;
}

// ── User Avatar (local URI stored per device) ─────────────────────────────────
function avatarKey(email: string) {
  return `archspace:avatar:${email}`;
}

export async function getUserAvatar(email: string): Promise<string | null> {
  return AsyncStorage.getItem(avatarKey(email));
}

export async function setUserAvatar(email: string, uri: string | null): Promise<void> {
  if (!uri) {
    await AsyncStorage.removeItem(avatarKey(email));
  } else {
    await AsyncStorage.setItem(avatarKey(email), uri);
  }
}

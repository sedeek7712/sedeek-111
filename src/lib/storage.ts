import { Material, Project } from "./types";
import { DEFAULT_MATERIALS } from "./constants";

const PROJECTS_KEY = "smartboq_projects";
const MATERIALS_KEY = "smartboq_materials";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function getMaterials(): Material[] {
  if (typeof window === "undefined") return DEFAULT_MATERIALS;
  const data = localStorage.getItem(MATERIALS_KEY);
  if (!data) {
    saveMaterials(DEFAULT_MATERIALS);
    return DEFAULT_MATERIALS;
  }
  return JSON.parse(data);
}

export function saveMaterials(materials: Material[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

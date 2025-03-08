/**
 * File storage service for persisting generated files to local storage
 */

import { GeneratedFile } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Local storage key
const STORAGE_KEY = "ui-vis-generated-files";

// Maximum number of projects to store
const MAX_PROJECTS = 50;

interface StoredProject {
  id: string;
  name: string;
  timestamp: number;
  description?: string;
  files: GeneratedFile[];
  metadata: {
    provider: string;
    model: string;
    analysisId?: string;
  };
}

/**
 * Save generated files as a project to local storage
 * @param files Array of generated files
 * @param projectName Name of the project
 * @param description Optional project description
 * @param metadata Provider and model information
 * @returns The stored project
 */
export function saveFilesToLocalStorage(
  files: GeneratedFile[],
  projectName: string,
  description?: string,
  metadata?: {
    provider: string;
    model: string;
    analysisId?: string;
  }
): StoredProject {
  // Get existing projects
  const projects = getStoredProjects();
  
  // Create new project
  const newProject: StoredProject = {
    id: uuidv4(),
    name: projectName,
    description,
    timestamp: Date.now(),
    files,
    metadata: metadata || {
      provider: "unknown",
      model: "unknown"
    }
  };
  
  // Add to beginning of array (most recent first)
  projects.unshift(newProject);
  
  // Limit to maximum number of projects
  const limitedProjects = projects.slice(0, MAX_PROJECTS);
  
  // Save back to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedProjects));
  
  return newProject;
}

/**
 * Get all stored projects from local storage
 * @returns Array of stored projects
 */
export function getStoredProjects(): StoredProject[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return [];
    }
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Error loading projects from local storage:", error);
    return [];
  }
}

/**
 * Get a specific stored project by ID
 * @param projectId Project ID
 * @returns Project or null if not found
 */
export function getStoredProject(projectId: string): StoredProject | null {
  const projects = getStoredProjects();
  return projects.find(project => project.id === projectId) || null;
}

/**
 * Update an existing project
 * @param projectId Project ID
 * @param updates Partial project data to update
 * @returns Updated project or null if not found
 */
export function updateStoredProject(
  projectId: string,
  updates: Partial<Omit<StoredProject, "id">>
): StoredProject | null {
  const projects = getStoredProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    return null;
  }
  
  // Update the project
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updates,
    // Always update timestamp on edit
    timestamp: Date.now()
  };
  
  // Save back to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  
  return projects[projectIndex];
}

/**
 * Delete a project from local storage
 * @param projectId Project ID
 * @returns True if deleted, false if not found
 */
export function deleteStoredProject(projectId: string): boolean {
  const projects = getStoredProjects();
  const filteredProjects = projects.filter(p => p.id !== projectId);
  
  if (filteredProjects.length === projects.length) {
    // Project was not found
    return false;
  }
  
  // Save filtered projects
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
  
  return true;
}

/**
 * Add or update a file in a project
 * @param projectId Project ID
 * @param file File to add or update
 * @returns Updated project or null if not found
 */
export function saveFileToProject(
  projectId: string,
  file: GeneratedFile
): StoredProject | null {
  const project = getStoredProject(projectId);
  
  if (!project) {
    return null;
  }
  
  // Check if file already exists in project
  const fileIndex = project.files.findIndex(f => f.id === file.id);
  
  if (fileIndex === -1) {
    // Add new file
    project.files.push(file);
  } else {
    // Update existing file
    project.files[fileIndex] = file;
  }
  
  // Update project in storage
  return updateStoredProject(projectId, { files: project.files });
}

/**
 * Export a project as a ZIP file
 * @param projectId Project ID
 */
export function exportProjectAsZip(projectId: string): void {
  const project = getStoredProject(projectId);
  
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  
  // In a real implementation, this would use JSZip to create a downloadable ZIP file
  // For now, we'll just alert
  alert(`Export ${project.name} as ZIP (${project.files.length} files)`);
  
  // Example implementation with JSZip would be:
  /*
  import JSZip from 'jszip';
  
  const zip = new JSZip();
  
  // Add files to zip
  project.files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  // Generate zip and trigger download
  zip.generateAsync({ type: 'blob' }).then(content => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  });
  */
}

/**
 * Get storage usage statistics
 * @returns Object with storage statistics
 */
export function getStorageStats(): {
  projectCount: number;
  fileCount: number;
  totalSize: number;
} {
  const projects = getStoredProjects();
  let fileCount = 0;
  let totalSize = 0;
  
  projects.forEach(project => {
    fileCount += project.files.length;
    project.files.forEach(file => {
      totalSize += file.content.length * 2; // Rough estimate of bytes (2 bytes per character)
    });
  });
  
  return {
    projectCount: projects.length,
    fileCount,
    totalSize
  };
}

/**
 * Projects API Client
 * Handles all project-related API operations
 */

import { get, post, put, del } from './client.js';

/**
 * Get all projects for the authenticated user
 * @returns {Promise<Object>} Projects data
 */
export async function getProjects() {
	return get('/projects');
}

/**
 * Get a specific project by ID
 * @param {number} projectId - Project ID
 * @returns {Promise<Object>} Project data
 */
export async function getProject(projectId) {
	return get(`/projects/${projectId}`);
}

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name
 * @param {string} [projectData.description] - Project description
 * @param {string} [projectData.status] - Project status (active, completed, paused)
 * @returns {Promise<Object>} Created project data
 */
export async function createProject(projectData) {
	return post('/projects', projectData);
}

/**
 * Update an existing project
 * @param {number} projectId - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise<Object>} Updated project data
 */
export async function updateProject(projectId, projectData) {
	return put(`/projects/${projectId}`, projectData);
}

/**
 * Delete a project
 * @param {number} projectId - Project ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteProject(projectId) {
	return del(`/projects/${projectId}`);
}

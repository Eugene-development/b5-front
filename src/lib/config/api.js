/**
 * API Configuration for Laravel Sanctum Token Authentication
 * Manages direct communication with Laravel backend using Bearer tokens
 */

// API Base URL from environment or default
export const API_BASE_URL = 'https://auth.bonus5.ru';
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * API Configuration object
 */
export const API_CONFIG = {
	baseUrl: API_BASE_URL,
	version: 'api',

	// API endpoints for Laravel backend
	endpoints: {
		// Authentication endpoints
		register: '/api/auth/register',
		login: '/api/auth/login',
		logout: '/api/auth/logout',
		user: '/api/auth/user',

		// Email verification
		sendEmailVerification: '/api/email/verification-notification',
		verifyEmail: '/api/email/verify'
	},

	// Default headers for API requests
	defaultHeaders: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-Requested-With': 'XMLHttpRequest'
	},

	// Timeout settings
	timeout: 30000
};

/**
 * Build full API URL from endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {string} Complete API URL
 */
export function buildApiUrl(endpoint) {
	// Remove leading slash if present
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

	// If endpoint already includes the base URL, return as is
	if (cleanEndpoint.startsWith('http')) {
		return cleanEndpoint;
	}

	// Build complete URL
	return `${API_CONFIG.baseUrl}/${cleanEndpoint}`;
}

/**
 * Token Management utilities
 */

/**
 * Get stored authentication token
 * @returns {string|null} - Authentication token
 */
export function getAuthToken() {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem('auth_token');
}

/**
 * Set authentication token in storage
 * @param {string} token - Authentication token
 */
export function setAuthToken(token) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('auth_token', token);
}

/**
 * Remove authentication token from storage
 */
export function removeAuthToken() {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem('auth_token');
}

/**
 * Check if user has valid token
 * @returns {boolean}
 */
export function hasAuthToken() {
	return !!getAuthToken();
}

/**
 * Get authorization header with Bearer token
 * @returns {object|null} - Authorization header object
 */
export function getAuthHeaders() {
	const token = getAuthToken();
	if (!token) return null;

	return {
		Authorization: `Bearer ${token}`
	};
}

/**
 * Legacy functions for backward compatibility
 * These are no longer needed for token-based auth but kept for transition
 */

/**
 * Get CSRF token (not needed for API tokens)
 * @deprecated Use Bearer tokens instead
 * @returns {null}
 */
export function getCsrfToken() {
	console.warn('getCsrfToken is deprecated with API token authentication');
	return null;
}

/**
 * Get Laravel session (not needed for API tokens)
 * @deprecated Use Bearer tokens instead
 * @returns {null}
 */
export function getLaravelSession() {
	console.warn('getLaravelSession is deprecated with API token authentication');
	return null;
}

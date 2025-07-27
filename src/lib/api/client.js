/**
 * HTTP Client for Laravel Sanctum API Token Authentication
 * Direct client for Laravel backend communication using Bearer tokens
 */

import { API_CONFIG, buildApiUrl, getAuthHeaders } from '$lib/config/api.js';
import { handleApiError, validateResponse, logError } from '$lib/utils/error-handling.js';
import { perfMonitor } from '$lib/utils/performance.js';

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
	/**
	 * @param {string} message - Error message
	 * @param {number} status - HTTP status code
	 * @param {Object|null} data - Error response data
	 */
	constructor(message, status, data = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.data = data;
	}
}

/**
 * Make API request to Laravel backend with Bearer token authentication
 * @param {string} endpoint - API endpoint path
 * @param {any} options - Request options
 * @returns {Promise<any>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
	const { method = 'GET', body = null, headers = {}, requireAuth = true } = options;

	const requestId = `${method}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;

	// Start performance monitoring
	perfMonitor.start(requestId);

	try {
		// Prepare request headers
		const requestHeaders = Object.assign({}, API_CONFIG.defaultHeaders, headers);

		// Add Authorization header if authentication is required and available
		if (requireAuth) {
			const authHeaders = getAuthHeaders();
			if (authHeaders) {
				Object.assign(requestHeaders, authHeaders);
			}
		}

		// Build request configuration
		/** @type {RequestInit} */
		const requestConfig = {
			method,
			headers: /** @type {HeadersInit} */ (requestHeaders),
			credentials: 'include' // Include cookies for CORS
		};

		// Add body for non-GET requests
		if (body && method !== 'GET') {
			requestConfig.body = JSON.stringify(body);
		}

		// Make the request to Laravel backend
		const response = await fetch(buildApiUrl(endpoint), requestConfig);

		// Validate response using new error handling
		await validateResponse(response, `api_${method.toLowerCase()}`);

		// Parse JSON response
		const data = await response.json();
		return data;
	} catch (error) {
		// Convert to structured error and log
		const appError = handleApiError(error, `api_${method.toLowerCase()}`);
		logError(appError, { endpoint, method, url: buildApiUrl(endpoint) });

		throw appError;
	} finally {
		// End performance monitoring
		perfMonitor.end(requestId);
	}
}

/**
 * Handle error responses from the API
 * @param {Response} response - Fetch response object
 * @throws {ApiError}
 */
async function handleErrorResponse(response) {
	let errorData = null;

	try {
		errorData = await response.json();
	} catch {
		// Response is not JSON
		errorData = { message: 'Unknown error occurred' };
	}

	switch (response.status) {
		case 401:
			// Token expired or invalid - clear stored token
			const { removeAuthToken } = await import('$lib/config/api.js');
			removeAuthToken();
			throw new ApiError('Unauthorized', 401, errorData);
		case 403:
			throw new ApiError('Forbidden', 403, errorData);
		case 422:
			// Laravel validation errors
			throw new ApiError('Validation failed', 422, errorData);
		case 429:
			throw new ApiError('Too many requests', 429, errorData);
		case 500:
			throw new ApiError('Server error', 500, errorData);
		default:
			throw new ApiError(errorData?.message || 'Request failed', response.status, errorData);
	}
}

/**
 * Convenience methods for common HTTP operations
 */

/**
 * Make GET request
 * @param {string} endpoint - API endpoint
 * @param {any} headers - Additional headers
 * @param {boolean} requireAuth - Whether to require authentication
 * @returns {Promise<any>}
 */
export function get(endpoint, headers = {}, requireAuth = true) {
	return apiRequest(endpoint, { method: 'GET', headers, requireAuth });
}

/**
 * Make POST request
 * @param {string} endpoint - API endpoint
 * @param {any} body - Request body
 * @param {any} headers - Additional headers
 * @param {boolean} requireAuth - Whether to require authentication
 * @returns {Promise<any>}
 */
export function post(endpoint, body = null, headers = {}, requireAuth = false) {
	return apiRequest(endpoint, { method: 'POST', body, headers, requireAuth });
}

/**
 * Make PUT request
 * @param {string} endpoint - API endpoint
 * @param {any} body - Request body
 * @param {any} headers - Additional headers
 * @param {boolean} requireAuth - Whether to require authentication
 * @returns {Promise<any>}
 */
export function put(endpoint, body = null, headers = {}, requireAuth = true) {
	return apiRequest(endpoint, { method: 'PUT', body, headers, requireAuth });
}

/**
 * Make DELETE request
 * @param {string} endpoint - API endpoint
 * @param {any} headers - Additional headers
 * @param {boolean} requireAuth - Whether to require authentication
 * @returns {Promise<any>}
 */
export function del(endpoint, headers = {}, requireAuth = true) {
	return apiRequest(endpoint, { method: 'DELETE', headers, requireAuth });
}

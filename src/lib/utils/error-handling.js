/**
 * Error Handling Utilities for Production-Ready Authentication System
 * Provides comprehensive error handling, logging, and user-friendly messages
 */

import { goto } from '$app/navigation';
import { removeAuthToken } from '$lib/config/api.js';

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high',
	CRITICAL: 'critical'
};

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
	NETWORK: 'network',
	AUTH: 'auth',
	VALIDATION: 'validation',
	SERVER: 'server',
	CLIENT: 'client',
	PERMISSION: 'permission'
};

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES = {
	// Network errors
	'Network error': 'Проблема с подключением к интернету. Проверьте соединение и попробуйте снова.',
	'fetch failed': 'Не удалось связаться с сервером. Попробуйте позже.',

	// Auth errors
	Unauthorized: 'Ваша сессия истекла. Необходимо войти в систему заново.',
	Unauthenticated: 'Для доступа к этому ресурсу необходимо авторизоваться.',
	'Invalid credentials': 'Неверный email или пароль. Проверьте данные и попробуйте снова.',
	'Token expired': 'Время сессии истекло. Войдите в систему заново.',

	// Validation errors
	'Validation failed': 'Пожалуйста, исправьте ошибки в форме и попробуйте снова.',
	'Email already exists': 'Пользователь с таким email уже существует.',

	// Server errors
	'Server error': 'На сервере произошла ошибка. Попробуйте позже.',
	'Service unavailable': 'Сервис временно недоступен. Попробуйте позже.',

	// Rate limiting
	'Too many requests': 'Слишком много запросов. Подождите немного перед повторной попыткой.'
};

/**
 * Enhanced error class with additional context
 */
export class AppError extends Error {
	constructor(message, type = ERROR_TYPES.CLIENT, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
		super(message);
		this.name = 'AppError';
		this.type = type;
		this.severity = severity;
		this.context = context;
		this.timestamp = new Date().toISOString();
		this.userMessage = ERROR_MESSAGES[message] || message;
	}

	/**
	 * Convert to JSON for logging
	 */
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			userMessage: this.userMessage,
			type: this.type,
			severity: this.severity,
			context: this.context,
			timestamp: this.timestamp,
			stack: this.stack
		};
	}
}

/**
 * Handle API errors and convert to AppError
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @returns {AppError}
 */
export function handleApiError(error, context = 'api') {
	// If already an AppError, return as is
	if (error instanceof AppError) {
		return error;
	}

	let type = ERROR_TYPES.CLIENT;
	let severity = ERROR_SEVERITY.MEDIUM;
	let message = error.message || 'Unknown error';

	// Categorize error based on message or type
	if (message.toLowerCase().includes('network') || message.includes('fetch')) {
		type = ERROR_TYPES.NETWORK;
		severity = ERROR_SEVERITY.HIGH;
	} else if (
		message.toLowerCase().includes('unauthorized') ||
		message.toLowerCase().includes('unauthenticated')
	) {
		type = ERROR_TYPES.AUTH;
		severity = ERROR_SEVERITY.HIGH;
	} else if (message.toLowerCase().includes('validation')) {
		type = ERROR_TYPES.VALIDATION;
		severity = ERROR_SEVERITY.LOW;
	} else if (message.toLowerCase().includes('server') || message.toLowerCase().includes('500')) {
		type = ERROR_TYPES.SERVER;
		severity = ERROR_SEVERITY.HIGH;
	} else if (message.toLowerCase().includes('forbidden') || message.toLowerCase().includes('403')) {
		type = ERROR_TYPES.PERMISSION;
		severity = ERROR_SEVERITY.MEDIUM;
	}

	return new AppError(message, type, severity, { context, originalError: error });
}

/**
 * Handle authentication errors specifically
 * @param {Error} error - Auth error
 * @param {Object} options - Handling options
 */
export function handleAuthError(error, options = {}) {
	const { autoRedirect = true, clearTokens = true } = options;

	console.error('🔒 Authentication error:', error);

	// Clear invalid tokens
	if (clearTokens) {
		removeAuthToken();
	}

	// Redirect to login if requested
	if (autoRedirect && typeof window !== 'undefined') {
		const currentPath = window.location.pathname;
		const loginUrl = `/login?redirectTo=${encodeURIComponent(currentPath)}`;
		goto(loginUrl);
	}

	return new AppError(
		error.message || 'Authentication failed',
		ERROR_TYPES.AUTH,
		ERROR_SEVERITY.HIGH,
		{ autoRedirect, clearTokens }
	);
}

/**
 * Log error with appropriate level
 * @param {AppError|Error} error - Error to log
 * @param {Object} additionalContext - Additional context for logging
 */
export function logError(error, additionalContext = {}) {
	const errorData = {
		...(error instanceof AppError
			? error.toJSON()
			: {
					name: error.name,
					message: error.message,
					stack: error.stack,
					timestamp: new Date().toISOString()
				}),
		...additionalContext
	};

	// In development, log to console
	if (import.meta.env.DEV) {
		console.group('🐛 Error Log');
		console.error('Error:', errorData);
		console.groupEnd();
	}

	// In production, send to error tracking service
	if (import.meta.env.PROD) {
		// TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
		// Example: Sentry.captureException(error, { extra: errorData });
	}

	return errorData;
}

/**
 * Display user-friendly error notification
 * @param {AppError|Error} error - Error to display
 * @param {Object} options - Display options
 */
export function showErrorNotification(error, options = {}) {
	const { duration = 5000, showInConsole = import.meta.env.DEV } = options;

	const message = error instanceof AppError ? error.userMessage : error.message;

	if (showInConsole) {
		console.error('💥 User Error:', message);
	}

	// TODO: Integrate with notification system (toast, modal, etc.)
	// For now, return the message for manual handling
	return {
		message,
		severity: error instanceof AppError ? error.severity : ERROR_SEVERITY.MEDIUM,
		duration
	};
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of successful execution
 */
export async function retryWithBackoff(fn, options = {}) {
	const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, backoffFactor = 2 } = options;

	let lastError;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (attempt === maxRetries) {
				break;
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);

			console.warn(`⏳ Retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms`);

			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw handleApiError(lastError, 'retry_exhausted');
}

/**
 * Graceful error boundary for async operations
 * @param {Function} fn - Async function to execute
 * @param {string} context - Context for error handling
 * @param {Object} fallback - Fallback value on error
 */
export async function safeAsyncOperation(fn, context = 'operation', fallback = null) {
	try {
		return await fn();
	} catch (error) {
		const appError = handleApiError(error, context);
		logError(appError);

		return fallback;
	}
}

/**
 * Validate response and throw appropriate errors
 * @param {Response} response - Fetch response
 * @param {string} context - Context for error
 */
export async function validateResponse(response, context = 'api') {
	if (!response.ok) {
		let errorMessage = `HTTP ${response.status}`;

		try {
			const errorData = await response.json();
			errorMessage = errorData.message || errorData.error || errorMessage;
		} catch {
			// If can't parse JSON, use status text
			errorMessage = response.statusText || errorMessage;
		}

		const error = new AppError(
			errorMessage,
			response.status === 401 || response.status === 403 ? ERROR_TYPES.AUTH : ERROR_TYPES.SERVER,
			response.status >= 500 ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM,
			{ context, status: response.status, url: response.url }
		);

		throw error;
	}

	return response;
}

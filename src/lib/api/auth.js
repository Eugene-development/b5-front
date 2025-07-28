/**
 * Authentication API client for Laravel Sanctum Token Authentication
 * Provides authentication-specific methods and token management
 */

import { API_CONFIG, setAuthToken, removeAuthToken } from '$lib/config/api.js';
import { post, get, ApiError } from '$lib/api/client.js';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} remember - Remember me option
 * @returns {Promise<any>}
 */
export async function loginUser(email, password, remember = false) {
	try {
		console.log('🔐 loginUser called with:', { email, password: '***', remember });
		console.log('🌐 Using endpoint:', API_CONFIG.endpoints.login);

		const response = await post(
			API_CONFIG.endpoints.login,
			{
				email,
				password,
				remember,
				device_name: 'web-browser'
			},
			{},
			false
		); // No auth required for login

		console.log('✅ loginUser success:', response);

		// Store the token if login was successful
		if (response.success && response.data?.token?.access_token) {
			console.log('🔑 Storing authentication token');
			setAuthToken(response.data.token.access_token);
		}

		return {
			success: response.success,
			user: response.data?.user,
			token: response.data?.token,
			message: response.message
		};
	} catch (error) {
		console.error('❌ loginUser error:', error);

		if (error instanceof ApiError) {
			console.log('📊 Error details:', { status: error.status, data: error.data });

			if (error.status === 422) {
				// Validation errors
				return {
					success: false,
					// @ts-ignore
					errors: error.data && error.data.errors ? error.data.errors : {},
					// @ts-ignore
					message: error.data && error.data.message ? error.data.message : 'Ошибка валидации'
				};
			} else if (error.status === 401) {
				return {
					success: false,
					message: 'Неверный email или пароль'
				};
			}
		}

		return {
			success: false,
			message: 'Произошла ошибка при входе'
		};
	}
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User first name
 * @param {string} userData.city - User city
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.password_confirmation - Password confirmation
 * @param {boolean} userData.terms_accepted - Terms acceptance
 * @returns {Promise<any>}
 */
export async function registerUser(userData) {
	try {
		// Map firstName to name for Laravel backend
		const requestData = {
			name: userData.firstName,
			city: userData.city,
			email: userData.email,
			password: userData.password,
			password_confirmation: userData.password_confirmation,
			terms_accepted: userData.terms_accepted,
			device_name: 'web-registration'
		};

		const response = await post(API_CONFIG.endpoints.register, requestData, {}, false); // No auth required for register

		// Store the token if registration was successful
		if (response.success && response.data?.token?.access_token) {
			console.log('🔑 Storing authentication token after registration');
			setAuthToken(response.data.token.access_token);
		}

		return {
			success: response.success,
			user: response.data?.user,
			token: response.data?.token,
			message: response.message
		};
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 422) {
				// Validation errors
				return {
					success: false,
					// @ts-ignore
					errors: error.data?.errors,
					// @ts-ignore
					message: error.data?.message || 'Ошибка валидации'
				};
			} else if (error.status === 409) {
				return {
					success: false,
					message: 'Пользователь с таким email уже существует'
				};
			}
		}

		return {
			success: false,
			message: 'Произошла ошибка при регистрации'
		};
	}
}

/**
 * Logout current user
 * @returns {Promise<any>}
 */
export async function logoutUser() {
	try {
		const response = await post(API_CONFIG.endpoints.logout, {}, {}, true); // Auth required

		console.log('✅ Logout API response:', response);

		// Always remove token from storage
		console.log('🗑️ Removing authentication token');
		removeAuthToken();

		return {
			success: true,
			message: response.message || 'Вы успешно вышли из системы'
		};
	} catch (error) {
		// Even if logout request fails, consider it successful
		// since the main goal is to clear client state
		console.warn('Logout request failed:', error);
		console.log('🗑️ Force removing authentication token');
		removeAuthToken();

		return {
			success: true,
			message: 'Вы вышли из системы'
		};
	}
}

/**
 * Get current authenticated user data
 * @returns {Promise<{success: boolean, user?: any, message?: string}>}
 */
export async function getCurrentUser() {
	try {
		const response = await get(API_CONFIG.endpoints.user, {}, true); // Auth required

		return {
			success: response.success,
			user: response.data?.user || response.user
		};
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			// Token is invalid, remove it
			removeAuthToken();
			return {
				success: false,
				message: 'Пользователь не авторизован'
			};
		}

		return {
			success: false,
			message: 'Ошибка получения данных пользователя'
		};
	}
}

/**
 * Check if user is authenticated by trying to get user data
 * @returns {Promise<boolean>}
 */
export async function checkAuthentication() {
	try {
		const result = await getCurrentUser();
		return result.success;
	} catch {
		return false;
	}
}

/**
 * Send email verification notification
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function sendEmailVerification() {
	try {
		console.log('📧 Sending email verification via Laravel API...');

		const response = await post(API_CONFIG.endpoints.sendEmailVerification, {}, {}, true); // Auth required

		return {
			success: response.success,
			message: response.message || 'Письмо с подтверждением отправлено'
		};
	} catch (error) {
		console.error('❌ Send email verification error:', error);

		if (error instanceof ApiError) {
			return {
				success: false,
				// @ts-ignore
				message: error.data?.message || 'Ошибка при отправке письма'
			};
		}

		return {
			success: false,
			message: 'Произошла ошибка при отправке письма'
		};
	}
}

/**
 * Resend email verification notification
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function resendEmailVerification() {
	try {
		console.log('📧 Resending email verification via Laravel API...');

		const response = await post(API_CONFIG.endpoints.sendEmailVerification, {}, {}, true); // Auth required

		return {
			success: response.success,
			message: response.message || 'Письмо с подтверждением отправлено повторно'
		};
	} catch (error) {
		console.error('❌ Resend email verification error:', error);

		if (error instanceof ApiError) {
			return {
				success: false,
				// @ts-ignore
				message: error.data?.message || 'Ошибка при повторной отправке письма'
			};
		}

		return {
			success: false,
			message: 'Произошла ошибка при повторной отправке письма'
		};
	}
}

/**
 * Verify email with token (called from email link)
 * @param {string} id - User ID
 * @param {string} hash - Verification hash
 * @returns {Promise<{success: boolean, user?: any, message?: string}>}
 */
export async function verifyEmail(id, hash) {
	try {
		const response = await get(`${API_CONFIG.endpoints.verifyEmail}/${id}/${hash}`, {}, false); // No auth required

		return {
			success: response.success,
			user: response.data?.user,
			message: response.message || 'Email успешно подтвержден'
		};
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 403) {
				return {
					success: false,
					message: 'Недействительная ссылка для подтверждения'
				};
			}
		}

		return {
			success: false,
			message: 'Произошла ошибка при подтверждении email'
		};
	}
}

/**
 * Map Laravel validation errors to frontend format
 * @param {Object} errors - Laravel validation errors
 * @returns {Object} Mapped errors
 */
export function mapValidationErrors(errors) {
	if (!errors) return {};

	const mapped = {};

	// Map common field names
	const fieldMap = {
		name: 'firstName',
		email: 'email',
		password: 'password',
		city: 'city'
	};

	for (const [field, messages] of Object.entries(errors)) {
		// @ts-ignore
		const mappedField = fieldMap[field] || field;
		// @ts-ignore
		mapped[mappedField] = Array.isArray(messages) ? messages[0] : messages;
	}

	return mapped;
}

/**
 * Verify email using verification URL parameters
 * @param {string} id - User ID
 * @param {string} hash - Verification hash
 * @param {string} expires - Expiration timestamp
 * @param {string} signature - URL signature
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyEmailWithParams(id, hash, expires, signature) {
	try {
		console.log('📧 Verifying email with parameters...');

		const verificationUrl = `${API_CONFIG.baseUrl}/api/email/verify/${id}/${hash}`;
		const url = new URL(verificationUrl);
		url.searchParams.set('expires', expires);
		url.searchParams.set('signature', signature);

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		const result = await response.json();
		console.log('📧 Email verification result:', result);

		// If verification was successful and we have user data, try to get a fresh token
		if (result.success && result.data?.user) {
			console.log('📧 Email verification successful, attempting to get fresh user data...');

			// Try to get current user data to update auth state
			try {
				const userResult = await getCurrentUser();
				if (userResult.success && userResult.user) {
					console.log('📧 Successfully retrieved updated user data:', userResult.user);
					return {
						success: true,
						message: result.message || 'Email успешно подтвержден',
						user: userResult.user
					};
				}
			} catch (userError) {
				console.warn('📧 Could not get fresh user data, using verification response:', userError);
			}
		}

		return {
			success: result.success || false,
			message: result.message || 'Ошибка верификации email',
			user: result.data?.user || null
		};
	} catch (error) {
		console.error('❌ Email verification error:', error);
		return {
			success: false,
			message: 'Произошла ошибка при верификации email'
		};
	}
}

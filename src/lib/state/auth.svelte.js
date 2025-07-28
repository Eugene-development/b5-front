/**
 * Authentication store using Svelte 5 runes with API Token Support
 * This store manages user authentication state across the application
 * and provides functions for login, registration, logout, and token management.
 */

// Define types for our auth state
/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} city - User city
 * @property {boolean} email_verified - Email verification status
 * @property {string|null} email_verified_at - Email verification timestamp
 */

/**
 * @typedef {Object} AuthToken
 * @property {string} access_token - Bearer token
 * @property {string} token_type - Token type (Bearer)
 * @property {string|null} expires_at - Token expiration timestamp
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Current user
 * @property {AuthToken|null} token - Current token info
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} emailVerified - Email verification status
 * @property {boolean} loading - Loading status
 * @property {string|null} error - Error message
 */

/** @type {AuthState} */
export const auth = $state({
	user: null,
	token: null,
	isAuthenticated: false,
	emailVerified: false,
	loading: false,
	error: null
});

/**
 * Initialize auth state from stored token
 */
export async function initializeAuth() {
	const { hasAuthToken } = await import('$lib/config/api.js');

	if (hasAuthToken()) {
		console.log('🔑 Found stored token, checking authentication...');
		await checkAuth();
	} else {
		console.log('🔓 No stored token found');
	}
}

/**
 * Function to handle user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} remember - Remember me option
 * @returns {Promise<boolean>} - Success status
 */
export async function login(email, password, remember = false) {
	auth.loading = true;
	auth.error = null;

	try {
		// Import auth API functions dynamically to avoid circular dependencies
		const { loginUser } = await import('$lib/api/auth.js');

		const result = await loginUser(email, password, remember);
		console.log('🔐 Login API result:', result);

		if (result.success) {
			console.log('✅ Login successful, setting auth state');
			console.log('👤 User data from API:', result.user);
			console.log('🔑 Token data from API:', result.token);

			auth.user = {
				id: result.user.id || 1,
				name: result.user.name || result.user.email,
				email: result.user.email,
				city: result.user.city || '',
				email_verified: result.user.email_verified || false,
				email_verified_at: result.user.email_verified_at || null
			};

			// Token is already saved by loginUser API function
			auth.token = result.token || null;
			auth.isAuthenticated = true;
			auth.emailVerified = result.user.email_verified || false;

			console.log('🔄 Auth state after setting:', {
				isAuthenticated: auth.isAuthenticated,
				emailVerified: auth.emailVerified,
				user: auth.user,
				hasToken: !!auth.token
			});

			return true;
		} else {
			console.log('❌ Login failed:', result);
			auth.error = result.message || 'Ошибка авторизации';
			return false;
		}
	} catch (error) {
		console.error('Login error:', error);
		auth.error = 'Произошла ошибка при входе';
		return false;
	} finally {
		auth.loading = false;
	}
}

/**
 * Function to handle user registration
 * @param {any} userData - User registration data
 * @returns {Promise<boolean>} - Success status
 */
export async function register(userData) {
	auth.loading = true;
	auth.error = null;

	try {
		// Import auth API functions dynamically to avoid circular dependencies
		const { registerUser } = await import('$lib/api/auth.js');

		const result = await registerUser(userData);

		if (result.success) {
			auth.user = {
				id: result.user.id || 1,
				name: result.user.name || userData.firstName,
				email: result.user.email || userData.email,
				city: result.user.city || userData.city,
				email_verified: result.user.email_verified || false,
				email_verified_at: result.user.email_verified_at || null
			};

			auth.token = result.token || null;
			auth.isAuthenticated = true;
			auth.emailVerified = result.user.email_verified || false;
			return true;
		} else {
			auth.error = result.message || 'Ошибка регистрации';
			return false;
		}
	} catch (error) {
		console.error('Registration error:', error);
		auth.error = 'Произошла ошибка при регистрации';
		return false;
	} finally {
		auth.loading = false;
	}
}

/**
 * Function to handle user logout
 * @returns {Promise<boolean>} - Success status
 */
export async function logout() {
	console.log('🔓 Logout function called');
	auth.loading = true;
	auth.error = null;

	try {
		// Import auth API functions dynamically to avoid circular dependencies
		const { logoutUser } = await import('$lib/api/auth.js');

		console.log('📡 Calling logout API...');
		const result = await logoutUser();
		console.log('📡 Logout API response:', result);

		// Always clear local state regardless of API response
		console.log('🧹 Clearing local auth state...');
		auth.user = null;
		auth.token = null;
		auth.isAuthenticated = false;
		auth.emailVerified = false;

		if (result.success) {
			// Redirect to home page using SvelteKit navigation
			console.log('✅ Logout successful, redirecting to home');
			// Import goto dynamically to avoid circular dependencies
			const { goto } = await import('$app/navigation');
			goto('/');
			return true;
		} else {
			console.warn('⚠️ Logout API failed, but local state cleared:', result.message);
			return true; // Still return true since local state is cleared
		}
	} catch (error) {
		console.error('💥 Logout error:', error);
		// Even if logout request fails, clear local state
		console.log('🧹 Force clearing local state after error...');
		auth.user = null;
		auth.token = null;
		auth.isAuthenticated = false;
		auth.emailVerified = false;
		auth.error = null; // Don't show error for logout
		// Import goto dynamically to avoid circular dependencies
		const { goto } = await import('$app/navigation');
		goto('/');
		return true;
	} finally {
		auth.loading = false;
		console.log('🔓 Logout function completed');
	}
}

/**
 * Function to check if user is authenticated (for initial page load)
 * @returns {Promise<boolean>} - Authentication status
 */
export async function checkAuth() {
	auth.loading = true;
	auth.error = null;

	try {
		// Import auth API functions dynamically to avoid circular dependencies
		const { getCurrentUser } = await import('$lib/api/auth.js');
		const { hasAuthToken } = await import('$lib/config/api.js');

		// If no token stored, return false
		if (!hasAuthToken()) {
			auth.user = null;
			auth.token = null;
			auth.isAuthenticated = false;
			auth.emailVerified = false;
			return false;
		}

		const result = await getCurrentUser();

		// Debug logging to see what we're receiving
		console.log('🔍 checkAuth API result:', result);
		console.log('🔍 User data from API:', result.user);
		console.log('🔍 Email verified field from API:', result.user?.email_verified);
		console.log('🔍 Email verified at field from API:', result.user?.email_verified_at);

		if (result.success && result.user) {
			auth.user = {
				id: result.user.id || 1,
				name: result.user.name || result.user.email,
				email: result.user.email,
				city: result.user.city || '',
				email_verified: result.user.email_verified || false,
				email_verified_at: result.user.email_verified_at || null
			};
			auth.isAuthenticated = true;
			auth.emailVerified = result.user.email_verified || false;

			// Debug logging to see what we're setting
			console.log('🔍 Set auth.emailVerified to:', auth.emailVerified);
			console.log('🔍 Set auth.user.email_verified to:', auth.user.email_verified);
			console.log('🔍 Final auth state:', {
				isAuthenticated: auth.isAuthenticated,
				emailVerified: auth.emailVerified,
				user: auth.user,
				hasToken: !!auth.token
			});

			return true;
		} else {
			auth.user = null;
			auth.token = null;
			auth.isAuthenticated = false;
			auth.emailVerified = false;
			return false;
		}
	} catch (error) {
		console.error('Auth check error:', error);
		auth.user = null;
		auth.token = null;
		auth.isAuthenticated = false;
		auth.emailVerified = false;
		auth.error = null; // Don't show error for auth check
		return false;
	} finally {
		auth.loading = false;
	}
}

/**
 * Helper function to get CSRF cookie for Laravel Sanctum
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value
 */
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const part = parts.pop();
		if (part) {
			return part.split(';').shift() || null;
		}
	}
	return null;
}

/**
 * Function to send email verification
 * @returns {Promise<boolean>} - Success status
 */
export async function sendEmailVerification() {
	auth.loading = true;
	auth.error = null;

	try {
		const { sendEmailVerification: sendVerification } = await import('$lib/api/auth.js');
		const result = await sendVerification();

		if (result.success) {
			return true;
		} else {
			auth.error = result.message || 'Ошибка отправки письма';
			return false;
		}
	} catch (error) {
		console.error('Send email verification error:', error);
		auth.error = 'Произошла ошибка при отправке письма';
		return false;
	} finally {
		auth.loading = false;
	}
}

/**
 * Function to resend email verification
 * @returns {Promise<boolean>} - Success status
 */
export async function resendEmailVerification() {
	auth.loading = true;
	auth.error = null;

	try {
		const { resendEmailVerification: resendVerification } = await import('$lib/api/auth.js');
		const result = await resendVerification();

		if (result.success) {
			return true;
		} else {
			auth.error = result.message || 'Ошибка повторной отправки письма';
			return false;
		}
	} catch (error) {
		console.error('Resend email verification error:', error);
		auth.error = 'Произошла ошибка при повторной отправке письма';
		return false;
	} finally {
		auth.loading = false;
	}
}

/**
 * Function to clear authentication error
 */
export function clearError() {
	auth.error = null;
}

/**
 * Function to get current token (for debugging)
 * @returns {AuthToken|null}
 */
export function getCurrentToken() {
	return auth.token;
}

/**
 * Function to check if token is expired (basic check)
 * @returns {boolean}
 */
export function isTokenExpired() {
	if (!auth.token?.expires_at) return false;

	try {
		const expirationDate = new Date(auth.token.expires_at);
		return expirationDate <= new Date();
	} catch {
		return false;
	}
}

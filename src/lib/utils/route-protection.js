/**
 * Route Protection Utilities for API Token Authentication
 * Provides functions to protect routes and redirect unauthenticated users
 */

import { goto } from '$app/navigation';
import { auth } from '$lib/state/auth.svelte.js';
import { hasAuthToken } from '$lib/config/api.js';

/**
 * List of protected routes that require authentication
 */
export const PROTECTED_ROUTES = ['/dashboard', '/profile', '/projects', '/finances', '/settings'];

/**
 * List of auth routes that should redirect authenticated users
 */
export const AUTH_ROUTES = ['/login', '/registration'];

/**
 * Routes that require email verification
 */
export const EMAIL_VERIFICATION_REQUIRED_ROUTES = [
	'/dashboard',
	'/profile',
	'/projects',
	'/finances',
	'/settings'
];

/**
 * Check if current path is a protected route
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function isProtectedRoute(pathname) {
	return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if current path is an auth route
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function isAuthRoute(pathname) {
	return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if current path requires email verification
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function requiresEmailVerification(pathname) {
	return EMAIL_VERIFICATION_REQUIRED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Guard function for protected routes
 * Redirects to login if not authenticated
 * @param {string} pathname - Current pathname
 * @param {string} [redirectTo] - Custom redirect path
 * @returns {boolean} - Whether access is allowed
 */
export function guardProtectedRoute(pathname, redirectTo = null) {
	console.log('🛡️ Guarding protected route:', pathname, {
		hasToken: hasAuthToken(),
		isAuthenticated: auth.isAuthenticated,
		emailVerified: auth.emailVerified,
		loading: auth.loading
	});

	// Quick check for stored token
	if (!hasAuthToken()) {
		console.log('🔒 No auth token found, redirecting to login');
		const loginUrl = redirectTo
			? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
			: `/login?redirectTo=${encodeURIComponent(pathname)}`;

		// Prevent infinite redirects - only redirect if we're not already going to login
		if (!pathname.startsWith('/login')) {
			goto(loginUrl);
		}
		return false;
	}

	// Check auth state
	if (!auth.isAuthenticated) {
		console.log('🔒 User not authenticated, redirecting to login');
		const loginUrl = redirectTo
			? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
			: `/login?redirectTo=${encodeURIComponent(pathname)}`;

		// Prevent infinite redirects - only redirect if we're not already going to login
		if (!pathname.startsWith('/login')) {
			goto(loginUrl);
		}
		return false;
	}

	// Check email verification for routes that require it
	if (requiresEmailVerification(pathname) && !auth.emailVerified) {
		console.log('📧 Email verification required, redirecting to email-verify');

		// Prevent infinite redirects - only redirect if we're not already going to email-verify
		if (pathname !== '/email-verify') {
			goto('/email-verify');
		}
		return false;
	}

	console.log('✅ Route access granted for:', pathname);
	return true;
}

/**
 * Guard function for auth routes (login, registration)
 * Redirects authenticated users to dashboard
 * @param {string} pathname - Current pathname
 * @returns {boolean} - Whether access is allowed
 */
export function guardAuthRoute(pathname) {
	if (auth.isAuthenticated) {
		console.log('👤 User already authenticated, redirecting from auth route');

		// Prevent infinite redirects - only redirect if we're not already going there
		if (!auth.emailVerified && pathname !== '/email-verify') {
			goto('/email-verify');
			return false;
		} else if (auth.emailVerified && pathname !== '/dashboard') {
			goto('/dashboard');
			return false;
		}

		// If we're already on the target page, allow access
		return true;
	}

	return true;
}

/**
 * Universal route guard that handles both protected and auth routes
 * @param {string} pathname - Current pathname
 * @returns {boolean} - Whether access is allowed
 */
export function guardRoute(pathname) {
	// Handle protected routes
	if (isProtectedRoute(pathname)) {
		return guardProtectedRoute(pathname);
	}

	// Handle auth routes
	if (isAuthRoute(pathname)) {
		return guardAuthRoute(pathname);
	}

	// Allow access to public routes
	return true;
}

/**
 * Loading state aware route guard
 * Waits for auth initialization before making decisions
 * @param {string} pathname - Current pathname
 * @returns {boolean|null} - Whether access is allowed, null if still loading
 */
export function guardRouteWithLoading(pathname) {
	// If auth is still loading, return null to indicate pending
	if (auth.loading) {
		return null;
	}

	return guardRoute(pathname);
}

/**
 * Create a navigation hook for route protection
 * @returns {Function} - Navigation hook function
 */
export function createRouteGuard() {
	return (navigation) => {
		const pathname = navigation.to?.url.pathname;

		if (!pathname) return;

		const allowed = guardRouteWithLoading(pathname);

		// If still loading, let navigation proceed (will be handled by layout)
		if (allowed === null) return;

		// If not allowed, cancel navigation
		if (!allowed) {
			navigation.cancel();
		}
	};
}

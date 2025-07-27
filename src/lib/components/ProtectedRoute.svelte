<script>
	import { auth } from '$lib/state/auth.svelte.js';
	import { hasAuthToken } from '$lib/config/api.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	/**
	 * @typedef {Object} ProtectedRouteProps
	 * @property {boolean} [requireEmailVerification=false] - Whether to require email verification
	 * @property {string} [redirectTo] - Custom redirect path
	 * @property {import('svelte').Snippet} children - Child content to render when authorized
	 */

	/** @type {ProtectedRouteProps} */
	let { requireEmailVerification = false, redirectTo, children } = $props();

	// Reactive check for authorization
	let isAuthorized = $derived(() => {
		// If auth is loading, show loading state
		if (auth.loading) return null;

		// Check for stored token
		if (!hasAuthToken()) return false;

		// Check authentication state
		if (!auth.isAuthenticated) return false;

		// Check email verification if required
		if (requireEmailVerification && !auth.emailVerified) {
			goto('/email-verify');
			return false;
		}

		return true;
	});

	// Handle unauthorized access
	$effect(() => {
		if (isAuthorized === false) {
			const currentPath = page.url.pathname;
			const loginUrl = redirectTo
				? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
				: `/login?redirectTo=${encodeURIComponent(currentPath)}`;

			console.log('🔒 Unauthorized access, redirecting to login');
			goto(loginUrl);
		}
	});
</script>

{#if isAuthorized === null}
	<!-- Loading state -->
	<div class="flex min-h-32 items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
	</div>
{:else if isAuthorized === true}
	<!-- Authorized - render children -->
	{@render children()}
{:else}
	<!-- Unauthorized - show message while redirecting -->
	<div class="flex min-h-32 items-center justify-center">
		<div class="text-center">
			<p class="text-gray-500">Перенаправление на страницу входа...</p>
		</div>
	</div>
{/if}

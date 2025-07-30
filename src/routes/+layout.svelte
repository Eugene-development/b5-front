<script>
	import '../app.css';
	import { Menu } from './layout/header/UI';
	import { Component } from './layout/footer/UI';
	import { auth, initializeAuth } from '$lib/state/auth.svelte.js';
	import { onMount } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { guardRouteWithLoading } from '$lib/utils/route-protection.js';

	/** @type {import('./$types').LayoutProps} */
	let { children } = $props();

	// Initialize authentication from stored token on app startup
	onMount(async () => {
		console.log('🔧 Layout mounted, initializing auth...');
		await initializeAuth();
		console.log('✅ Auth initialization completed');
	});

	// Navigation hooks for route protection
	beforeNavigate((navigation) => {
		const pathname = navigation.to?.url.pathname;
		console.log('🔄 Navigation starting to:', pathname);

		if (pathname) {
			const allowed = guardRouteWithLoading(pathname);

			// If route protection returns false, cancel navigation
			if (allowed === false) {
				console.log('🔒 Route access denied, cancelling navigation');
				navigation.cancel();
			}
		}
	});

	afterNavigate((navigation) => {
		console.log('✅ Navigation completed to:', navigation.to?.url.pathname);
	});

	// Note: Route protection is handled by beforeNavigate hook above

	// Debug reactive auth state changes
	$effect(() => {
		if (auth.isAuthenticated !== undefined) {
			console.log('🔄 Auth state changed:', {
				isAuthenticated: auth.isAuthenticated,
				user: auth.user?.name,
				emailVerified: auth.emailVerified,
				loading: auth.loading,
				error: auth.error
			});
		}
	});
</script>

<header class="bg-gray-900">
	<Menu />
</header>

<!-- Loading state during auth initialization -->
<!-- {#if auth.loading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-red-500"></div>
	</div>
{:else}
	{@render children()}
{/if} -->
{@render children()}

<footer class="border-t border-gray-100 bg-gray-900 py-6">
	<Component />
</footer>

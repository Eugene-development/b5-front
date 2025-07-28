<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Extract parameters from URL path and query
		const id = $page.params.id;
		const hash = $page.params.hash;
		const expires = $page.url.searchParams.get('expires');
		const signature = $page.url.searchParams.get('signature');

		console.log('📧 Email verification route accessed:', { id, hash, expires, signature });

		// Redirect to main email-verify page with query parameters
		const queryParams = new URLSearchParams({
			id: id,
			hash: hash,
			expires: expires || '',
			signature: signature || ''
		});

		goto(`/email-verify?${queryParams.toString()}`, { replaceState: true });
	});
</script>

<svelte:head>
	<title>Переадресация верификации - Bonus5</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-900">
	<div class="text-center">
		<div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
		<p class="text-gray-300">Переадресация на страницу верификации...</p>
	</div>
</div>

<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/state/auth.svelte.js';

	// Check if error is auth-related
	let isAuthError = $derived(page.status === 401 || page.status === 403);

	// Error details
	let errorTitle = $derived(() => {
		switch (page.status) {
			case 400:
				return 'Неверный запрос';
			case 401:
				return 'Требуется авторизация';
			case 403:
				return 'Доступ запрещен';
			case 404:
				return 'Страница не найдена';
			case 500:
				return 'Ошибка сервера';
			default:
				return 'Произошла ошибка';
		}
	});

	let errorDescription = $derived(() => {
		switch (page.status) {
			case 400:
				return 'Запрос содержит некорректные данные.';
			case 401:
				return 'Для доступа к этой странице необходимо авторизоваться.';
			case 403:
				return 'У вас нет прав для доступа к этому ресурсу.';
			case 404:
				return 'Запрашиваемая страница не существует или была перемещена.';
			case 500:
				return 'На сервере произошла ошибка. Попробуйте позже.';
			default:
				return 'Что-то пошло не так. Пожалуйста, попробуйте снова.';
		}
	});

	// Handle auth errors by redirecting to login
	function handleAuthError() {
		if (isAuthError) {
			// Clear potentially invalid auth state
			auth.user = null;
			auth.isAuthenticated = false;
			auth.token = null;

			// Redirect to login
			goto('/login');
		}
	}

	// Navigation helpers
	function goHome() {
		goto('/');
	}

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>{errorTitle} • BONUS5</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-6">
	<div class="max-w-md text-center">
		<!-- Error Status Code -->
		<div class="mb-8">
			<span class="block text-8xl font-bold text-indigo-400">
				{page.status}
			</span>
		</div>

		<!-- Error Title -->
		<h1 class="mb-4 text-3xl font-semibold text-white">
			{errorTitle}
		</h1>

		<!-- Error Description -->
		<p class="mb-8 leading-relaxed text-gray-300">
			{errorDescription}
		</p>

		<!-- Error Message (if available) -->
		{#if page.error?.message && page.error.message !== errorDescription}
			<div class="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
				<p class="text-sm text-red-400">
					{page.error.message}
				</p>
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="space-y-4">
			{#if isAuthError}
				<button
					onclick={handleAuthError}
					class="w-full rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-600"
				>
					Войти в систему
				</button>
			{/if}

			<div class="flex gap-4">
				<button
					onclick={goBack}
					class="flex-1 rounded-lg bg-gray-700 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
				>
					Назад
				</button>

				<button
					onclick={goHome}
					class="flex-1 rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-600"
				>
					На главную
				</button>
			</div>
		</div>

		<!-- Development Info -->
		{#if import.meta.env.DEV}
			<details class="mt-8 text-left">
				<summary class="mb-2 cursor-pointer text-gray-400 hover:text-gray-300">
					Информация для разработчика
				</summary>
				<div class="space-y-2 rounded-lg bg-gray-800 p-4 text-xs text-gray-300">
					<div><strong>Status:</strong> {page.status}</div>
					<div><strong>URL:</strong> {page.url.pathname}</div>
					{#if page.error?.message}
						<div><strong>Message:</strong> {page.error.message}</div>
					{/if}
					{#if page.error?.stack}
						<div><strong>Stack:</strong></div>
						<pre class="whitespace-pre-wrap text-xs">{page.error.stack}</pre>
					{/if}
				</div>
			</details>
		{/if}
	</div>
</div>

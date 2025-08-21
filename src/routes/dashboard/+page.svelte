<script>
	import { auth, logout } from '$lib/state/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	// Email verification success message
	let showSuccessMessage = $state(false);
	let successMessage = $state('');

	// Check for verification success message
	onMount(() => {
		const urlParams = new URLSearchParams(page.url.search);
		const message = urlParams.get('message');

		if (message === 'email_verified') {
			showSuccessMessage = true;
			successMessage =
				'Email успешно подтвержден! Теперь вы можете пользоваться всеми функциями сервиса.';
			// Auto-hide after 5 seconds
			setTimeout(() => {
				showSuccessMessage = false;
				// Clear URL params
				window.history.replaceState({}, '', '/dashboard');
			}, 5000);
		} else if (message === 'email_already_verified') {
			showSuccessMessage = true;
			successMessage = 'Email уже был подтвержден ранее.';
			setTimeout(() => {
				showSuccessMessage = false;
				window.history.replaceState({}, '', '/dashboard');
			}, 3000);
		}
	});

	// Handle logout with redirect
	async function handleLogout() {
		console.log('🚪 Starting logout process...');

		try {
			const success = await logout();
			console.log('🔑 Logout result:', success);

			if (success) {
				console.log('✅ Logout successful, redirecting to home');
				goto('/');
			} else {
				console.error('❌ Logout failed, but auth state cleared');
				goto('/');
			}
		} catch (error) {
			console.error('💥 Logout error:', error);
			goto('/');
		}
	}
</script>

<div class="relative isolate bg-gray-900 py-24 sm:py-32">
	<!-- Success Message -->
	{#if showSuccessMessage}
		<div class="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
			<div
				class="rounded-lg border border-green-500/30 bg-green-500/20 p-4 shadow-lg backdrop-blur-sm"
			>
				<div class="flex items-center">
					<svg
						class="mr-3 h-6 w-6 text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p class="text-sm font-medium text-green-300">{successMessage}</p>
				</div>
			</div>
		</div>
	{/if}

	<div class="mx-auto max-w-4xl px-6 lg:px-8">
		<!-- Page Header -->
		<div class="mx-auto mb-16 text-center">
			<h1 class="text-4xl font-normal tracking-widest text-white sm:text-6xl">Личный кабинет</h1>
			<!-- <p class="mt-6 text-lg/8 text-gray-300">
				Добро пожаловать, {auth.user?.name || 'пользователь'}!
			</p> -->
		</div>

		<!-- Dashboard Actions -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- Profile Section -->
			<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center">
					<svg
						class="mr-3 h-8 w-8 text-indigo-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						></path>
					</svg>
					<h3 class="text-xl font-semibold text-white">Профиль</h3>
				</div>
				<a href="/profile" class="font-medium text-indigo-400 hover:text-indigo-300">
					Просмотреть →
				</a>
			</div>

			<!-- Projects Section -->
			<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center">
					<svg
						class="mr-3 h-8 w-8 text-purple-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						></path>
					</svg>
					<h3 class="text-xl font-semibold text-white">Проекты</h3>
				</div>
				<!-- <p class="mb-4 text-gray-300">Управление активными проектами</p> -->
				<a href="/projects" class="font-medium text-purple-400 hover:text-purple-300">
					Управлять →
				</a>
			</div>

			<!-- Finances Section -->
			<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center">
					<svg
						class="mr-3 h-8 w-8 text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
						></path>
					</svg>
					<h3 class="text-xl font-semibold text-white">Финансы</h3>
				</div>
				<a href="/finances" class="font-medium text-green-400 hover:text-green-300">
					Управлять →
				</a>
			</div>

			<!-- Settings Section -->
			<!-- <div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center">
					<svg
						class="mr-3 h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						></path>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						></path>
					</svg>
					<h3 class="text-xl font-semibold text-white">Настройки</h3>
				</div>
				<p class="mb-4 text-gray-300">Конфигурация аккаунта</p>
				<button class="font-medium text-gray-400 hover:text-gray-300"> Настроить → </button>
			</div> -->
		</div>

		<!-- Quick Stats -->
		<div class="mb-8 rounded-lg bg-white/5 p-8 backdrop-blur-sm">
			<h2 class="mb-6 text-center text-2xl font-semibold tracking-wide text-white">
				Быстрая статистика
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-indigo-400">0</div>
					<div class="text-gray-300">Активных проектов</div>
				</div>

				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-green-400">0</div>
					<div class="text-gray-300">Закрытых проектов</div>
				</div>

				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-yellow-400">0</div>
					<div class="text-gray-300">Выплат получено</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<!-- <a
				href="/about"
				class="rounded-lg bg-indigo-500 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-indigo-600"
			>
				О проекте
			</a> -->

			<button
				onclick={handleLogout}
				disabled={auth.loading}
				class="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
			>
				{auth.loading ? 'Выход...' : 'Выйти из аккаунта'}
			</button>
		</div>

		<!-- Security Notice -->
		<div class="mt-8 text-center">
			<p class="text-sm text-gray-400">
				Эта страница доступна только авторизованным пользователям.
				<br />
				Ваша сессия защищена API токенами и данные передаются по защищенному соединению.
			</p>
		</div>
	</div>
</div>

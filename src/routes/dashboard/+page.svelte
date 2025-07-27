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
				console.log('✅ Logout successful, redirected by auth store');
			} else {
				console.error('❌ Logout failed, but auth state cleared');
			}
		} catch (error) {
			console.error('💥 Logout error:', error);
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
			<p class="mt-6 text-lg/8 text-gray-300">
				Добро пожаловать, {auth.user?.name || 'пользователь'}!
			</p>
		</div>

		<!-- User Info Card -->
		<div class="mb-8 rounded-lg bg-white/5 p-8 backdrop-blur-sm">
			<h2 class="mb-6 text-2xl font-semibold tracking-wide text-white">
				Информация о пользователе
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="user-name" class="mb-2 block text-sm font-medium text-gray-300"> Имя </label>
					<div id="user-name" class="rounded-md bg-white/10 px-4 py-3 text-lg text-white">
						{auth.user?.name || 'Не указано'}
					</div>
				</div>

				<div>
					<label for="user-email" class="mb-2 block text-sm font-medium text-gray-300">
						Email
					</label>
					<div id="user-email" class="rounded-md bg-white/10 px-4 py-3 text-lg text-white">
						{auth.user?.email || 'Не указано'}
					</div>
				</div>

				<div>
					<label for="user-city" class="mb-2 block text-sm font-medium text-gray-300">
						Город
					</label>
					<div id="user-city" class="rounded-md bg-white/10 px-4 py-3 text-lg text-white">
						{auth.user?.city || 'Не указано'}
					</div>
				</div>

				<div>
					<label for="email-status" class="mb-2 block text-sm font-medium text-gray-300">
						Статус Email
					</label>
					<div id="email-status" class="rounded-md bg-white/10 px-4 py-3 text-lg text-white">
						{#if auth.emailVerified}
							<span class="inline-flex items-center text-green-400">
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
								Подтвержден
							</span>
						{:else}
							<span class="inline-flex items-center text-yellow-400">
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
								Не подтвержден
							</span>
						{/if}
					</div>
				</div>
			</div>

			{#if !auth.emailVerified}
				<div class="mt-6 rounded-md bg-yellow-500/10 p-4">
					<div class="flex">
						<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-yellow-400">Требуется подтверждение email</h3>
							<div class="mt-2 text-sm text-yellow-300">
								<p>Для доступа ко всем функциям подтвердите свой email адрес.</p>
							</div>
							<div class="mt-4">
								<a
									href="/email-verify"
									class="rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-400"
								>
									Подтвердить email
								</a>
							</div>
						</div>
					</div>
				</div>
			{/if}
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
				<p class="mb-4 text-gray-300">Управление данными</p>
				<button class="font-medium text-indigo-400 hover:text-indigo-300"> Редактировать → </button>
			</div>

			<!-- Payments Section -->
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
					<h3 class="text-xl font-semibold text-white">Выплаты</h3>
				</div>
				<p class="mb-4 text-gray-300">История доходов и выплат</p>
				<a href="/payments" class="font-medium text-green-400 hover:text-green-300">
					Посмотреть →
				</a>
			</div>

			<!-- Settings Section -->
			<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
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
			</div>
		</div>

		<!-- Quick Stats -->
		<div class="mb-8 rounded-lg bg-white/5 p-8 backdrop-blur-sm">
			<h2 class="mb-6 text-2xl font-semibold tracking-wide text-white">Быстрая статистика</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-indigo-400">0</div>
					<div class="text-gray-300">Активных проектов</div>
				</div>

				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-green-400">₽0</div>
					<div class="text-gray-300">Общий доход</div>
				</div>

				<div class="text-center">
					<div class="mb-2 text-3xl font-bold text-yellow-400">0</div>
					<div class="text-gray-300">Выплат получено</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<a
				href="/project"
				class="rounded-lg bg-indigo-500 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-indigo-600"
			>
				Перейти к проектам
			</a>

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

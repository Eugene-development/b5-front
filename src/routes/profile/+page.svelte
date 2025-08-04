<script>
	import { auth, logout } from '$lib/state/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	// Email verification success message
	let showSuccessMessage = $state(false);
	let successMessage = $state('');

	// Copy functionality
	let showCopyMessage = $state(false);
	let copyMessage = $state('');

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
				window.history.replaceState({}, '', '/profile');
			}, 5000);
		} else if (message === 'email_already_verified') {
			showSuccessMessage = true;
			successMessage = 'Email уже был подтвержден ранее.';
			setTimeout(() => {
				showSuccessMessage = false;
				window.history.replaceState({}, '', '/profile');
			}, 3000);
		}

		// Check authentication on mount
		checkAuthentication();
	});

	// Check if user is authenticated
	function checkAuthentication() {
		if (!auth.isAuthenticated) {
			console.log('🔒 User not authenticated, redirecting to login');
			goto('/login?redirectTo=/profile');
			return;
		}

		// Check email verification
		if (!auth.emailVerified) {
			console.log('📧 Email not verified, redirecting to email-verify');
			goto('/email-verify');
			return;
		}
	}

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

	// Copy key to clipboard
	async function copyKey() {
		const key = auth.user?.key;
		if (!key) return;

		try {
			await navigator.clipboard.writeText(key);
			showCopyMessage = true;
			copyMessage = 'Ключ скопирован в буфер обмена!';

			// Auto-hide after 3 seconds
			setTimeout(() => {
				showCopyMessage = false;
			}, 3000);
		} catch (error) {
			console.error('Failed to copy key:', error);
			showCopyMessage = true;
			copyMessage = 'Ошибка копирования ключа';

			setTimeout(() => {
				showCopyMessage = false;
			}, 3000);
		}
	}
</script>

<!-- Show loading state while checking auth -->
{#if auth.loading}
	<div class="flex min-h-screen items-center justify-center bg-gray-900">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-400"></div>
			<p class="mt-4 text-gray-300">Проверка авторизации...</p>
		</div>
	</div>
{:else if !auth.isAuthenticated}
	<!-- Redirect will happen automatically -->
	<div class="flex min-h-screen items-center justify-center bg-gray-900">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-red-400"></div>
			<p class="mt-4 text-gray-300">Перенаправление на страницу входа...</p>
		</div>
	</div>
{:else if !auth.emailVerified}
	<!-- Redirect will happen automatically -->
	<div class="flex min-h-screen items-center justify-center bg-gray-900">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400"></div>
			<p class="mt-4 text-gray-300">Перенаправление на подтверждение email...</p>
		</div>
	</div>
{:else}
	<!-- Main content - only shown when authenticated and email verified -->
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

		<!-- Copy Message -->
		{#if showCopyMessage}
			<div class="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
				<div
					class="rounded-lg border border-blue-500/30 bg-blue-500/20 p-4 shadow-lg backdrop-blur-sm"
				>
					<div class="flex items-center">
						<svg
							class="mr-3 h-6 w-6 text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						<p class="text-sm font-medium text-blue-300">{copyMessage}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="mx-auto max-w-4xl px-6 lg:px-8">
			<!-- Page Header -->
			<div class="mx-auto mb-16 text-center">
				<h1 class="text-4xl font-normal tracking-widest text-white sm:text-6xl">Профиль</h1>
				<p class="mt-6 text-lg/8 text-gray-300">
					Информация о пользователе {auth.user?.name || 'пользователь'}
				</p>
			</div>

			<!-- User Info Card -->
			<div class="mb-8 rounded-lg bg-white/5 p-8 backdrop-blur-sm">
				<h2 class="mb-6 text-2xl font-semibold tracking-wide text-white">
					Информация о пользователе
				</h2>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<label for="user-name" class="mb-2 block text-sm font-medium text-gray-300">
							Имя
						</label>
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
						<label for="user-key" class="mb-2 block text-sm font-medium text-gray-300">
							Секретный ключ
						</label>
						<div
							id="user-key"
							class="cursor-pointer select-none rounded-md bg-white/10 px-4 py-3 font-mono text-lg text-white transition-all duration-200 hover:scale-105 hover:bg-white/20 hover:shadow-lg active:scale-95"
							onclick={copyKey}
							title="Кликните для копирования ключа"
							style="user-select: none;"
						>
							{auth.user?.key || 'Не указано'}
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

					<div>
						<label for="user-id" class="mb-2 block text-sm font-medium text-gray-300">
							ID пользователя
						</label>
						<div id="user-id" class="rounded-md bg-white/10 px-4 py-3 text-lg text-white">
							{auth.user?.id || 'Не указано'}
						</div>
					</div>
				</div>

				{#if auth.isAuthenticated && !auth.emailVerified}
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

			<!-- Navigation Actions -->
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Dashboard Section -->
				<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-center">
						<svg
							class="mr-3 h-8 w-8 text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
							></path>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
							></path>
						</svg>
						<h3 class="text-xl font-semibold text-white">Дашборд</h3>
					</div>
					<a href="/dashboard" class="font-medium text-blue-400 hover:text-blue-300">
						Вернуться →
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
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
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
{/if}

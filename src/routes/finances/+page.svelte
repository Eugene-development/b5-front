<script>
	import { auth, logout } from '$lib/state/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	// Email verification success message
	let showSuccessMessage = $state(false);
	let successMessage = $state('');

	// Financial data
	let financialData = $state({
		totalEarnings: 0,
		totalPayments: 0,
		pendingPayments: 0,
		individualBonuses: 0,
		monthlyEarnings: 0,
		recentTransactions: []
	});

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
				window.history.replaceState({}, '', '/finances');
			}, 5000);
		} else if (message === 'email_already_verified') {
			showSuccessMessage = true;
			successMessage = 'Email уже был подтвержден ранее.';
			setTimeout(() => {
				showSuccessMessage = false;
				window.history.replaceState({}, '', '/finances');
			}, 3000);
		}

		// Check authentication on mount
		checkAuthentication();
		// Load financial data (mock data for now)
		loadFinancialData();
	});

	// Check if user is authenticated
	function checkAuthentication() {
		if (!auth.isAuthenticated) {
			console.log('🔒 User not authenticated, redirecting to login');
			goto('/login?redirectTo=/finances');
			return;
		}

		// Check email verification
		if (!auth.emailVerified) {
			console.log('📧 Email not verified, redirecting to email-verify');
			goto('/email-verify');
			return;
		}
	}

	// Load financial data
	async function loadFinancialData() {
		// Mock data - in real app this would come from API
		financialData = {
			totalEarnings: 125000,
			totalPayments: 98000,
			pendingPayments: 27000,
			individualBonuses: 15000,
			monthlyEarnings: 18500,
			recentTransactions: [
				{
					id: 1,
					type: 'payment',
					amount: 15000,
					description: 'Выплата за проект "Разработка сайта"',
					date: '2025-01-15',
					status: 'completed'
				},
				{
					id: 2,
					type: 'bonus',
					amount: 5000,
					description: 'Бонус за качественную работу',
					date: '2025-01-10',
					status: 'completed'
				},
				{
					id: 3,
					type: 'payment',
					amount: 12000,
					description: 'Выплата за проект "Мобильное приложение"',
					date: '2025-01-05',
					status: 'pending'
				},
				{
					id: 4,
					type: 'bonus',
					amount: 3000,
					description: 'Бонус за срочность',
					date: '2024-12-28',
					status: 'completed'
				}
			]
		};
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

	// Format currency
	function formatCurrency(amount) {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0
		}).format(amount);
	}

	// Format date
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('ru-RU');
	}

	// Get status color
	function getStatusColor(status) {
		return status === 'completed' ? 'text-green-400' : 'text-yellow-400';
	}

	// Get status text
	function getStatusText(status) {
		return status === 'completed' ? 'Выполнено' : 'В обработке';
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

		<div class="mx-auto max-w-6xl px-6 lg:px-8">
			<!-- Page Header -->
			<div class="mx-auto mb-16 text-center">
				<h1 class="text-4xl font-normal tracking-widest text-white sm:text-6xl">Финансы</h1>
				<!-- <p class="mt-6 text-lg/8 text-gray-300">Учёт выплат, бонусов и финансовых операций</p> -->
			</div>

			<!-- Financial Overview Cards -->
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<!-- Total Earnings -->
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
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">Общий доход</h3>
					</div>
					<div class="text-3xl font-bold text-blue-400">
						{formatCurrency(financialData.totalEarnings)}
					</div>
				</div>

				<!-- Total Payments -->
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">Выплачено</h3>
					</div>
					<div class="text-3xl font-bold text-green-400">
						{formatCurrency(financialData.totalPayments)}
					</div>
				</div>

				<!-- Pending Payments -->
				<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-center">
						<svg
							class="mr-3 h-8 w-8 text-yellow-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">К выплате</h3>
					</div>
					<div class="text-3xl font-bold text-yellow-400">
						{formatCurrency(financialData.pendingPayments)}
					</div>
				</div>

				<!-- Individual Bonuses -->
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
								d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">Бонусы</h3>
					</div>
					<div class="text-3xl font-bold text-purple-400">
						{formatCurrency(financialData.individualBonuses)}
					</div>
				</div>
			</div>

			<!-- Recent Transactions -->
			<div class="mb-8 rounded-lg bg-white/5 p-8 backdrop-blur-sm">
				<h2 class="mb-6 text-2xl font-semibold tracking-wide text-white">Последние операции</h2>

				<div class="overflow-x-auto">
					<table class="w-full text-left">
						<thead>
							<tr class="border-b border-white/10 text-gray-300">
								<th class="pb-4 pr-4 font-medium">Дата</th>
								<th class="pb-4 pr-4 font-medium">Описание</th>
								<th class="pb-4 pr-4 font-medium">Тип</th>
								<th class="pb-4 pr-4 text-right font-medium">Сумма</th>
								<th class="pb-4 pl-4 text-right font-medium">Статус</th>
							</tr>
						</thead>
						<tbody>
							{#each financialData.recentTransactions as transaction}
								<tr class="border-b border-white/5 text-white">
									<td class="py-4 pr-4 text-sm">
										{formatDate(transaction.date)}
									</td>
									<td class="py-4 pr-4">
										{transaction.description}
									</td>
									<td class="py-4 pr-4">
										<span
											class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {transaction.type ===
											'payment'
												? 'bg-blue-100 text-blue-800'
												: 'bg-purple-100 text-purple-800'}"
										>
											{transaction.type === 'payment' ? 'Выплата' : 'Бонус'}
										</span>
									</td>
									<td class="py-4 pr-4 text-right font-mono">
										{formatCurrency(transaction.amount)}
									</td>
									<td class="py-4 pl-4 text-right">
										<span class="inline-flex items-center {getStatusColor(transaction.status)}">
											<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
												{#if transaction.status === 'completed'}
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clip-rule="evenodd"
													/>
												{:else}
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
														clip-rule="evenodd"
													/>
												{/if}
											</svg>
											{getStatusText(transaction.status)}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Navigation Actions -->
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
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
					<a href="/projects" class="font-medium text-purple-400 hover:text-purple-300">
						Управлять →
					</a>
				</div>

				<!-- Reports Section -->
				<!-- <div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
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
								d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
						<h3 class="text-xl font-semibold text-white">Отчёты</h3>
					</div>
					<button class="font-medium text-green-400 hover:text-green-300"> Скачать → </button>
				</div> -->
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

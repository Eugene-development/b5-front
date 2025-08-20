<script>
	import { auth } from '$lib/state/auth.svelte.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchProjectsByAgent } from '$lib/api/projects.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// State
	let projects = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let retryCount = $state(0);

	// Pagination from server-side load
	let currentPage = $state(data.pagination.currentPage);
	let perPage = $state(data.pagination.perPage);
	let total = $state(0);
	let lastPage = $state(1);

	// Update pagination when data changes (for navigation)
	$effect(() => {
		currentPage = data.pagination.currentPage;
		perPage = data.pagination.perPage;
	});

	// Load projects on mount
	onMount(async () => {
		// Check authentication first
		if (!checkAuthentication()) {
			return; // Exit early if not authenticated
		}

		// Load projects if authenticated
		await loadProjects();
	});

	// Check if user is authenticated
	function checkAuthentication() {
		if (!auth.isAuthenticated) {
			goto('/login?redirectTo=/projects');
			return false;
		}

		if (!auth.emailVerified) {
			goto('/email-verify');
			return false;
		}

		return true;
	}

	// Load projects from GraphQL API
	async function loadProjects(pageNum = currentPage, isRetry = false) {
		// Check authentication before loading projects
		if (!auth.isAuthenticated || !auth.user?.id) {
			console.error('User not authenticated or missing user ID');
			error = 'Необходима авторизация для просмотра проектов';
			loading = false;
			return;
		}

		try {
			loading = true;
			error = null;

			// Track retry attempts
			if (isRetry) {
				retryCount++;
			} else {
				retryCount = 0;
			}

			const result = await fetchProjectsByAgent({
				agentId: auth.user.id,
				page: pageNum,
				first: perPage
			});
			console.log('Projects loaded:', result);

			projects = result.data || [];
			currentPage = result.paginatorInfo.currentPage || pageNum;
			lastPage = result.paginatorInfo.lastPage || 1;
			total = result.paginatorInfo.total || projects.length;
			perPage = result.paginatorInfo.perPage || perPage;

			// Reset retry count on successful load
			retryCount = 0;
		} catch (err) {
			console.error('Failed to load projects (GraphQL):', err);

			// Handle different types of errors with specific messages
			if (err.response?.status === 401 || err.response?.status === 403) {
				error = 'Ошибка авторизации. Пожалуйста, войдите в систему заново.';
				// Redirect to login on auth errors
				goto('/login?redirectTo=/projects');
			} else if (err.response?.status === 404) {
				error = 'Сервис временно недоступен. Попробуйте позже.';
			} else if (err.response?.status >= 500) {
				error = 'Ошибка сервера. Попробуйте повторить запрос.';
			} else if (err.name === 'AbortError' || err.message?.includes('timeout')) {
				error = 'Превышено время ожидания. Проверьте подключение к интернету.';
			} else if (err.message?.includes('Network')) {
				error = 'Ошибка сети. Проверьте подключение к интернету.';
			} else {
				error = `Не удалось загрузить проекты. ${retryCount > 0 ? `Попытка ${retryCount + 1}.` : 'Попробуйте еще раз.'}`;
			}
		} finally {
			loading = false;
		}
	}

	// Retry function with enhanced feedback
	async function retryLoadProjects() {
		if (loading) return; // Prevent multiple simultaneous requests
		await loadProjects(currentPage, true);
	}

	// Navigate to a specific page
	function navigateToPage(pageNum) {
		if (pageNum < 1 || pageNum > lastPage || loading) return;
		loadProjects(pageNum);
	}

	function getStatusBadge(is_active) {
		return is_active
			? 'bg-green-500/20 text-green-400 border-green-500/30'
			: 'bg-gray-500/20 text-gray-400 border-gray-500/30';
	}
</script>

{#if auth.loading}
	<div class="flex min-h-screen items-center justify-center bg-gray-900">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-400"></div>
			<p class="mt-4 text-gray-300">Проверка авторизации...</p>
		</div>
	</div>
{:else if !auth.isAuthenticated}
	<div class="flex min-h-screen items-center justify-center bg-gray-900">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-red-400"></div>
			<p class="mt-4 text-gray-300">Перенаправление на страницу входа...</p>
		</div>
	</div>
{:else if !auth.emailVerified}
	<div class="flex min-h-screen items-center justify-center bg-gray-900">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400"></div>
			<p class="mt-4 text-gray-300">Перенаправление на подтверждение email...</p>
		</div>
	</div>
{:else}
	<div class="relative isolate bg-gray-900 py-24 sm:py-32">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto mb-10 text-center">
				<h1 class="text-4xl font-normal tracking-widest text-white sm:text-6xl">Проекты</h1>
				<p class="mt-6 text-lg/8 text-gray-300">Ваши проекты из базы Bonus5 (GraphQL)</p>
			</div>

			{#if error}
				<div class="mb-8 rounded-lg border border-red-500/30 bg-red-500/20 p-4 backdrop-blur-sm">
					<div class="flex items-start justify-between">
						<div class="flex items-start">
							<svg
								class="mr-3 mt-0.5 h-6 w-6 flex-shrink-0 text-red-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<p class="text-sm font-medium text-red-300">{error}</p>
								{#if retryCount > 0}
									<p class="mt-1 text-xs text-red-400">Попыток повтора: {retryCount}</p>
								{/if}
							</div>
						</div>
						<div class="flex flex-col gap-2 sm:flex-row">
							<button
								class="rounded bg-red-500/20 px-3 py-1 text-sm text-red-300 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
								onclick={retryLoadProjects}
								disabled={loading}
							>
								{#if loading}
									<div class="flex items-center">
										<div
											class="mr-2 h-3 w-3 animate-spin rounded-full border border-red-300 border-t-transparent"
										></div>
										Загрузка...
									</div>
								{:else}
									Повторить
								{/if}
							</button>
							<button
								class="rounded bg-gray-500/20 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-500/30"
								onclick={() => {
									error = null;
								}}
							>
								Скрыть
							</button>
						</div>
					</div>
				</div>
			{/if}

			<div class="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-white">Список проектов</h2>
					<div class="flex items-center gap-4">
						<div class="text-sm text-gray-300">Всего: {total}</div>
						<button
							class="rounded bg-indigo-500/20 px-3 py-1 text-sm text-indigo-300 transition-colors hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
							onclick={retryLoadProjects}
							disabled={loading}
							title="Обновить список проектов"
						>
							{#if loading}
								<div class="flex items-center">
									<div
										class="mr-2 h-3 w-3 animate-spin rounded-full border border-indigo-300 border-t-transparent"
									></div>
									Обновление...
								</div>
							{:else}
								<div class="flex items-center">
									<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									Обновить
								</div>
							{/if}
						</button>
					</div>
				</div>

				{#if loading}
					<div class="flex flex-col items-center justify-center py-12">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-400"></div>
						<p class="mt-4 text-sm text-gray-400">
							{retryCount > 0
								? `Повторная попытка загрузки... (${retryCount})`
								: 'Загрузка проектов...'}
						</p>
					</div>
				{:else if projects.length === 0 && !error}
					<div class="py-12 text-center">
						<svg
							class="mx-auto h-12 w-12 text-gray-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<h3 class="mt-4 text-lg font-medium text-gray-300">Проекты не найдены</h3>
						<p class="mt-2 text-sm text-gray-400">
							У вас пока нет назначенных проектов. Обратитесь к администратору для получения доступа
							к проектам.
						</p>
						<button
							class="mt-4 rounded bg-indigo-500/20 px-4 py-2 text-sm text-indigo-300 transition-colors hover:bg-indigo-500/30"
							onclick={retryLoadProjects}
						>
							Обновить список
						</button>
					</div>
				{:else}
					<div class="relative overflow-x-auto">
						{#if loading && projects.length > 0}
							<div
								class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
							>
								<div class="flex items-center rounded-lg bg-gray-800/90 px-4 py-2">
									<div
										class="mr-3 h-4 w-4 animate-spin rounded-full border border-indigo-400 border-t-transparent"
									></div>
									<span class="text-sm text-gray-300">Обновление данных...</span>
								</div>
							</div>
						{/if}
						<table class="min-w-full divide-y divide-gray-700">
							<thead>
								<tr class="text-left text-xs uppercase tracking-wider text-gray-400">
									<th class="px-4 py-3">ID</th>
									<th class="px-4 py-3">Название</th>
									<th class="px-4 py-3">Город</th>
									<th class="px-4 py-3">Сумма</th>
									<th class="px-4 py-3">Плановая дата</th>
									<th class="px-4 py-3">Статус</th>
									<th class="px-4 py-3">Создан</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-800">
								{#each projects as p}
									<tr class="text-sm text-gray-200 {loading ? 'opacity-75' : ''}">
										<td class="px-4 py-3">{p.id}</td>
										<td class="px-4 py-3">{p.value || '-'}</td>
										<td class="px-4 py-3">{p.city || '-'}</td>
										<td class="px-4 py-3">{p.contract_amount ?? '-'}</td>
										<td class="px-4 py-3">{p.planned_completion_date || '-'}</td>
										<td class="px-4 py-3">
											<span
												class={`rounded border px-2 py-1 text-xs ${getStatusBadge(p.is_active)}`}
											>
												{p.is_active ? 'Активный' : 'Неактивный'}
											</span>
										</td>
										<td class="px-4 py-3">{p.created_at?.slice(0, 10) || '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Pagination -->
					<div class="mt-6 flex items-center justify-between">
						<button
							class="rounded bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
							onclick={() => navigateToPage(currentPage - 1)}
							disabled={currentPage <= 1 || loading}
						>
							{#if loading && currentPage > 1}
								<div class="flex items-center">
									<div
										class="mr-2 h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"
									></div>
									Назад
								</div>
							{:else}
								Назад
							{/if}
						</button>
						<div class="text-sm text-gray-300">
							Страница {currentPage} из {lastPage}
							{#if total > 0}
								<span class="text-gray-400"> • Всего: {total}</span>
							{/if}
						</div>
						<button
							class="rounded bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
							onclick={() => navigateToPage(currentPage + 1)}
							disabled={currentPage >= lastPage || loading}
						>
							{#if loading && currentPage < lastPage}
								<div class="flex items-center">
									Вперёд
									<div
										class="ml-2 h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"
									></div>
								</div>
							{:else}
								Вперёд
							{/if}
						</button>
					</div>
				{/if}
			</div>

			<!-- Navigation Cards -->
			<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
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
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">Дашборд</h3>
					</div>
					<a href="/dashboard" class="font-medium text-blue-400 hover:text-blue-300">
						Вернуться →
					</a>
				</div>

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
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">Профиль</h3>
					</div>
					<a href="/profile" class="font-medium text-indigo-400 hover:text-indigo-300">
						Просмотреть →
					</a>
				</div>

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
							/>
						</svg>
						<h3 class="text-xl font-semibold text-white">Финансы</h3>
					</div>
					<a href="/finances" class="font-medium text-green-400 hover:text-green-300">
						Управлять →
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

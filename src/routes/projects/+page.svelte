<script>
	import { auth } from '$lib/state/auth.svelte.js';
	import { getProjects, createProject, updateProject, deleteProject } from '$lib/api/projects.js';
	import { onMount } from 'svelte';

	// State
	let projects = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let selectedProject = $state(null);

	// Form data
	let newProject = $state({
		name: '',
		description: '',
		status: 'active'
	});

	let editProject = $state({
		name: '',
		description: '',
		status: 'active'
	});

	// Load projects on mount
	onMount(async () => {
		await loadProjects();
	});

	// Load projects from API
	async function loadProjects() {
		try {
			loading = true;
			error = null;
			const response = await getProjects();
			projects = response.projects || [];
		} catch (err) {
			console.error('Failed to load projects:', err);
			error = 'Не удалось загрузить проекты';
		} finally {
			loading = false;
		}
	}

	// Create new project
	async function handleCreateProject(event) {
		event.preventDefault();
		try {
			loading = true;
			await createProject(newProject);
			await loadProjects();
			showCreateModal = false;
			newProject = { name: '', description: '', status: 'active' };
		} catch (err) {
			console.error('Failed to create project:', err);
			error = 'Не удалось создать проект';
		} finally {
			loading = false;
		}
	}

	// Edit project
	async function handleEditProject(event) {
		event.preventDefault();
		try {
			loading = true;
			await updateProject(selectedProject.id, editProject);
			await loadProjects();
			showEditModal = false;
			selectedProject = null;
		} catch (err) {
			console.error('Failed to update project:', err);
			error = 'Не удалось обновить проект';
		} finally {
			loading = false;
		}
	}

	// Delete project
	async function handleDeleteProject(projectId) {
		if (!confirm('Вы уверены, что хотите удалить этот проект?')) {
			return;
		}

		try {
			loading = true;
			await deleteProject(projectId);
			await loadProjects();
		} catch (err) {
			console.error('Failed to delete project:', err);
			error = 'Не удалось удалить проект';
		} finally {
			loading = false;
		}
	}

	// Open edit modal
	function openEditModal(project) {
		selectedProject = project;
		editProject = {
			name: project.name,
			description: project.description || '',
			status: project.status
		};
		showEditModal = true;
	}

	// Get status badge color
	function getStatusColor(status) {
		switch (status) {
			case 'active':
				return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'completed':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
			case 'paused':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	}

	// Get status text
	function getStatusText(status) {
		switch (status) {
			case 'active':
				return 'Активный';
			case 'completed':
				return 'Завершен';
			case 'paused':
				return 'Приостановлен';
			default:
				return 'Неизвестно';
		}
	}
</script>

<div class="relative isolate bg-gray-900 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Page Header -->
		<div class="mx-auto mb-16 text-center">
			<h1 class="text-4xl font-normal tracking-widest text-white sm:text-6xl">Проекты</h1>
			<p class="mt-6 text-lg/8 text-gray-300">Управление вашими активными проектами</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="mb-8 rounded-lg border border-red-500/30 bg-red-500/20 p-4 backdrop-blur-sm">
				<div class="flex items-center">
					<svg
						class="mr-3 h-6 w-6 text-red-400"
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
					<p class="text-sm font-medium text-red-300">{error}</p>
				</div>
			</div>
		{/if}

		<!-- Create Project Button -->
		<div class="mb-8 flex items-center justify-between">
			<h2 class="text-2xl font-semibold tracking-wide text-white">Мои проекты</h2>
			<button
				onclick={() => (showCreateModal = true)}
				class="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-600"
			>
				+ Создать проект
			</button>
		</div>

		<!-- Projects Table -->
		<div class="rounded-lg bg-white/5 backdrop-blur-sm">
			{#if loading}
				<div class="flex items-center justify-center p-8">
					<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-400"></div>
					<span class="ml-3 text-gray-300">Загрузка проектов...</span>
				</div>
			{:else if projects.length === 0}
				<div class="p-8 text-center">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium text-gray-300">Нет проектов</h3>
					<p class="mt-2 text-gray-400">Создайте свой первый проект, чтобы начать работу.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-700">
						<thead class="bg-white/5">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
								>
									Название
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
								>
									Описание
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
								>
									Статус
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
								>
									Дата создания
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
								>
									Действия
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-700 bg-white/5">
							{#each projects as project}
								<tr class="hover:bg-white/10">
									<td class="whitespace-nowrap px-6 py-4">
										<div class="text-sm font-medium text-white">{project.name}</div>
									</td>
									<td class="px-6 py-4">
										<div class="text-sm text-gray-300">
											{project.description || 'Нет описания'}
										</div>
									</td>
									<td class="whitespace-nowrap px-6 py-4">
										<span
											class="inline-flex rounded-full border px-2 py-1 text-xs font-medium {getStatusColor(
												project.status
											)}"
										>
											{getStatusText(project.status)}
										</span>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
										{new Date(project.created_at).toLocaleDateString('ru-RU')}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
										<div class="flex space-x-2">
											<button
												onclick={() => openEditModal(project)}
												class="text-indigo-400 hover:text-indigo-300"
											>
												Редактировать
											</button>
											<button
												onclick={() => handleDeleteProject(project.id)}
												class="text-red-400 hover:text-red-300"
											>
												Удалить
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Create Project Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
			<h3 class="mb-4 text-lg font-medium text-white">Создать новый проект</h3>

			<form onsubmit={handleCreateProject}>
				<div class="mb-4">
					<label for="project-name" class="mb-2 block text-sm font-medium text-gray-300">
						Название проекта *
					</label>
					<input
						id="project-name"
						type="text"
						bind:value={newProject.name}
						required
						class="w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Введите название проекта"
					/>
				</div>

				<div class="mb-4">
					<label for="project-description" class="mb-2 block text-sm font-medium text-gray-300">
						Описание
					</label>
					<textarea
						id="project-description"
						bind:value={newProject.description}
						rows="3"
						class="w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Введите описание проекта"
					></textarea>
				</div>

				<div class="mb-6">
					<label for="project-status" class="mb-2 block text-sm font-medium text-gray-300">
						Статус
					</label>
					<select
						id="project-status"
						bind:value={newProject.status}
						class="w-full rounded-md bg-white/10 px-3 py-2 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						<option value="active">Активный</option>
						<option value="paused">Приостановлен</option>
						<option value="completed">Завершен</option>
					</select>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
					>
						Отмена
					</button>
					<button
						type="submit"
						disabled={loading}
						class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
					>
						{loading ? 'Создание...' : 'Создать'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Project Modal -->
{#if showEditModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
			<h3 class="mb-4 text-lg font-medium text-white">Редактировать проект</h3>

			<form onsubmit={handleEditProject}>
				<div class="mb-4">
					<label for="edit-project-name" class="mb-2 block text-sm font-medium text-gray-300">
						Название проекта *
					</label>
					<input
						id="edit-project-name"
						type="text"
						bind:value={editProject.name}
						required
						class="w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Введите название проекта"
					/>
				</div>

				<div class="mb-4">
					<label
						for="edit-project-description"
						class="mb-2 block text-sm font-medium text-gray-300"
					>
						Описание
					</label>
					<textarea
						id="edit-project-description"
						bind:value={editProject.description}
						rows="3"
						class="w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Введите описание проекта"
					></textarea>
				</div>

				<div class="mb-6">
					<label for="edit-project-status" class="mb-2 block text-sm font-medium text-gray-300">
						Статус
					</label>
					<select
						id="edit-project-status"
						bind:value={editProject.status}
						class="w-full rounded-md bg-white/10 px-3 py-2 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						<option value="active">Активный</option>
						<option value="paused">Приостановлен</option>
						<option value="completed">Завершен</option>
					</select>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => (showEditModal = false)}
						class="rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
					>
						Отмена
					</button>
					<button
						type="submit"
						disabled={loading}
						class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
					>
						{loading ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

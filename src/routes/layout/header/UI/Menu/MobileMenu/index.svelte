<script>
	import { visibleMobileMenu, closeMobileMenu } from '$lib/state/visibleMobileMenu.svelte';
	import { auth, logout } from '$lib/state/auth.svelte.js';
	import { goto } from '$app/navigation';

	// Handle backdrop click to close menu
	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			closeMobileMenu();
		}
	}

	// Handle backdrop keydown to close menu
	function handleBackdropKeydown(event) {
		if (event.key === 'Escape') {
			closeMobileMenu();
		}
	}

	// Handle menu content click to prevent closing
	function handleMenuClick(event) {
		event.stopPropagation();
	}
</script>

{#if visibleMobileMenu.value}
	<!-- Mobile menu, show/hide based on menu open state. -->
	<div class="lg:hidden" role="dialog" aria-modal="true">
		<!-- Background backdrop, show/hide based on slide-over state. -->
		<div
			class="fixed inset-0 z-10"
			onclick={handleBackdropClick}
			onkeydown={handleBackdropKeydown}
			tabindex="0"
			role="button"
			aria-label="Close mobile menu"
		></div>
		<div
			class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10"
			onclick={handleMenuClick}
			onkeydown={handleBackdropKeydown}
			role="dialog"
			aria-label="Mobile navigation menu"
			tabindex="0"
		>
			<div class="flex items-center justify-between">
				<!-- <a href="#" class="-m-1.5 p-1.5">
          <span class="sr-only">Your Company</span>
          <img class="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="">
        </a> -->
				<button
					onclick={closeMobileMenu}
					type="button"
					class="-m-2.5 rounded-md p-2.5 text-gray-400"
				>
					<span class="sr-only">Close menu</span>
					<svg
						class="size-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						aria-hidden="true"
						data-slot="icon"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="mt-6 flow-root">
				<div class="-my-6 divide-y divide-gray-500/25">
					<div class="space-y-2 py-6">
						<!-- <a
							href="/oferta"
							class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
							>Оферта</a
						> -->
						<a
							href="/"
							onclick={() => (visibleMobileMenu.value = false)}
							class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
							>Главная</a
						>
						<a
							href="/about"
							onclick={() => (visibleMobileMenu.value = false)}
							class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
							>О проекте</a
						>
						<a
							href="/payments"
							onclick={() => (visibleMobileMenu.value = false)}
							class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
							>Выплаты</a
						>
						<a
							href="/152fz"
							onclick={() => (visibleMobileMenu.value = false)}
							class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
							>152 ФЗ</a
						>
					</div>
					<div class="py-6">
						{#if auth.isAuthenticated}
							<!-- Dashboard Section -->
							<a
								href="/dashboard"
								onclick={closeMobileMenu}
								class="-mx-3 mb-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800"
							>
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
										d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
									/>
								</svg>
								Дашборд
							</a>

							<!-- Profile Section -->
							<a
								href="/profile"
								onclick={closeMobileMenu}
								class="-mx-3 mb-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800"
							>
								<svg
									class="mr-3 h-6 w-6 text-indigo-400"
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
								Профиль
							</a>

							<!-- Projects Section -->
							<a
								href="/projects"
								onclick={closeMobileMenu}
								class="-mx-3 mb-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800"
							>
								<svg
									class="mr-3 h-6 w-6 text-purple-400"
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
								Проекты
							</a>

							<!-- Finances Section -->
							<a
								href="/finances"
								onclick={closeMobileMenu}
								class="-mx-3 mb-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800"
							>
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
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
									/>
								</svg>
								Финансы
							</a>

							<!-- Logout Button -->
							<button
								onclick={async () => {
									await logout();
									closeMobileMenu();
									goto('/');
								}}
								class="-mx-3 mt-4 flex w-full items-center rounded-lg px-3 py-2.5 text-left text-base/7 font-semibold text-white hover:bg-gray-800"
							>
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
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
								Выход
							</button>
						{:else}
							<a
								href="/login"
								onclick={closeMobileMenu}
								class="-mx-3 mb-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800"
							>
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
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									/>
								</svg>
								Вход
							</a>
							<a
								href="/registration"
								onclick={closeMobileMenu}
								class="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800"
							>
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
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
								Регистрация
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

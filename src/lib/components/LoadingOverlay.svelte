<script>
	import { onMount } from 'svelte';

	let { show = false, message = 'Загрузка...' } = $props();

	// Prevent body scroll when loading overlay is shown
	$effect(() => {
		if (show) {
			document.body.style.overflow = 'hidden';
		} else {
			// Более надежный сброс overflow
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		}
	});

	// Дополнительная защита при размонтировании компонента
	onMount(() => {
		return () => {
			// Гарантированно сбрасываем overflow при размонтировании
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		};
	});
</script>

{#if show}
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
		style="overflow: hidden;"
	>
		<div
			class="flex flex-col items-center space-y-4 rounded-xl border border-gray-700 bg-gray-900/95 p-8 shadow-2xl"
		>
			<!-- Spinner -->
			<div class="relative">
				<div
					class="h-16 w-16 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-400"
				></div>
				<div
					class="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-pink-400"
					style="animation-delay: -0.5s;"
				></div>
			</div>

			<!-- Message -->
			<p class="text-center text-xl font-semibold text-white">{message}</p>

			<!-- Dots animation -->
			<div class="flex space-x-2">
				<div
					class="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
					style="animation-delay: 0s;"
				></div>
				<div
					class="h-3 w-3 animate-bounce rounded-full bg-pink-400"
					style="animation-delay: 0.1s;"
				></div>
				<div
					class="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
					style="animation-delay: 0.2s;"
				></div>
			</div>
		</div>
	</div>
{/if}

/**
 * Performance Optimization Utilities
 * Provides tools for monitoring, optimizing, and debugging performance
 */

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to call immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
	let timeout;

	return function executedFunction(...args) {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};

		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (callNow) func.apply(this, args);
	};
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
	let inThrottle;

	return function (...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

/**
 * Lazy load function for dynamic imports
 * @param {Function} importFn - Dynamic import function
 * @param {Object} options - Loading options
 * @returns {Promise} Component or module
 */
export async function lazyLoad(importFn, options = {}) {
	const { retries = 3, delay = 1000 } = options;

	for (let i = 0; i <= retries; i++) {
		try {
			const module = await importFn();
			return module;
		} catch (error) {
			if (i === retries) {
				console.error('Failed to lazy load after retries:', error);
				throw error;
			}

			// Wait before retry
			await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
		}
	}
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
	constructor() {
		this.marks = new Map();
		this.measures = [];
	}

	/**
	 * Start timing measurement
	 * @param {string} name - Measurement name
	 */
	start(name) {
		const markName = `${name}-start`;
		if (typeof performance !== 'undefined') {
			performance.mark(markName);
		}
		this.marks.set(name, Date.now());
	}

	/**
	 * End timing measurement
	 * @param {string} name - Measurement name
	 * @returns {number} Duration in milliseconds
	 */
	end(name) {
		const startTime = this.marks.get(name);
		if (!startTime) {
			console.warn(`No start mark found for: ${name}`);
			return 0;
		}

		const duration = Date.now() - startTime;
		const endMarkName = `${name}-end`;
		const measureName = `${name}-measure`;

		if (typeof performance !== 'undefined') {
			performance.mark(endMarkName);
			performance.measure(measureName, `${name}-start`, endMarkName);
		}

		this.measures.push({ name, duration, timestamp: Date.now() });
		this.marks.delete(name);

		if (import.meta.env.DEV) {
			console.log(`⏱️ ${name}: ${duration}ms`);
		}

		return duration;
	}

	/**
	 * Get all measurements
	 * @returns {Array} Array of measurements
	 */
	getMeasures() {
		return [...this.measures];
	}

	/**
	 * Clear all measurements
	 */
	clear() {
		this.marks.clear();
		this.measures = [];

		if (typeof performance !== 'undefined') {
			performance.clearMarks();
			performance.clearMeasures();
		}
	}
}

/**
 * Global performance monitor instance
 */
export const perfMonitor = new PerformanceMonitor();

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
	if (typeof performance === 'undefined' || !performance.memory) {
		return null;
	}

	return {
		used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
		total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
		limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
	};
}

/**
 * Log memory usage
 */
export function logMemoryUsage(label = 'Memory') {
	const memory = getMemoryUsage();
	if (memory && import.meta.env.DEV) {
		console.log(`🧠 ${label}: ${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
	}
}

/**
 * Intersection Observer for lazy loading
 * @param {Function} callback - Callback when element is visible
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver} Observer instance
 */
export function createIntersectionObserver(callback, options = {}) {
	const defaultOptions = {
		root: null,
		rootMargin: '50px',
		threshold: 0.1,
		...options
	};

	if (typeof IntersectionObserver === 'undefined') {
		// Fallback for older browsers
		return {
			observe: () => callback(),
			unobserve: () => {},
			disconnect: () => {}
		};
	}

	return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 */
export function preloadResources(resources) {
	if (typeof document === 'undefined') return;

	resources.forEach((resource) => {
		const link = document.createElement('link');
		link.rel = 'preload';

		// Determine resource type
		if (resource.endsWith('.css')) {
			link.as = 'style';
		} else if (resource.endsWith('.js')) {
			link.as = 'script';
		} else if (/\.(woff2?|ttf|eot)$/.test(resource)) {
			link.as = 'font';
			link.crossOrigin = 'anonymous';
		} else if (/\.(jpg|jpeg|png|webp|avif)$/.test(resource)) {
			link.as = 'image';
		}

		link.href = resource;
		document.head.appendChild(link);
	});
}

/**
 * Optimize images with lazy loading
 * @param {string} src - Image source
 * @param {Object} options - Options
 * @returns {Object} Image configuration
 */
export function optimizeImage(src, options = {}) {
	const { lazy = true, quality = 80, format = 'webp', sizes = '100vw' } = options;

	// Basic optimization (in real app, this would integrate with image CDN)
	const optimizedSrc = src; // Placeholder for actual optimization

	return {
		src: optimizedSrc,
		loading: lazy ? 'lazy' : 'eager',
		decoding: 'async',
		sizes
	};
}

/**
 * Bundle size analyzer (development only)
 */
export function analyzeBundleSize() {
	if (!import.meta.env.DEV) return;

	// This would integrate with build tools to analyze bundle size
	console.log('📦 Bundle size analysis would go here');
}

/**
 * Connection quality detection
 */
export function getConnectionQuality() {
	if (typeof navigator === 'undefined' || !navigator.connection) {
		return { effectiveType: 'unknown', downlink: 0 };
	}

	const connection = navigator.connection;
	return {
		effectiveType: connection.effectiveType,
		downlink: connection.downlink,
		rtt: connection.rtt,
		saveData: connection.saveData
	};
}

/**
 * Adaptive loading based on connection
 * @param {Object} options - Loading options based on connection
 * @returns {Object} Optimized loading strategy
 */
export function getAdaptiveLoadingStrategy(options = {}) {
	const connection = getConnectionQuality();
	const {
		highQuality = { imageQuality: 90, enableAnimations: true, preloadCount: 10 },
		mediumQuality = { imageQuality: 70, enableAnimations: true, preloadCount: 5 },
		lowQuality = { imageQuality: 50, enableAnimations: false, preloadCount: 2 }
	} = options;

	switch (connection.effectiveType) {
		case '4g':
			return highQuality;
		case '3g':
			return mediumQuality;
		case '2g':
		case 'slow-2g':
			return lowQuality;
		default:
			return mediumQuality;
	}
}

/**
 * Critical resource loading priority
 */
export const RESOURCE_PRIORITY = {
	CRITICAL: 'high',
	IMPORTANT: 'medium',
	NORMAL: 'low'
};

/**
 * Performance timing decorator
 * @param {string} name - Operation name
 * @returns {Function} Decorator function
 */
export function performanceTiming(name) {
	return function (target, propertyKey, descriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args) {
			perfMonitor.start(name);
			try {
				const result = await originalMethod.apply(this, args);
				return result;
			} finally {
				perfMonitor.end(name);
			}
		};

		return descriptor;
	};
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
	if (typeof window === 'undefined') return false;

	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Optimize animations based on user preference
 * @param {Object} animations - Animation configurations
 * @returns {Object} Optimized animations
 */
export function optimizeAnimations(animations) {
	if (prefersReducedMotion()) {
		// Disable or reduce animations for accessibility
		return {
			...animations,
			duration: Math.min(animations.duration || 300, 200),
			easing: 'ease-out'
		};
	}

	return animations;
}

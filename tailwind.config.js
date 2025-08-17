/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './src/app.html'],
	theme: {
		extend: {
			colors: {
				// Custom color palette if needed
			},
			fontFamily: {
				// Custom fonts if needed
			}
		}
	},
	plugins: [require('tailwindcss-animated')]
};

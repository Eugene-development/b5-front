/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	// Get pagination parameters from URL
	const page = parseInt(url.searchParams.get('page') || '1');
	const perPage = parseInt(url.searchParams.get('perPage') || '10');

	// Return initial page data, authentication will be handled client-side
	return {
		pagination: {
			currentPage: page,
			lastPage: 1,
			total: 0,
			perPage: perPage
		}
	};
}

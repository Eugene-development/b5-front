/**
 * Projects API Client
 * Handles all project-related API operations using GraphQL
 */

import { gql, request } from 'graphql-request';

// GraphQL queries
const PROJECTS_BY_AGENT_QUERY = gql`
	query ProjectsByAgent($user_id: ID!) {
		projectsByAgent(user_id: $user_id) {
			id
			value
			user_id
			city
			description
			is_active
			contract_name
			contract_date
			contract_amount
			agent_percentage
			planned_completion_date
			created_at
			updated_at
		}
	}
`;

// Helper function to make GraphQL requests with proper error handling and retry logic
async function makeGraphQLRequest(
	query,
	variables = {},
	operationName = 'GraphQL operation',
	retries = 3
) {
	let lastError;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

			const result = await request(import.meta.env.VITE_PUBLIC_GRAPHQL_API_URL, query, variables, {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			});

			clearTimeout(timeoutId);
			return result;
		} catch (err) {
			lastError = err;
			console.error(`GraphQL Error in ${operationName} (attempt ${attempt}/${retries}):`, err);

			// Don't retry on authorization errors (401, 403)
			if (err.response?.status === 401 || err.response?.status === 403) {
				throw err;
			}

			// If this is the last attempt, throw the error
			if (attempt === retries) {
				throw err;
			}

			// Wait before retrying (exponential backoff)
			const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

/**
 * Fetch projects for a specific agent with pagination
 * @param {Object} params - Parameters object
 * @param {string|number} params.agentId - Agent ID
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.first=10] - Number of items per page
 * @returns {Promise<Object>} Projects data with pagination info
 */
export async function fetchProjectsByAgent(params) {
	// const { agentId, page = 1, first = 10 } = params;

	const agentId = 38;
	const page = 1;
	const first = 10;

	if (!agentId) {
		throw new Error('Agent ID is required');
	}

	try {
		const variables = { user_id: String(agentId), first, page };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'fetchProjectsByAgent'
		);

		console.log('Projects loaded:', result);

		return {
			data: result.projectsByAgent?.data || []
			// paginatorInfo: result.projectsByAgent?.paginatorInfo || {
			// 	currentPage: page,
			// 	lastPage: 1,
			// 	total: 0,
			// 	perPage: first
			// }
		};
	} catch (err) {
		console.error('Fetch projects by agent failed:', err);
		throw err;
	}
}

/**
 * Get all projects for a specific agent (без пагинации)
 * @param {string|number} agentId - Agent ID
 * @returns {Promise<Array>} Array of projects
 */
export async function getAllProjectsForAgent(agentId) {
	if (!agentId) {
		throw new Error('Agent ID is required');
	}

	try {
		// Используем только user_id, так как GraphQL схема использует @all директиву
		const variables = { user_id: String(agentId) };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'getAllProjectsForAgent'
		);

		console.log('All projects loaded:', result);

		// Возвращаем только массив проектов, без информации о пагинации
		return result.projectsByAgent || [];
	} catch (err) {
		console.error('Get all projects for agent failed:', err);
		throw err;
	}
}

/**
 * Refresh projects data for a specific agent
 * @param {string|number} agentId - Agent ID
 * @param {number} [first=10] - Number of items to fetch
 * @param {number} [page=1] - Page number
 * @returns {Promise<Array>} Array of projects
 */
export async function refreshProjectsForAgent(agentId, first = 10, page = 1) {
	if (!agentId) {
		throw new Error('Agent ID is required');
	}

	try {
		const variables = { user_id: String(agentId), first, page };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'refreshProjectsForAgent'
		);
		return result.projectsByAgent?.data || [];
	} catch (err) {
		console.error('Refresh projects for agent failed:', err);
		throw err;
	}
}

/**
 * Get projects for a specific agent with pagination info (for consistency with b5-admin)
 * @param {string|number} agentId - Agent ID
 * @param {number} [first=10] - Number of items to fetch
 * @param {number} [page=1] - Page number
 * @returns {Promise<Object>} Projects data with pagination info
 */
export async function getProjectsForAgentWithPagination(agentId, first = 10, page = 1) {
	if (!agentId) {
		throw new Error('Agent ID is required');
	}

	try {
		const variables = { user_id: String(agentId), first, page };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'getProjectsForAgentWithPagination'
		);
		return {
			data: result.projectsByAgent?.data || [],
			paginatorInfo: result.projectsByAgent?.paginatorInfo || null
		};
	} catch (err) {
		console.error('Get projects for agent with pagination failed:', err);
		throw err;
	}
}

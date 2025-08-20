/**
 * Projects API Client
 * Handles all project-related API operations using GraphQL
 */

import { gql, request } from 'graphql-request';

// GraphQL queries
const PROJECTS_BY_AGENT_QUERY = gql`
	query ProjectsByAgent($agent_id: ID!, $page: Int, $first: Int) {
		projectsByAgent(agent_id: $agent_id, page: $page, first: $first) {
			data {
				id
				value
				agent_id
				agent {
					id
					name
					email
				}
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
			paginatorInfo {
				count
				currentPage
				firstItem
				hasMorePages
				lastItem
				lastPage
				perPage
				total
			}
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
	const { agentId, page = 1, first = 10 } = params;
	
	if (!agentId) {
		throw new Error('Agent ID is required');
	}

	try {
		const variables = { agent_id: String(agentId), first, page };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'fetchProjectsByAgent'
		);
		
		return {
			data: result.projectsByAgent?.data || [],
			paginatorInfo: result.projectsByAgent?.paginatorInfo || {
				currentPage: page,
				lastPage: 1,
				total: 0,
				perPage: first
			}
		};
	} catch (err) {
		console.error('Fetch projects by agent failed:', err);
		throw err;
	}
}

/**
 * Get all projects for a specific agent
 * @param {string|number} agentId - Agent ID
 * @param {number} [first=1000] - Number of items to fetch
 * @param {number} [page=1] - Page number
 * @returns {Promise<Array>} Array of projects
 */
export async function getAllProjectsForAgent(agentId, first = 1000, page = 1) {
	if (!agentId) {
		throw new Error('Agent ID is required');
	}

	try {
		const variables = { agent_id: String(agentId), first, page };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'getAllProjectsForAgent'
		);
		return result.projectsByAgent?.data || [];
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
		const variables = { agent_id: String(agentId), first, page };
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
		const variables = { agent_id: String(agentId), first, page };
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

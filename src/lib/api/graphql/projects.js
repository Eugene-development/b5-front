// GraphQL API for Projects

import { gql, request } from 'graphql-request';

// GraphQL queries
const PROJECTS_BY_AGENT_QUERY = gql`
	query ProjectsByAgent($agent_id: ID!, $page: Int, $first: Int) {
		projectsByAgent(agent_id: $agent_id, page: $page, first: $first) {
			data {
				id
				value
				city
				description
				is_active
				contract_name
				contract_amount
				planned_completion_date
				created_at
			}
			paginatorInfo {
				currentPage
				lastPage
				total
				perPage
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

			const result = await request(import.meta.env.VITE_B5_API_URL, query, variables, {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			});

			clearTimeout(timeoutId);
			return result;
		} catch (err) {
			lastError = err;
			console.error(`GraphQL Error in ${operationName} (attempt ${attempt}/${retries}):`, err);

			// Don't retry on certain error types
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
 * Fetch projects by agent (current user) with pagination
 * @param {{ agentId: number|string, page?: number, first?: number }} params
 * @returns {Promise<{ data: Array<any>, paginatorInfo: { currentPage: number, lastPage: number, total: number, perPage: number } }>}
 */
export async function fetchProjectsByAgent(params) {
	try {
		const { agentId, page = 1, first = 10 } = params;
		const variables = { agent_id: String(agentId), page, first };
		const result = await makeGraphQLRequest(
			PROJECTS_BY_AGENT_QUERY,
			variables,
			'fetchProjectsByAgent'
		);

		const node = result?.projectsByAgent || {
			data: [],
			paginatorInfo: { currentPage: 1, lastPage: 1, total: 0, perPage: first }
		};

		return {
			data: node.data ?? [],
			paginatorInfo: node.paginatorInfo ?? {
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

// Function to get all projects for agent (alias for consistency)
export async function getAllProjectsForAgent(agentId, first = 1000, page = 1) {
	try {
		const variables = { agent_id: String(agentId), page, first };
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

// Function to refresh projects data (alias for consistency)
export async function refreshProjectsForAgent(agentId, first = 10, page = 1) {
	try {
		const variables = { agent_id: String(agentId), page, first };
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

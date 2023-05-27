import { createError, getHeaders } from 'h3';
import type { H3Event } from 'h3';

/**
 * Validates that the request Authorization header matches the configured admin token.
 * Throws a 403 HTTP error if invalid or unauthorized.
 */
export function verifyAdmin(event: H3Event): boolean {
    const headers = getHeaders(event);
    const authorization = headers.authorization;
    const { adminToken } = useRuntimeConfig();

    if (!adminToken || !authorization || authorization !== adminToken) {
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        });
    }

    return true;
}

/**
 * Checks whether the request Authorization header matches the configured admin token without throwing.
 */
export function isAdminRequest(event: H3Event): boolean {
    const headers = getHeaders(event);
    const authorization = headers.authorization;
    const { adminToken } = useRuntimeConfig();

    return Boolean(adminToken && authorization && authorization === adminToken);
}

import { createError, getHeaders } from 'h3';
import type { H3Event } from 'h3';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type { User } from '../../typings/game';

declare module 'h3' {
    interface H3EventContext {
        cloudflare: {
            env: {
                players: KVNamespace;
                questions: KVNamespace;
            }
        };
    }
}

export async function getUser(event: H3Event): Promise<User> {
    const headers = getHeaders(event);

    if (!headers.authorization) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Your request is missing an Authorization header.',
        });
    }

    const authToken = headers.authorization.replace(/^Bearer /, '');

    const { jwtSecret } = useRuntimeConfig();

    let isValid;
    try {
        isValid = await jwt.verify(authToken, jwtSecret);
    } catch (e) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Your authorization token cannot be verified.',
        });
    }

    if (!isValid) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Your authorization token is invalid.',
        });
    }

    const jwtPayload = jwt.decode(authToken);

    const { discordId, name, avatar } = jwtPayload.payload;
    if (!discordId || !name || !avatar) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Your authorization token cannot be correctly decoded.',
        });
    }

    return {
        discordId,
        name,
        avatar,
    };
}

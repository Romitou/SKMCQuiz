import { defineEventHandler, getHeaders, getQuery } from 'h3';
import { PrivateGameSession } from '../../../typings/game';

export default defineEventHandler(async (event) => {
    const headers = getHeaders(event);
    const authorization = headers['authorization'];
    if (authorization !== 'zxgYYjyHK7Gu7sjfTGropV9cAieik299FYbouYq4px6wq3zJJuMLkHnJWtFXugaw')
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        })

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const players = await PLAYERS.list();

    const ips: Record<string, string[]> = {};
    for (const playerKey of players.keys) {
        const player = await PLAYERS.get(playerKey.name, { type: 'json' }) as PrivateGameSession;
        if (player && player.ip) {
            if (!ips[player.ip]) ips[player.ip] = [];
            ips[player.ip].push(playerKey.name);
        }
    }

    return ips;
});

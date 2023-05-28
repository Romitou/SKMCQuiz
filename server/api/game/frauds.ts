import { defineEventHandler } from 'h3';
import type { PrivateGameSession } from '../../../typings/game';
import { verifyAdmin } from '../../core/admin';

export default defineEventHandler(async (event) => {
    verifyAdmin(event);

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

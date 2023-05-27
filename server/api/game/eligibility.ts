import { defineEventHandler } from 'h3';
import { getUser } from '../../core/auth';
import type { PrivateGameSession } from '../../../typings/game';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const playerProfile = await PLAYERS.get(user.discordId, { type: 'json' }) as PrivateGameSession;

    if (playerProfile) {
        if (playerProfile.startedAt + 1000 * 60 < Date.now()) {
            return {
                status: 'ALREADY_PLAYED',
                message: 'You have already played a game.',
            };
        } else {
            return {
                status: 'IN_PROGRESS',
                message: 'You have a game in progress.',
            };
        }
    } else {
        // const canStart = Date.now() > 1685210400000 && Date.now() < 1686420000000;
        const canStart = true;
        const isAdmin = user.discordId === '191495299884122112';
        if (!isAdmin && !canStart) {
            return {
                status: 'UNAVAILABLE',
                message: 'The game is not available at this time.',
            };
        }

        return {
            status: 'ELIGIBLE',
            message: 'You are eligible to start a game.',
        };
    }
});

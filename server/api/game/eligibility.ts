import { defineEventHandler } from 'h3';
import { getUser } from '../../core/auth';
import type { PrivateGameSession } from '../../../typings/game';
import { canSummary, isEligible } from '../../core/game';

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
        if (isEligible(user.discordId)) {
            return {
                status: 'ELIGIBLE',
                message: 'You are eligible to start a game.',
            };
        }

        if (canSummary(user.discordId)) {
            return {
                status: 'SUMMARY',
                message: 'The summary is available.',
            };
        }

        return {
            status: 'UNAVAILABLE',
            message: 'The game is not available at this time.',
        };
    }
});

import { createError, defineEventHandler, getHeaders } from 'h3';
import { getRandomQuestion } from '../../core/questions';
import type { GameSession, PrivateGameSession } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getTimeLeft, savePlayer } from '../../core/game';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const playerSession = await PLAYERS.get(user.discordId, { type: 'json' }) as PrivateGameSession;
    if (!playerSession) {
        throw createError({
            statusCode: 403,
            message: 'You have not started a game yet.',
        });
    }
});

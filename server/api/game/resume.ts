import { createError, defineEventHandler } from 'h3';
import { getQuestion } from '../../core/questions';
import type { GameSession, PrivateGameSession } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getTimeLeft } from '../../core/game';

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

    if (playerSession.startedAt + 1000 * 60 < Date.now()) {
        throw createError({
            statusCode: 403,
            message: 'Your game has expired.',
        });
    }

    const currentLevel = Object.keys(playerSession.answers).length + 1;

    const question = await getQuestion(event, playerSession.currentQuestionId, currentLevel, false);
    if (!question) {
        throw createError({
            statusCode: 404,
            message: 'Question not found.',
        });
    }

    return {
        question,
        timeLeft: getTimeLeft(playerSession.startedAt),
        score: playerSession.score,
        answeredQuestions: Object.keys(playerSession.answers).length,
    } as GameSession;
});

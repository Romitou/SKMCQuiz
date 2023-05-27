import { createError, defineEventHandler, getHeaders } from 'h3';
import { getRandomQuestion } from '../../core/questions';
import type { GameSession, PrivateGameSession } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getTimeLeft, savePlayer } from '../../core/game';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    // const canStart = Date.now() > 1685210400000 && Date.now() < 1686420000000;
    const canStart = false;
    const isAdmin = user.discordId === '191495299884122112';
    if (!isAdmin && !canStart) {
        return {
            status: 'UNAVAILABLE',
            message: 'The game is not available at this time.',
        };
    }

    const playerSession = await PLAYERS.get(user.discordId, { type: 'json' }) as PrivateGameSession;
    if (playerSession) {
        throw createError({
            statusCode: 403,
            message: 'You have already started a game.',
        });
    }

    const randomQuestion = await getRandomQuestion(event, 1);
    if (!randomQuestion) {
        throw createError({
            statusCode: 404,
            message: 'Question not found.',
        });
    }

    const headers = getHeaders(event);
    const newPlayerSession: PrivateGameSession = {
        startedAt: Date.now(),
        score: 0,
        answers: {},
        currentQuestionId: randomQuestion.id,
        timings: {},
        remainingTime: 0,
        ip: headers['cf-connecting-ip'],
    };

    await savePlayer(event, user, newPlayerSession);

    return {
        question: randomQuestion,
        timeLeft: getTimeLeft(newPlayerSession.startedAt),
        answeredQuestions: 0,
    } as GameSession;
});

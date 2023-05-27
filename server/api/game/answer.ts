import { createError, defineEventHandler, readRawBody } from 'h3';
import { getLevelScore, getQuestion, getRandomQuestion } from '../../core/questions';
import type { GameSession, PrivateGameSession } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getTimeLeft, savePlayer } from '../../core/game';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const body = await readRawBody(event);
    if (!body) {
        throw createError({
            statusCode: 400,
            message: 'Missing body.',
        });
    }

    const { answerId, questionId } = JSON.parse(body);
    if (!answerId || !questionId) {
        throw createError({
            statusCode: 400,
            message: 'Missing answer or question.',
        });
    }

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

    if (playerSession.currentQuestionId !== questionId) {
        throw createError({
            statusCode: 403,
            message: 'You are answering the wrong question.',
        });
    }

    const currentLevel = Object.keys(playerSession.answers).length + 1;

    const question = await getQuestion(event, questionId, currentLevel, true);
    if (!question) {
        throw createError({
            statusCode: 404,
            message: 'Question not found.',
        });
    }

    const answer = question.answers.find(a => a.id === answerId);
    if (!answer) {
        throw createError({
            statusCode: 404,
            message: 'Answer not found.',
        });
    }

    const isCorrect = answer.id === question.correctAnswerId;
    const score = getLevelScore(currentLevel);

    if (isCorrect) {
        playerSession.score += score;
    } else {
        const toRemove = Math.floor(score / 4);
        playerSession.score -= toRemove;
    }

    playerSession.answers[questionId] = answerId;
    playerSession.timings[questionId] = Date.now();

    if (currentLevel === 25) {
        playerSession.remainingTime = playerSession.startedAt + 1000 * 60 - Date.now();
        await savePlayer(event, playerSession);
        return {
            timeLeft: 0,
            answeredQuestions: 25,
        }
    }

    const randomQuestion = await getRandomQuestion(event, currentLevel + 1);
    if (!randomQuestion) {
        throw createError({
            statusCode: 404,
            message: 'Question not found.',
        });
    }

    playerSession.currentQuestionId = randomQuestion.id;

    await savePlayer(event, playerSession);

    return {
        question: randomQuestion,
        timeLeft: getTimeLeft(playerSession.startedAt),
        answeredQuestions: Object.keys(playerSession.answers).length,
    } as GameSession;
});

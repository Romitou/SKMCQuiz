import { createError, defineEventHandler, readRawBody } from 'h3';
import { getLevelScore, getQuestion, getRandomQuestion } from '../../core/questions';
import type { GameSession, PrivateGameSession } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getTimeLeft } from '../../core/game';

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
        const toRemove = Math.floor(score / 2);
        playerSession.score = Math.max(0, playerSession.score - toRemove);
    }

    playerSession.answers[questionId] = answerId;

    const randomQuestion = await getRandomQuestion(event, currentLevel + 1);
    playerSession.currentQuestionId = randomQuestion.id;

    await PLAYERS.put(user.discordId, JSON.stringify(playerSession));

    return {
        question: randomQuestion,
        timeLeft: getTimeLeft(playerSession.startedAt),
        score: playerSession.score,
        answeredQuestions: Object.keys(playerSession.answers).length,
    } as GameSession;
});

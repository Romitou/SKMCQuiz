import { createError, defineEventHandler, getHeaders, getQuery } from 'h3';
import type { PrivateGameQuestion, PrivateGameSession, SummaryAnswer, SummaryQuestion } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getPrivateQuestion } from '../../core/questions';
import { Summary } from '../../../typings/game';
import { canSummary } from '../../core/game';

export default defineEventHandler(async (event) => {
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const headers = getHeaders(event);
    const authorization = headers['authorization'];
    const isAdmin = authorization === 'zxgYYjyHK7Gu7sjfTGropV9cAieik299FYbouYq4px6wq3zJJuMLkHnJWtFXugaw';

    let user;
    if (!isAdmin) {
        user = await getUser(event);
        if (!canSummary(user.discordId)) {
            return createError({
                statusCode: 403,
                message: 'The summary is not available at this time.',
            });
        }
    }

    const query = getQuery(event);
    const discordId = query['discordId'] as string;

    const playerSession = await PLAYERS.get(isAdmin ? discordId : user.discordId, { type: 'json' }) as PrivateGameSession;
    if (!playerSession) {
        throw createError({
            statusCode: 403,
            message: 'You have not started a game yet.',
        });
    }

    const cache = await caches.open('summaries');
    let response = await cache.match(`https://quiz.skript-mc.fr/api/game/summary?discordId=${playerSession.discordId}`);
    if (response) {
        return await response.json() as { cachedAt: string; questions: SummaryQuestion[] };
    }


    const questions: SummaryQuestion[] = [];

    let i = 1;
    let lastTiming = playerSession.startedAt;
    for (const [questionId, answerId] of Object.entries(playerSession.answers)) {
        const question = await getPrivateQuestion(event, questionId, i);
        if (!question)
            continue;
        let userScore;
        if (answerId === question.correctAnswerId) {
            userScore = question.score;
        } else {
            userScore = -Math.floor(question.score / 2);
        }

        // Get the response time
        const rawTiming = playerSession.timings[i];
        const timing = rawTiming - lastTiming;
        lastTiming = rawTiming;

        i++;

        questions.push({
            id: question.id,
            content: question.content,
            level: question.level,
            userScore: userScore,
            responseTime: timing,
            averageResponseTime: question.averageResponseTime,
            averageScore: question.averageScore,
            image: question.image,
            answers: question.answers.map((answer) => {
                return {
                    id: answer.id,
                    content: answer.content,
                    image: answer.image,
                    answerPercentage: answer.answerPercentage,
                    correct: answer.id === question.correctAnswerId,
                    selected: answer.id === answerId,
                } as SummaryAnswer;
            }),
        } as SummaryQuestion);
    }

    const responseData = {
        cachedAt: new Date().toISOString(),
        score: playerSession.score,
        bonus: playerSession.bonus,
        bonusComment: playerSession.bonusComment,
        questions: questions,
    } as Summary;

    response = new Response(JSON.stringify(responseData), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400',
        },
    });

    await cache.put(`https://quiz.skript-mc.fr/api/game/summary?discordId=${playerSession.discordId}`, response);

    return responseData;
});

import { createError, defineEventHandler } from 'h3';
import type { PrivateGameQuestion, PrivateGameSession, SummaryAnswer, SummaryQuestion } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getPrivateQuestion } from '../../core/questions';

export default defineEventHandler(async (event) => {
    const user = await getUser(event);
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;
    const QUESTIONS: KVNamespace = event.context.cloudflare.env.questions;

    const playerSession = await PLAYERS.get(user.discordId, { type: 'json' }) as PrivateGameSession;
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

    let level = 1;
    for (const [questionId, answerId] of Object.entries(playerSession.answers)) {
        const question = await getPrivateQuestion(event, questionId, level++);
        if (!question)
            continue;
        let userScore;
        if (answerId === question.correctAnswerId) {
            userScore = question.score;
        } else {
            userScore = -Math.floor(question.score / 2);
        }
        questions.push({
            id: question.id,
            content: question.content,
            level: question.level,
            userScore: userScore,
            correctAnswerId: question.correctAnswerId,
            averageResponseTime: question.averageResponseTime,
            averageScore: question.averageScore,
            answers: question.answers.map((answer) => {
                return {
                    id: answer.id,
                    content: answer.content,
                    image: answer.image,
                    answerPercentage: answer.answerPercentage,
                } as SummaryAnswer;
            }),
        } as SummaryQuestion);
    }

    const responseData = {
        cachedAt: new Date().toISOString(),
        questions: questions,
    };

    response = new Response(JSON.stringify(responseData), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400',
        },
    });

    await cache.put(`https://quiz.skript-mc.fr/api/game/summary?discordId=${playerSession.discordId}`, response);

    return responseData;
});

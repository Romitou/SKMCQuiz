import { createError, defineEventHandler, getQuery } from 'h3';
import type { PrivateGameQuestion, PrivateGameSession, Summary, SummaryAnswer, SummaryQuestion } from '../../../typings/game';
import { getUser } from '../../core/auth';
import { getPrivateQuestion } from '../../core/questions';
import { canSummary } from '../../core/game';
import { isAdminRequest } from '../../core/admin';

export default defineEventHandler(async (event) => {
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;
    const isAdmin = isAdminRequest(event);

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

    const targetId = isAdmin ? discordId : user?.discordId;
    if (!targetId) {
        return createError({
            statusCode: 400,
            message: 'A target user ID is required.',
        });
    }

    const playerSession = await PLAYERS.get(targetId, { type: 'json' }) as PrivateGameSession;
    if (!playerSession) {
        return createError({
            statusCode: 404,
            message: 'Player session not found.',
        });
    }

    const summary: Summary = {
        answersCount: Object.keys(playerSession.answers).length,
        startedAt: playerSession.startedAt,
        questions: [],
    };

    let i = 1;
    let lastTiming = playerSession.startedAt;
    for (const [questionId, answerId] of Object.entries(playerSession.answers)) {
        const question = await getPrivateQuestion(event, questionId, i);
        if (!question)
            continue;

        const responseTime = playerSession.timings[questionId] - lastTiming;
        lastTiming = playerSession.timings[questionId];

        const userScore = answerId === question.correctAnswerId ? question.score : -Math.floor(question.score / 2);

        const summaryQuestion: SummaryQuestion = {
            id: question.id,
            content: question.content,
            answers: question.answers as SummaryAnswer[],
            level: question.level,
            responseTime,
            averageResponseTime: question.averageResponseTime,
            score: question.score,
            userScore,
            userAnswerId: answerId,
            averageScore: question.averageScore,
            image: question.image,
            correctAnswerId: question.correctAnswerId,
        };

        summary.questions.push(summaryQuestion);
        i++;
    }

    return summary;
});

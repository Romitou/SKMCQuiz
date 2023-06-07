import { defineEventHandler, getHeaders, H3Event } from 'h3';
import { PrivateGameQuestion, PrivateGameSession } from '../../../typings/game';
import { getLevelScore } from '../../core/questions';

export default defineEventHandler(async (event) => {
    const headers = getHeaders(event);
    const authorization = headers['authorization'];
    if (authorization !== 'zxgYYjyHK7Gu7sjfTGropV9cAieik299FYbouYq4px6wq3zJJuMLkHnJWtFXugaw')
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        })

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;
    const QUESTIONS: KVNamespace = event.context.cloudflare.env.questions;

    const playersList = await PLAYERS.list();
    const players: PrivateGameSession[] = [];
    for (const listPlayer of playersList.keys) {
        const player = await PLAYERS.get(listPlayer.name, { type: 'json' }) as PrivateGameSession;
        if (!player)
            continue;

        players.push(player);
    }

    const questionsList = await QUESTIONS.list();
    let questions: PrivateGameQuestion[] = [];
    for (const listQuestion of questionsList.keys) {
        const question = await QUESTIONS.get(listQuestion.name, { type: 'json' }) as PrivateGameQuestion[];
        if (!question)
            continue;

        questions.push(...question);
    }

    for (const player of players) {
        let i = 1;
        for (const [questionId, answerId] of Object.entries(player.answers)) {
            const question = questions.find((q) => q.id === questionId);
            if (!question)
                continue;

            const answer = question.answers.find((a) => a.id === answerId);
            if (!answer)
                continue;

            answer.count++;

            const score = getLevelScore(i++);

            player.score = score;
            if (answerId === question.correctAnswerId) {
                question.totalScore += score;
            } else {
                const toRemove = Math.floor(score / 2);
                question.totalScore -= toRemove;
            }

            questions[questions.indexOf(question)] = question;
        }

        let lastTiming = player.startedAt;
        for (const [questionId, timing] of Object.entries(player.timings)) {
            const question = questions.find((q) => q.id === questionId);
            if (!question)
                continue;

            question.totalResponseTime += lastTiming - timing;
            lastTiming = timing;

            questions[questions.indexOf(question)] = question;
        }
    }

    for (const question of questions) {
        const totalAnswers = question.answers.reduce((a, b) => a + b.count, 0);

        question.answers = question.answers.map((a) => {
            a.answerPercentage = Math.round((a.count / totalAnswers) * 100);
            return a;
        });

        question.averageResponseTime = Math.round(question.totalResponseTime / totalAnswers);
        question.averageScore = Math.round(question.totalScore / totalAnswers);

        await QUESTIONS.put(question.id, JSON.stringify(question));
    }

    return { ok: true };
});

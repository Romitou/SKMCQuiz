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

    console.log('Step 1')

    const playersList = await PLAYERS.list();
    const players: PrivateGameSession[] = [];
    for (const listPlayer of playersList.keys) {
        const player = await PLAYERS.get(listPlayer.name, { type: 'json' }) as PrivateGameSession;
        if (!player)
            continue;

        players.push(player);
    }

    console.log('Step 2')

    const questionsList = await QUESTIONS.list();
    let questions: PrivateGameQuestion[] = [];
    for (const listQuestion of questionsList.keys) {
        if (!listQuestion.name.startsWith('level-')) {
            await QUESTIONS.delete(listQuestion.name);
            continue;
        }

        let questionArray = await QUESTIONS.get(listQuestion.name, { type: 'json' }) as PrivateGameQuestion[];
        if (!questionArray)
            continue;

        const levelString = listQuestion.name.split('-')[1];
        const level = parseInt(levelString);

        questionArray = questionArray.map((q) => {
            q.level = level;
            return q;
        });

        questions.push(...questionArray);
    }

    console.log('Step 3')

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

            question.answers = question.answers.map((a) => {
                if (a.id === answerId)
                    return answer;

                return a;
            });

            const score = getLevelScore(i++);
            question.score = score;

            if (answerId === question.correctAnswerId) {
                question.totalScore += score;
            } else {
                const toRemove = Math.floor(score / 2);
                question.totalScore -= toRemove;
            }

            questions = questions.map((q) => {
                if (q.id === questionId)
                    return question;

                return q;
            });
        }

        let lastTiming = player.startedAt;
        for (const [questionId, timing] of Object.entries(player.timings)) {
            const question = questions.find((q) => q.id === questionId);
            if (!question)
                continue;

            question.totalResponseTime += lastTiming - timing;
            lastTiming = timing;

            questions = questions.map((q) => {
                if (q.id === questionId)
                    return question;

                return q;
            });
        }
    }

    console.log('Step 4')

    const questionsByLevel: Record<number, PrivateGameQuestion[]> = {};
    for (const question of questions) {
        if (!questionsByLevel[question.level])
            questionsByLevel[question.level] = [];

        const totalAnswers = question.answers.reduce((a, b) => a + b.count, 0);

        question.answers = question.answers.map((a) => {
            a.answerPercentage = Math.round((a.count / totalAnswers) * 100);
            return a;
        });

        question.averageResponseTime = Math.round(question.totalResponseTime / totalAnswers);
        question.averageScore = Math.round(question.totalScore / totalAnswers);

        if (!questionsByLevel[question.level])
            questionsByLevel[question.level] = [];
        questionsByLevel[question.level].push(question);
    }

    console.log('Step 5')

    for (const [level, questionsOfLevel] of Object.entries(questionsByLevel)) {
        await QUESTIONS.put(`level-${level}`, JSON.stringify(questionsOfLevel));
    }

    console.log('Step 6')

    return { ok: true };
});

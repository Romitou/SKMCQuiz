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
        const question = await QUESTIONS.get(listQuestion.name, { type: 'json' }) as PrivateGameQuestion;
        if (!question)
            continue;

        questions.push(question);
    }

    return { players, questions };
});

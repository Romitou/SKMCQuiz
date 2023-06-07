import { defineEventHandler } from 'h3';
import type { PrivateGameQuestion, PrivateGameSession } from '../../../typings/game';
import { verifyAdmin } from '../../core/admin';

export default defineEventHandler(async (event) => {
    verifyAdmin(event);

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
    const questions: PrivateGameQuestion[] = [];
    for (const listQuestion of questionsList.keys) {
        const question = await QUESTIONS.get(listQuestion.name, { type: 'json' }) as PrivateGameQuestion;
        if (!question)
            continue;

        questions.push(question);
    }

    return { players, questions };
});

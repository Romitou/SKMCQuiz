import { defineEventHandler, getHeaders, getQuery } from 'h3';
import { PrivateGameSession } from '../../../typings/game';
import { getLevelScore, getQuestion } from '../../core/questions';
import { savePlayer } from '../../core/game';

export default defineEventHandler(async (event) => {
    const headers = getHeaders(event);
    const authorization = headers['authorization'];
    if (authorization !== 'zxgYYjyHK7Gu7sjfTGropV9cAieik299FYbouYq4px6wq3zJJuMLkHnJWtFXugaw')
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        })

    const query = getQuery(event);
    const discordId = query['discordId'];

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const players = await PLAYERS.list();

    const logs = [];
    for (const playerKey of players.keys) {
        if (discordId && playerKey.name !== discordId) continue;
        const player = await PLAYERS.get(playerKey.name, { type: 'json' }) as PrivateGameSession;
        if (player) {
            logs.push("==== " + playerKey.name + " ====")
            logs.push('Old score: ' + player.score)
            player.score = 0;
            let i = 0;
            for (const [questionId, answerId] of Object.entries(player.answers)) {
                const question = await getQuestion(event, questionId, ++i, true);
                if (question) {
                    const score = getLevelScore(i);
                    if (answerId === question.correctAnswerId) {
                        player.score += score;
                        logs.push('Question: "' + question.content + '" correct (+', score + ") ("+player.score+")")
                    } else {
                        const toRemove = Math.floor(score / 2);
                        player.score -= toRemove;
                        logs.push('Question: "' + question.content + '" incorrect (-', toRemove + ") ("+player.score+")")
                    }
                } else {
                    logs.push('Question not found: ' + questionId, 'level: ' + i);
                }
                player.score += player.bonus;
                await savePlayer(event, player);
            }
        }
    }

    return logs;
});

import { defineEventHandler, getHeaders } from 'h3';
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

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const players = await PLAYERS.list();

    for (const playerKey of players.keys) {
        const player = await PLAYERS.get(playerKey.name, { type: 'json' }) as PrivateGameSession;
        if (player) {
            player.score = 0;
            let i = 0;
            for (const [questionId, answerId] of Object.values(player.answers)) {
                const question = await getQuestion(event, questionId, ++i, true);
                if (question) {
                    const score = getLevelScore(i);
                    console.log('correctAnswerId: ' + question.correctAnswerId, 'answerId: ' + answerId);
                    if (answerId === question.correctAnswerId) {
                        player.score += score;
                        console.log('correct answer +', score)
                    } else {
                        const toRemove = Math.floor(score / 2);
                        player.score -= toRemove;
                        console.log('bad answer -', toRemove)
                    }
                } else {
                    console.log('Question not found: ' + questionId, 'level: ' + i, ' user: ' + playerKey.name);
                }
                player.score += player.bonus;
                await savePlayer(event, player);
            }
        }
    }

    return {
        status: 'OK',
    }
});

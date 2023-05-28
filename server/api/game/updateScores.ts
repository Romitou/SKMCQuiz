import { defineEventHandler, getQuery } from 'h3';
import type { PrivateGameSession } from '../../../typings/game';
import { getLevelScore, getPrivateQuestion } from '../../core/questions';
import { savePlayer } from '../../core/game';
import { verifyAdmin } from '../../core/admin';

export default defineEventHandler(async (event) => {
    verifyAdmin(event);

    const query = getQuery(event);
    const discordId = query['discordId'];

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;
    const players = await PLAYERS.list();

    const logs: string[] = [];
    for (const playerKey of players.keys) {
        if (discordId && playerKey.name !== discordId) continue;
        const player = await PLAYERS.get(playerKey.name, { type: 'json' }) as PrivateGameSession;
        if (player) {
            logs.push(`Recalculating scores of ${playerKey.name}...`);
            logs.push(`Old score: ${player.score}`);
            player.score = 0;
            let i = 0;
            for (const [questionId, answerId] of Object.entries(player.answers)) {
                const question = await getPrivateQuestion(event, questionId, ++i);
                if (question) {
                    if (answerId === question.correctAnswerId) {
                        player.score += getLevelScore(i);
                    } else {
                        player.score -= Math.floor(getLevelScore(i) / 2);
                    }
                }
            }
            logs.push(`New score: ${player.score}`);
            await savePlayer(event, playerKey.name, player);
        }
    }

    return logs;
});

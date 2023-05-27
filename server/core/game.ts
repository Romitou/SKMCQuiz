import { H3Event } from 'h3';
import { PrivateGameSession, User } from '../../typings/game';

export function getTimeLeft(startedAt: number): number {
    return 60 - Math.floor((Date.now() - startedAt) / 1000);
}

export function savePlayer(event: H3Event, user: User, playerSession: PrivateGameSession): Promise<void> {
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    return PLAYERS.put(user.discordId, JSON.stringify(playerSession), {
        metadata: {
            score: playerSession.score,
            name: user.name,
        }
    });
}

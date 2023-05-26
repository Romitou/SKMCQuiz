import { H3Event } from 'h3';
import { PrivateGameSession } from '../../typings/game';
import appConfig from '../../app.config';

export function getTimeLeft(startedAt: number): number {
    return 60 - Math.floor((Date.now() - startedAt) / 1000);
}

export function savePlayer(event: H3Event, playerSession: PrivateGameSession): Promise<void> {
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    return PLAYERS.put(playerSession.discordId, JSON.stringify(playerSession), {
        metadata: {
            score: playerSession.score,
            name: playerSession.name,
        }
    });
}

export function isEligible(discordId: string) {
    if (appConfig.admins.includes(discordId))
        return true;

    if (!appConfig.eligibility.enabled)
        return false;

    if (appConfig.eligibility.start > Date.now())
        return false;

    return appConfig.eligibility.end >= Date.now();
}

export function canSummary(discordId: string) {
    if (appConfig.admins.includes(discordId))
        return true;

    if (!appConfig.summary.enabled)
        return false;

    if (appConfig.summary.start > Date.now())
        return false;

    return appConfig.summary.end >= Date.now();
}

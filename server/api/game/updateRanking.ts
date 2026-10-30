import { defineEventHandler, getHeaders, H3Event } from 'h3';
import { isEligible } from '../../core/game';
import { verifyAdmin } from '../../core/admin';

export default defineEventHandler(async (event) => {
    verifyAdmin(event);

    const headers = getHeaders(event);
    const botAuthorization = headers['bot-authorization'];
    if (!botAuthorization) {
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        });
    }

    const config = useRuntimeConfig();
    const channelId = config.discordRankingChannelId;
    const messageId = config.discordRankingMessageId;

    if (!channelId || !messageId) {
        throw createError({
            statusCode: 400,
            message: 'Discord ranking channelId or messageId is not configured.',
        });
    }

    // Send the ranking to the bot
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': botAuthorization,
        },
        body: JSON.stringify({
            embeds: await createRanking(event, !isEligible('0')),
        }),
    });

    return await response.json();
});

export async function createRanking(event: H3Event, showScores: boolean = false) {
    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const players = await PLAYERS.list<{ score: number, name: string }>();
    const ranking: Record<string, number> = {};

    for (const player of players.keys) {
        if (!player.metadata?.name || !player.metadata?.score)
            continue;
        ranking[player.metadata.name] = player.metadata.score as number;
    }

    // Sort the ranking
    const sortedRanking = Object.entries(ranking).sort(([, a], [, b]) => b - a);

    // Categories : star (top 15%), gold (top 30%), silver (top 45%), bronze (top 70%), others
    const starCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.15)]?.[1] ?? 0;
    const goldCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.3)]?.[1] ?? 0;
    const silverCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.45)]?.[1] ?? 0;
    const bronzeCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.7)]?.[1] ?? 0;

    const starPlayers: [string, number][] = [];
    const goldPlayers: [string, number][] = [];
    const silverPlayers: [string, number][] = [];
    const bronzePlayers: [string, number][] = [];
    const otherPlayers: [string, number][] = [];

    const minStarScore = starCategoryScore;
    const maxGoldScore = minStarScore - 1;
    const minGoldScore = goldCategoryScore;
    const maxSilverScore = minGoldScore - 1;
    const minSilverScore = silverCategoryScore;
    const maxBronzeScore = minSilverScore - 1;
    const minBronzeScore = bronzeCategoryScore;
    const maxOtherScore = minBronzeScore - 1;

    for (const [name, score] of sortedRanking) {
        if (score >= starCategoryScore)
            starPlayers.push([name, score]);
        else if (score >= goldCategoryScore)
            goldPlayers.push([name, score]);
        else if (score >= silverCategoryScore)
            silverPlayers.push([name, score]);
        else if (score >= bronzeCategoryScore)
            bronzePlayers.push([name, score]);
        else
            otherPlayers.push([name, score]);
    }

    let starString = starPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (starString.length === 0) starString = 'Personne :(';

    let goldString = goldPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (goldString.length === 0) goldString = 'Personne :(';

    let silverString = silverPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (silverString.length === 0) silverString = 'Personne :(';

    let bronzeString = bronzePlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (bronzeString.length === 0) bronzeString = 'Personne :(';

    let otherString = otherPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (otherString.length === 0) otherString = 'Personne :(';

    const config = useRuntimeConfig();
    const appName = config.public?.appName || 'Quiz';

    return [
        {
            title: `Classement du ${appName}`,
            description: `Retrouvez ci-dessous le classement de tous les participants. Les scores finaux ne sont affichés qu'à la clôture de l'événement.\n\nLes catégories de récompenses dépendant du classement relatif des joueurs, les positions peuvent évoluer tout au long de la session.`,
            color: 2988250,
        },
        {
            color: 2988250,
            fields: [
                {
                    name: `Catégorie Étoile`,
                    value: `*(plus de ${minStarScore} points)*\n${starString}`,
                },
                {
                    name: `Catégorie Or`,
                    value: `*(entre ${minGoldScore} et ${maxGoldScore} points)*\n${goldString}`,
                },
                {
                    name: `Catégorie Argent`,
                    value: `*(entre ${minSilverScore} et ${maxSilverScore} points)*\n${silverString}`,
                },
                {
                    name: `Catégorie Bronze`,
                    value: `*(entre ${minBronzeScore} et ${maxBronzeScore} points)*\n${bronzeString}`,
                },
                {
                    name: `Participants`,
                    value: `*(moins de ${maxOtherScore} points)*\n${otherString}`,
                }
            ]
        }
    ];
}

function displayRow(name: string, score: number, showScores: boolean = false) {
    let displayName = name;
    if (score <= -999) {
        displayName = `~~${name}~~ (disqualifié)`;
    }

    let displayScore = '';
    if (showScores) {
        displayScore = `(${score} pts)`;
    }

    return `:white_small_square: ${displayName} ${displayScore}`;
}

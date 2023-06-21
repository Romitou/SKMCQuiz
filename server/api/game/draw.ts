import { defineEventHandler, getHeaders, getQuery } from 'h3';
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

    const query = getQuery(event);
    const category = query['category'];
    const channelId = query['channelId'];

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const playersList = await PLAYERS.list<{ score: number, name: string }>();
    const ranking: Record<string, number> = {};

    for (const player of playersList.keys) {
        if (!player.metadata?.name || !player.metadata?.score)
            continue;
        ranking[player.metadata?.name] = <number>player.metadata?.score;
    }

    const sortedRanking = Object.entries(ranking).sort(([, a], [, b]) => b - a);

    const starCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.15)][1];
    const goldCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.3)][1];
    const silverCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.45)][1];
    const bronzeCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.7)][1];

    const starPlayers: string[] = [];
    const goldPlayers: string[] = [];
    const silverPlayers: string[] = [];
    const bronzePlayers: string[] = [];

    for (const [name, score] of sortedRanking) {
        if (!isEligible(name))
            continue;

        if (score >= starCategoryScore)
            starPlayers.push(name);
        else if (score >= goldCategoryScore)
            goldPlayers.push(name);
        else if (score >= silverCategoryScore)
            silverPlayers.push(name);
        else if (score >= bronzeCategoryScore)
            bronzePlayers.push(name);
    }

    const starWinners = starPlayers.sort(() => Math.random() - 0.5).slice(0, 1);
    const goldWinners = goldPlayers.sort(() => Math.random() - 0.5).slice(0, 3);
    const silverWinners = silverPlayers.sort(() => Math.random() - 0.5).slice(0, 5);
    const bronzeWinners = bronzePlayers.sort(() => Math.random() - 0.5).slice(0, 5);

    const starWinnersString = starWinners.map((name) => `:trophy: ${name}`).join('\n');
    const goldWinnersString = goldWinners.map((name) => `:first_place: ${name}`).join('\n');
    const silverWinnersString = silverWinners.map((name) => `:second_place: ${name}`).join('\n');
    const bronzeWinnersString = bronzeWinners.map((name) => `:third_place: ${name}`).join('\n');

    const embeds = [
        {
            title: 'Tirage au sort : Catégorie Étoile',
            description: 'Voici les gagnants du tirage au sort de la catégorie **Étoile** !',
            color: 0xfee75c,
            fields: [
                {
                    name: 'Gagnant',
                    value: starWinnersString.length > 0 ? starWinnersString : 'Personne',
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        },
        {
            title: 'Tirage au sort : Catégorie Or',
            description: 'Voici les gagnants du tirage au sort de la catégorie **Or** !',
            color: 0xf1c40f,
            fields: [
                {
                    name: 'Gagnants',
                    value: goldWinnersString.length > 0 ? goldWinnersString : 'Personne',
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        },
        {
            title: 'Tirage au sort : Catégorie Argent',
            description: 'Voici les gagnants du tirage au sort de la catégorie **Argent** !',
            color: 0x95a5a6,
            fields: [
                {
                    name: 'Gagnants',
                    value: silverWinnersString.length > 0 ? silverWinnersString : 'Personne',
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        },
        {
            title: 'Tirage au sort : Catégorie Bronze',
            description: 'Voici les gagnants du tirage au sort de la catégorie **Bronze** !',
            color: 0xe67e22,
            fields: [
                {
                    name: 'Gagnants',
                    value: bronzeWinnersString.length > 0 ? bronzeWinnersString : 'Personne',
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        }
    ];

    const categoryIndex = typeof category === 'string' ? parseInt(category, 10) : Number(category);
    const embed = embeds[categoryIndex] ?? embeds[0];

    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': botAuthorization,
        },
        body: JSON.stringify({
            embeds: [embed],
        }),
    });

    return await response.json();
});

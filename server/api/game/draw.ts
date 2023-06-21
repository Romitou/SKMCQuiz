import { defineEventHandler, getHeaders, getQuery, H3Event } from 'h3';
import { PrivateGameQuestion, PrivateGameSession } from '../../../typings/game';
import { getLevelScore } from '../../core/questions';
import { isEligible } from '../../core/game';
import { createRanking } from './updateRanking';

export default defineEventHandler(async (event) => {
    const headers = getHeaders(event);
    const authorization = headers['authorization'];
    if (authorization !== 'zxgYYjyHK7Gu7sjfTGropV9cAieik299FYbouYq4px6wq3zJJuMLkHnJWtFXugaw')
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        })
    const botAuthorization = headers['bot-authorization'];
    if (!botAuthorization)
        throw createError({
            statusCode: 403,
            message: 'You are not authorized to access this resource.',
        })

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

    let sortedRanking = Object.entries(ranking).sort(([, a], [, b]) => b - a);

    const starCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.15)][1];
    const goldCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.3)][1];
    const silverCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.45)][1];
    const bronzeCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.7)][1];

    const starPlayers = [];
    const goldPlayers = [];
    const silverPlayers = [];
    const bronzePlayers = [];
    const otherPlayers = [];

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

    // Pick winner from each category
    const starWinner = starPlayers[Math.floor(Math.random() * starPlayers.length)];
    const goldWinner = goldPlayers[Math.floor(Math.random() * goldPlayers.length)];
    const silverWinner = silverPlayers[Math.floor(Math.random() * silverPlayers.length)];
    const bronzeWinner = bronzePlayers[Math.floor(Math.random() * bronzePlayers.length)];

    const embeds = [
        {
            title: '🌟 Catégorie Étoile',
            color: 16749824,
            description: 'Consultez ci-dessous le résultat du tirage au sort pour la catégorie **Étoile**.',
            fields: [
                {
                    name: '🗂️ Éligibles',
                    value: starPlayers.map(([name]) => `${name === starWinner[0] ? `**${name}**` : name}`).join(', '),
                },
                {
                    name: '🥇 Gagnant',
                    value: `${starWinner[0]} (${starWinner[1]})`,
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        },
        {
            title: '🥇 Catégorie Or',
            color: 16766720,
            description: 'Consultez ci-dessous le résultat du tirage au sort pour la catégorie **Or**.',
            fields: [
                {
                    name: '🗂️ Éligibles',
                    value: goldPlayers.map(([name]) => `${name === goldWinner[0] ? `**${name}**` : name}`).join(', '),
                },
                {
                    name: '🥇 Gagnant',
                    value: `${goldWinner[0]} (${goldWinner[1]})`,
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        },
        {
            title: '🥈 Catégorie Argent',
            color: 12632256,
            description: 'Consultez ci-dessous le résultat du tirage au sort pour la catégorie **Argent**.',
            fields: [
                {
                    name: '🗂️ Éligibles',
                    value: silverPlayers.map(([name]) => `${name === silverWinner[0] ? `**${name}**` : name}`).join(', '),
                },
                {
                    name: '🥇 Gagnant',
                    value: `${silverWinner[0]} (${silverWinner[1]})`,
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        },
        {
            title: '🥉 Catégorie Bronze',
            color: 13434828,
            description: 'Consultez ci-dessous le résultat du tirage au sort pour la catégorie **Bronze**.',
            fields: [
                {
                    name: '🗂️ Éligibles',
                    value: bronzePlayers.map(([name]) => `${name === bronzeWinner[0] ? `**${name}**` : name}`).join(', '),
                },
                {
                    name: '🥇 Gagnant',
                    value: `${bronzeWinner[0]} (${bronzeWinner[1]})`,
                }
            ],
            footer: {
                text: `Tirage réalisé à ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}`,
            }
        }
    ];

    const embed = embeds[category as number];

    const response = await fetch('https://discord.com/api/v9/channels/'+channelId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': botAuthorization,
        },
        body: JSON.stringify({
            embeds: [embed],
        }),
    });

    console.log(response);
    console.log(JSON.stringify(response));

    return await response.json();

});

import { defineEventHandler, getHeaders, H3Event } from 'h3';

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

    // Send the ranking to the bot
    const response = await fetch('https://discord.com/api/v9/channels/1111338857930162257/messages/1112010204209479690', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': botAuthorization,
        },
        body: JSON.stringify({
            embeds: await createRanking(event, false),
        }),
    });

    console.log(response);
    console.log(JSON.stringify(response));

    return await response.json();
});

export async function createRanking(event: H3Event, showScores: boolean = false) {

    const PLAYERS: KVNamespace = event.context.cloudflare.env.players;

    const players = await PLAYERS.list<{ score: number, name: string }>();
    const ranking: Record<string, number> = {};

    for (const player of players.keys) {
        if (!player.metadata?.name || !player.metadata?.score)
            continue;
        ranking[player.metadata?.name] = <number>player.metadata?.score;
    }

    // Sort the ranking
    let sortedRanking = Object.entries(ranking).sort(([, a], [, b]) => b - a);

    // There is 4 types of categories : star, gold, silver and bronze
    // Star category is the top 15% of players
    // Gold category is the top 30% of players
    // Silver category is the top 45% of players
    // Bronze category is the top 70% of players
    // The last 30% of players are not in any category

    // Get the number of players in each category
    const starCategory = Math.round(sortedRanking.length * 0.15);
    const goldCategory = Math.round(sortedRanking.length * 0.3);
    const silverCategory = Math.round(sortedRanking.length * 0.45);
    const bronzeCategory = Math.round(sortedRanking.length * 0.7);

    // Get the players in each category
    const starPlayers = sortedRanking.slice(0, starCategory);
    const goldPlayers = sortedRanking.slice(starCategory, goldCategory);
    const silverPlayers = sortedRanking.slice(goldCategory, silverCategory);
    const bronzePlayers = sortedRanking.slice(silverCategory, bronzeCategory);
    const otherPlayers = sortedRanking.slice(bronzeCategory);

    let starString = starPlayers.map(([name, score]) => `:white_small_square: ${name} ${showScores ? `(${score} pts)` : ''}`).join('\n');
    if (starString.length === 0)
        starString = 'Personne :(';

    let goldString = goldPlayers.map(([name, score]) => `:white_small_square: ${name} ${showScores ? `(${score} pts)` : ''}`).join('\n');
    if (goldString.length === 0)
        goldString = 'Personne :(';

    let silverString = silverPlayers.map(([name, score]) => `:white_small_square: ${name} ${showScores ? `(${score} pts)` : ''}`).join('\n');
    if (silverString.length === 0)
        silverString = 'Personne :(';

    let bronzeString = bronzePlayers.map(([name, score]) => `:white_small_square: ${name} ${showScores ? `(${score} pts)` : ''}`).join('\n');
    if (bronzeString.length === 0)
        bronzeString = 'Personne :(';

    let otherString = otherPlayers.map(([name, score]) => `:white_small_square: ${name} ${showScores ? `(${score} pts)` : ''}`).join('\n');
    if (otherString.length === 0)
        otherString = 'Personne :(';

    return [
        {
            title: 'Classement du Skript-MC Quiz 2023',
            description: '🚀 Retrouvez ci-dessous le classement de tous les joueurs ayant participé au Skript-MC Quiz 2023. Les scores ne sont pas rendus publics avant la fin de l\'événement.\n\n📈 Attention : les catégories de récompenses étant dépendantes de la position des joueurs dans le classement, il est fortement possible que votre position évolue au cours de l\'événement.',
            color: 2988250,
            image: {
                url: 'https://quiz.skript-mc.fr/prizes.png'
            }
        },
        {
            color: 2988250,
            fields: [
                {
                    name: '🏅 Catégorie étoile',
                    value: starString,
                },
                {
                    name: '🥇 Catégorie or',
                    value: goldString,
                },
                {
                    name: '🥈 Catégorie argent',
                    value: silverString,
                },
                {
                    name: '🥉 Catégorie bronze',
                    value: bronzeString,
                },
                {
                    name: '­',
                    value: otherString,
                }
            ]
        }
    ];
}

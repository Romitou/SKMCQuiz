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

    // Get the score for each category (rounded to the nearest integer)
    const starCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.15)][1];
    const goldCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.3)][1];
    const silverCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.45)][1];
    const bronzeCategoryScore = sortedRanking[Math.round(sortedRanking.length * 0.7)][1];

    // Get the players in each category
    const starPlayers = [];
    const goldPlayers = [];
    const silverPlayers = [];
    const bronzePlayers = [];
    const otherPlayers = [];

    const maxStarScore = sortedRanking[0][1];
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
    if (starString.length === 0)
        starString = 'Personne :(';

    let goldString = goldPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (goldString.length === 0)
        goldString = 'Personne :(';

    let silverString = silverPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (silverString.length === 0)
        silverString = 'Personne :(';

    let bronzeString = bronzePlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
    if (bronzeString.length === 0)
        bronzeString = 'Personne :(';

    let otherString = otherPlayers.map(([name, score]) => displayRow(name, score, showScores)).join('\n');
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
                    name: `🏅 Catégorie étoile`,
                    value: `*(entre ${maxStarScore} et ${minStarScore} points)*\n${starString}`,
                },
                {
                    name: `🥇 Catégorie or`,
                    value: `*(entre ${maxGoldScore} et ${minGoldScore} points)*\n${goldString}`,
                },
                {
                    name: `🥈 Catégorie argent`,
                    value: `*(entre ${maxSilverScore} et ${minSilverScore} points)*\n${silverString}`,
                },
                {
                    name: `🥉 Catégorie bronze`,
                    value: `*(entre ${maxBronzeScore} et ${minBronzeScore} points)*\n${bronzeString}`,
                },
                {
                    name: `📦 Participants`,
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

import { defineEventHandler, getHeaders } from 'h3';

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

    // Get the top 15% and remove them from the ranking
    const top15 = sortedRanking.slice(0, Math.ceil(sortedRanking.length * 0.15));
    sortedRanking = sortedRanking.slice(Math.ceil(sortedRanking.length * 0.15));

    let top15string = top15.map(([name, _]) => `:white_small_square: ${name}`).join('\n');
    if (top15string.length === 0)
        top15string = 'Personne :(';

    // Get the top 30% and remove them from the ranking
    const top30 = sortedRanking.slice(0, Math.ceil(sortedRanking.length * 0.15));
    sortedRanking = sortedRanking.slice(Math.ceil(sortedRanking.length * 0.15));

    let top30string = top30.map(([name, _]) => `:white_small_square: ${name}`).join('\n');
    if (top30string.length === 0)
        top30string = 'Personne :(';

    // Get the top 45% and remove them from the ranking
    const top45 = sortedRanking.slice(0, Math.ceil(sortedRanking.length * 0.15));
    sortedRanking = sortedRanking.slice(Math.ceil(sortedRanking.length * 0.15));

    let top45string = top45.map(([name, _]) => `:white_small_square: ${name}`).join('\n');
    if (top45string.length === 0)
        top45string = 'Personne :(';

    // Get the top 70% and remove them from the ranking
    const top70 = sortedRanking.slice(0, Math.ceil(sortedRanking.length * 0.25));
    sortedRanking = sortedRanking.slice(Math.ceil(sortedRanking.length * 0.25));

    let top70string = top70.map(([name, _]) => `:white_small_square: ${name}`).join('\n');
    if (top70string.length === 0)
        top70string = 'Personne :(';

    let lastString = sortedRanking.map(([name, _]) => `:white_small_square: ${name}`).join('\n');
    if (lastString.length === 0)
        lastString = 'Personne :(';


    // Send the ranking to the bot
    const response = await fetch('https://discord.com/api/v9/channels/1111338857930162257/messages/1112010204209479690', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': botAuthorization,
        },
        body: JSON.stringify({
            embeds: [
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
                            value: top15string,
                        },
                        {
                            name: '🥇 Catégorie or',
                            value: top30string,
                        },
                        {
                            name: '🥈 Catégorie argent',
                            value: top45string,
                        },
                        {
                            name: '🥉 Catégorie bronze',
                            value: top70string,
                        },
                        {
                            name: '­',
                            value: lastString,
                        }
                    ]
                }
            ],
        }),
    });

    console.log(response);
    console.log(JSON.stringify(response));

    return await response.json();
});


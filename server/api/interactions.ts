import { createRouter, defineEventHandler, getHeaders, readBody, readRawBody, useBase } from 'h3';
import type { H3Event } from 'h3';
import { ButtonStyleTypes, MessageComponentTypes, verifyKey } from 'discord-interactions';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { createRanking } from './game/updateRanking';
import appConfig from '../../app.config';

const router = createRouter();

router.get('/', defineEventHandler(() => {
    return {
        message: 'Welcome to the interactions API!',
    };
}));

router.post('/', defineEventHandler(async (event) => {
    await verifyEvent(event);

    const body = await readBody(event);
    if (!body) {
        throw createError({
            statusCode: 400,
            message: 'Your request is missing a body.',
        });
    }

    const { type, data } = body;
    if (type === 1) {
        return {
            type: 1,
        };
    } else if (type === 2 || type === 3) {
        const { name, custom_id } = data;
        const config = useRuntimeConfig();
        const appUrl = (config.public?.appUrl as string) || 'http://localhost:3000';
        const appName = (config.public?.appName as string) || 'Quiz';

        if (name === 'play' || custom_id === 'play') {
            const token = await jwt.sign({
                discordId: body.member.user.id,
                name: body.member.user.username,
                avatar: body.member.user.avatar,
            }, config.jwtSecret);

            return {
                type: 4,
                data: {
                    embeds: [
                        {
                            title: appName,
                            description: 'Préparez-vous à tester vos connaissances en répondant à un maximum de questions dans un temps imparti d\'une minute !\n\nPour un meilleur confort, nous vous conseillons d\'utiliser un appareil avec un grand écran et une connexion internet stable.\n\nCliquez sur le bouton ci-dessous pour accéder directement à l\'application.',
                            color: 2988250,
                        },
                    ],
                    components: [
                        {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: [
                                {
                                    type: MessageComponentTypes.BUTTON,
                                    style: ButtonStyleTypes.LINK,
                                    label: 'Démarrer le quiz',
                                    url: `${appUrl}/?token=${token}`,
                                },
                            ],
                        },
                    ],
                    flags: 64,
                },
            };
        } else if (name === 'ranking') {
            const isAuthorized = (appConfig.admins as string[]).includes(body.member.user.id);
            if (!isAuthorized) {
                return {
                    type: 4,
                    data: {
                        content: 'Vous n\'avez pas la permission d\'utiliser cette commande.',
                        flags: 64,
                    }
                };
            }
            return {
                type: 4,
                data: {
                    embeds: await createRanking(event, true),
                }
            };
        } else if (custom_id === 'summary') {
            const token = await jwt.sign({
                discordId: body.member.user.id,
                name: body.member.user.username,
                avatar: body.member.user.avatar,
            }, config.jwtSecret);

            return {
                type: 4,
                data: {
                    embeds: [
                        {
                            title: appName,
                            description: 'Vous avez participé à l\'événement et vous souhaitez consulter le résumé détaillé de votre session ? Cliquez sur le bouton ci-dessous pour ouvrir vos résultats.',
                            color: 2988250,
                        },
                    ],
                    components: [
                        {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: [
                                {
                                    type: MessageComponentTypes.BUTTON,
                                    style: ButtonStyleTypes.LINK,
                                    label: 'Consulter le résumé',
                                    url: `${appUrl}/?token=${token}`,
                                },
                            ],
                        },
                    ],
                    flags: 64,
                },
            };
        }
    }

    return {
        ok: true,
    };
}));

export default useBase('/api/interactions', router.handler);

async function verifyEvent(event: H3Event): Promise<void> {
    const headers = getHeaders(event);
    const rawBody = await readRawBody(event);
    if (!rawBody) {
        throw createError({
            statusCode: 400,
            message: 'Your request is missing a body.',
        });
    }

    const signature = headers['x-signature-ed25519'];
    const timestamp = headers['x-signature-timestamp'];

    if (!signature || !timestamp) {
        throw createError({
            statusCode: 400,
            message: 'Your request is missing a signature or timestamp.',
        });
    }

    const { discordPublicKey } = useRuntimeConfig();
    const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        discordPublicKey,
    );

    if (!isValidRequest) {
        throw createError({
            statusCode: 401,
            message: 'Your request signature is invalid.',
        });
    }
}

import { createRouter, defineEventHandler, getHeaders, readBody, readRawBody, useBase } from 'h3';
import type { H3Event } from 'h3';
import { ButtonStyleTypes, MessageComponentTypes, verifyKey } from 'discord-interactions';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { createRanking } from './game/updateRanking';

const router = createRouter();

router.get('/', defineEventHandler(() => {
    return {
        message: 'Welcome to the interactions API!',
    };
}));
router.post('/', defineEventHandler(async (event) => {
    await verifyEvent(event);
    console.log('verified event');

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
        if (name === 'play' || custom_id === 'play') {
            const { jwtSecret } = useRuntimeConfig();
            const token = await jwt.sign({
                discordId: body.member.user.id,
                name: body.member.user.username,
                avatar: body.member.user.avatar,
            }, jwtSecret);

            return {
                type: 4,
                data: {
                    embeds: [
                        {
                            title: 'Skript-MC Quiz 2023',
                            description: '🕹️ Préparez-vous à tester vos connaissances et à répondre à un **maximum de questions dans un temps imparti** ! Installez-vous confortablement et préparez-vous à un enchaînement de questions les unes plus dures que les autres... dans l\'objectif de **marquer un maximum de points et obtenir la première place** !\n\n📱 Bien que le quiz soit réalisable et adapté à tous les appareils, nous vous conseillons d\'**utiliser un appareil disposant d\'un grand écran** (ordinateur, tablette...). Nous vous recommandons d\'avoir une **connexion internet stable**.\n\n🚀 Si vous êtes prêts à vous confronter à notre quiz et aux membres de la communauté, il ne vous suffit plus qu\'à cliquer sur le bouton ci-dessous qui vous **connectera automatiquement à notre application internet**.',
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
                                    url: `https://quiz.skript-mc.fr/?token=${token}`,
                                },
                            ],
                        },
                    ],
                    flags: 64,
                },
            };
        } else if (name === 'ranking') {
            if (body.member.user.id !== '191495299884122112') {
                return {
                    type: 4,
                    data: {
                        content: 'Vous n\'avez pas la permission d\'utiliser cette commande.',
                        flags: 64,
                    }
                }
            }
            return {
                type: 4,
                data: {
                    embeds: createRanking(event, true),
                }
            }
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

    return;
}

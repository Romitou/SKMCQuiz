// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        rootId: '__quiz',
        buildAssetsDir: '/build/',
        head: {
            title: process.env.NUXT_PUBLIC_APP_NAME || 'Community Quiz',
            link: [
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                { rel: 'manifest', href: '/site.webmanifest' },
                { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
            ],
            meta: [
                { name: 'apple-mobile-web-app-title', content: process.env.NUXT_PUBLIC_APP_NAME || 'Community Quiz' },
                { name: 'application-name', content: process.env.NUXT_PUBLIC_APP_NAME || 'Community Quiz' },
            ]
        }
    },
    nitro: {
        preset: 'cloudflare-pages'
    },
    css: [
        '~/assets/css/custom.css',
    ],
    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@pinia-plugin-persistedstate/nuxt',
    ],
    runtimeConfig: {
        public: {
            appName: process.env.NUXT_PUBLIC_APP_NAME || 'Community Quiz',
            appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
        jwtSecret: process.env.NUXT_JWT_SECRET || '',
        discordPublicKey: process.env.NUXT_DISCORD_PUBLIC_KEY || '',
        adminToken: process.env.NUXT_ADMIN_TOKEN || '',
        discordRankingChannelId: process.env.DISCORD_RANKING_CHANNEL_ID || '',
        discordRankingMessageId: process.env.DISCORD_RANKING_MESSAGE_ID || '',
    }
})

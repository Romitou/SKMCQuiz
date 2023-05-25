// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        rootId: '__skmc',
        buildAssetsDir: '/build/',
        head: {
            link: [
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                { rel: 'manifest', href: '/site.webmanifest' },
                { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
            ],
            meta: [
                { name: 'apple-mobile-web-app-title', content: 'Skript-MC Quiz' },
                { name: 'application-name', content: 'Skript-MC Quiz' },
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
        public: {},
        jwtSecret: 'pnYGHykbHFHevm4dTFDPYbHfPjVwXPKbhih3oqUBdNBJ6jDCCRAV6XTKuHDdMmTf',
        discordPublicKey: '583670a9ccede1ad0dde5d5909ec5af8e014ac182f48fac3f1909942cdc1a606',
    }
})

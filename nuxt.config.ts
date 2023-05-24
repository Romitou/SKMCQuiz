// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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

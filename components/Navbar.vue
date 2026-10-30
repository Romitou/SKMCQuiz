<template>
  <Disclosure as="nav" class="h-20 bg-gradient-to-r from-sky-500 to-sky-700 dark:from-sky-700 dark:to-sky-900 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-20">
        <div class="flex-1 flex items-center justify-start h-full">
          <NuxtLink to="/" class="flex items-center space-x-3 text-white font-semibold text-xl sm:text-2xl font-raleway tracking-wider">
            <span class="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 border border-white/20">
              <SparklesIcon class="h-6 w-6 text-white" />
            </span>
            <span>{{ appName }}</span>
          </NuxtLink>
        </div>
        <div v-if="authStore.user" class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <div class="flex flex-row space-x-4 items-center">
            <div class="text-white text-lg">{{ authStore.user?.name }}</div>
            <div class="bg-sky-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-800 focus:ring-white overflow-hidden">
              <img class="h-8 w-8 rounded-full" :src="authStore.avatarUrl" alt="Avatar" />
            </div>
          </div>
        </div>
        <div v-else class="absolute inset-y-0 right-0 flex items-center pr-2">
          <div v-if="authStore.user === undefined">
            <img class="h-6" src="~assets/loading.svg" alt="Chargement...">
          </div>
        </div>
      </div>
    </div>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure } from '@headlessui/vue';
import { SparklesIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '~/stores/auth';

const config = useRuntimeConfig();
const appName = config.public.appName || 'Quiz';
const authStore = useAuthStore();
</script>

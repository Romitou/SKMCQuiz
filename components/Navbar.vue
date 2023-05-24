<template>
  <Disclosure as="nav" class="h-20 bg-gradient-to-r from-sky-400 to-sky-600 dark:from-sky-600 dark:to-sky-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-20">
        <div class="flex-1 flex items-center justify-start h-full p-2.5">
          <a class="h-full" href="https://skript-mc.fr">
            <img class="sm:hidden block h-full w-auto p-1" src="~assets/logo-min-white.png" alt="Skript-MC logo">
            <img class="sm:block hidden h-full w-auto p-1" src="~assets/logo-full-white.png" alt="Skript-MC logo">
          </a>
          <div class="mx-2 sm:mx-4 py-3 h-full">
            <div class="h-full border-r-2 border-white/20"></div>
          </div>
          <div class="text-white text-xl sm:text-2xl font-semibold font-raleway tracking-wider">Quiz</div>
        </div>
        <div v-if="authStore.user" class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <Menu as="div" class="ml-3 relative">
            <div>
              <MenuButton class="bg-sky-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-800 focus:ring-white">
                <img class="h-8 w-8 rounded-full" :src="authStore.user.avatarUrl" alt="" />
              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
              <MenuItems class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
<!--                  <MenuItem v-slot="{ active }">-->
<!--                    <NuxtLink to="/dashboard" :class="[active ? 'bg-zinc-100' : '', 'block px-4 py-2 text-sm text-zinc-700']">Espace contributeur</NuxtLink>-->
<!--                  </MenuItem>-->
<!--                  <MenuItem v-slot="{ active }">-->
<!--                    <NuxtLink :to="`/profile/${authStore.user.id}-${authStore.user.name}`" :class="[active ? 'bg-zinc-100' : '', 'block px-4 py-2 text-sm text-zinc-700']">{{ $t('myProfile') }}</NuxtLink>-->
<!--                  </MenuItem>-->
<!--                  <MenuItem v-slot="{ active }">-->
<!--                    <NuxtLink to="https://sk-accounts.romitou.fr/account" :class="[active ? 'bg-zinc-100' : '', 'block px-4 py-2 text-sm text-zinc-700']">{{ $t('mySettings') }}</NuxtLink>-->
<!--                  </MenuItem>-->
<!--                  <MenuItem v-slot="{ active }">-->
<!--                    <NuxtLink to="https://sk-accounts.romitou.fr/auth/logout" :class="[active ? 'bg-zinc-100' : '', 'block px-4 py-2 text-sm text-zinc-700']">{{ $t('logout') }}</NuxtLink>-->
<!--                  </MenuItem>-->
              </MenuItems>
            </transition>
          </Menu>
        </div>
        <div v-else class="absolute inset-y-0 right-0 flex items-center pr-2">
          <div v-if="authStore.user === undefined">
            <img class="h-6" src="~assets/loading.svg" alt="Loading...">
          </div>
        </div>
      </div>
    </div>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {useAuthStore} from "~/stores/auth";

const authStore = useAuthStore();
</script>

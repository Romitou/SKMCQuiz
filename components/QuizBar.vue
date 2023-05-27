<template>
  <div class="w-full py-4 px-6">
    <div class="flex flex-row justify-between items-center py-3 bg-gray-100 dark:bg-zinc-800 rounded-t-lg shadow px-5 lg:px-10">
      <div class="flex flex-row items-center space-x-2 h-10 bg-gray-50 dark:bg-zinc-700 px-5 py-1 rounded-lg shadow text-gray-800 dark:text-gray-200">
        <HashtagIcon class="h-6 w-6" />
        <span class="text-lg hidden sm:block">Question n°</span>
        <span class="countdown font-mono text-2xl">
          <span :style="{'--value':answeredQuestions+1}"></span>
        </span>
      </div>
      <div v-if="loading" class="flex flex-row items-center space-x-2 h-10 bg-gray-50 dark:bg-zinc-700 px-5 py-1 rounded-lg shadow text-gray-800 dark:text-gray-200">
        <img class="h-6" src="~assets/loading.svg" alt="Loading...">
      </div>
      <div class="flex flex-row items-center space-x-2 h-10 bg-gray-50 dark:bg-zinc-700 px-5 py-1 rounded-lg shadow text-gray-800 dark:text-gray-200">
        <ClockIcon class="h-6 w-6" />
        <span class="countdown font-mono text-2xl" v-if="timeLeft >= 0">
          <span :style="{'--value':timeLeft}"></span>
        </span>
        <span v-else class="font-mono text-2xl">
          <span>00</span>
        </span>
        <span class="text-lg hidden sm:block">secondes</span>
      </div>
    </div>
    <div class="w-full bg-gray-100 rounded-b-full h-2.5 dark:bg-zinc-700 overflow-hidden">
      <div class="bg-sky-500 dark:bg-sky-700 h-2.5 rounded-r-full" :style="{'width': `${timeLeft < 60 ? 100 : 0}%`, 'transition': 'width 60s'}"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ClockIcon, HashtagIcon} from '@heroicons/vue/24/outline';

const { answeredQuestions, timeLeft, loading } = defineProps({
  answeredQuestions: {
    type: Number,
    required: true,
  },
  timeLeft: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  }
});
</script>

<style scoped>

</style>

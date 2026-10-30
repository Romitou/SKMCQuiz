<template>
  <div class="flex flex-col h-screen dark:bg-zinc-900 quiz-bg overflow-y-scroll">
    <QuizSummary />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game';
import { useRoute } from '#app';
import { onMounted } from '@vue/runtime-core';
import QuizSummary from '~/components/QuizSummary.vue';

const route = useRoute();
const gameStore = useGameStore();

onMounted(() => {
  const { token, userId } = route.query;
  gameStore.fetchAdminSummary(token as string, userId as string);
});
</script>

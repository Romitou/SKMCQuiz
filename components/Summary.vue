<template>
  <div v-if="gameStore.summary" v-for="question in gameStore.summary.questions">
    {{ question }}
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game';

const gameStore = useGameStore();

onMounted(() => {
  gameStore.fetchSummary();
});
</script>

<style scoped>

</style>

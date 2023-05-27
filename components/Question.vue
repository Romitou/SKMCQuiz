<template>
  <div class="w-full py-4 px-10">
    <div class="flex flex-col items-center">
      <div class="bg-gray-100 dark:bg-zinc-800 py-5 px-7 text-gray-200 text-3xl w-full rounded-xl shadow-lg text-center">
        {{ gameStore.session.question?.content }}
      </div>
      <div class="grid grid-cols-2 gap-9 w-full h-48 mt-10">
        <button
            v-for="(answer, i) in gameStore.session.question?.answers"
            :class="`${gameStore.loading ? 'bg-gray-500 dark:bg-gray-800' : colors[i]} py-5 px-7 text-gray-200 text-2xl w-full rounded-xl shadow-lg h-24 transition ease-in-out duration-200 transform hover:scale-105 hover:shadow-xl`"
            v-text="answer.content"
            :disabled="gameStore.loading"
            @click="answerQuestion(answer.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game';

const gameStore = useGameStore();

const colors = [
  'bg-red-500 dark:bg-red-800',
  'bg-blue-500 dark:bg-blue-800',
  'bg-yellow-500 dark:bg-yellow-800',
  'bg-green-500 dark:bg-green-800',
]

const answerQuestion = (answerId: string) => {
  gameStore.answerQuestion(answerId);
}

</script>

<style scoped>

</style>

<template>
  <div class="bg-gray-100 p-5 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg" v-if="!wantsToPlay">
    <div class="hero-content">
      <div class="max-w-3xl">
        <h1 class="text-3xl font-bold">Bienvenue, {{authStore.user?.name}}</h1>
        <div class="pt-6 space-y-3">
          <p>Bienvenue sur l'application de quiz. Vous allez pouvoir tester vos connaissances et vous mesurer aux autres participants.</p>
          <p>Pour un meilleur confort, nous vous conseillons d'utiliser une connexion stable et un écran suffisamment grand.</p>
          <p>Le barème est progressif : les questions rapportent de plus en plus de points au fil des niveaux, mais chaque mauvaise réponse retire la moitié des points en jeu.</p>
          <p>La partie dure exactement une minute, sans pause possible ni possibilité de revenir en arrière.</p>
          <p>Une barre d'état reste affichée en haut de l'écran pour indiquer le numéro de la question et le temps restant :</p>
        </div>
        <div class="dark:bg-zinc-900 bg-gray-200 rounded-lg mt-3">
          <QuizBar
              :answered-questions="answeredQuestions"
              :time-left="timeLeft"
              :loading="false"
          />
        </div>
        <div class="text-center mt-5">
          <button class="btn bg-sky-500 dark:bg-sky-700 hover:bg-sky-600 dark:hover:bg-sky-800 border-none text-gray-100 dark:text-gray-200" @click="start()">Démarrer le quiz</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <span class="countdown font-mono text-7xl">
      <span :style="{'--value':countdown}"></span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import QuizBar from '~/components/QuizBar.vue';
import { ref } from '@vue/reactivity';
import { onUnmounted } from '@vue/runtime-core';
import { useGameStore } from '~/stores/game';

const authStore = useAuthStore();
const gameStore = useGameStore();

const wantsToPlay = ref(false);
const start = () => {
  wantsToPlay.value = true;
};

const answeredQuestions = ref(0);
const timeLeft = ref(60);

const interval = setInterval(() => {
  if (wantsToPlay.value) {
    countdown.value--;
    if (countdown.value + 1 === 0) {
      gameStore.inGame = true;
      gameStore.startGame();
    }
  } else {
    timeLeft.value--;
    if (Math.random() < 0.3 && timeLeft.value > 0) {
      answeredQuestions.value++;
    }
  }
}, 1000);

const countdown = ref(10);

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
</style>

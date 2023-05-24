<template>
  <div class="bg-zinc-800 p-5 bg-zinc-800 text-gray-300 rounded-lg shadow-lg" v-if="!wantsToPlay">
    <div class="hero-content">
      <div class="max-w-3xl">
        <h1 class="text-3xl font-bold">Bienvenue, {{authStore.user?.name}} !</h1>
        <div class="pt-6 space-y-3">
          <p>👋 Bienvenue sur notre application Skript-MC Quiz sur laquelle vous pourrez tester vos connaissances et <strong>tenter de remporter des cadeaux</strong> conformément à la présentation de l'événement !</p>
          <p>📡 Nous vous recommandons d'utiliser un appareil disposant <strong>d'un grand écran</strong> (bien que l'application soit adaptée aux mobiles) et de vous assurer d'avoir une <strong>connexion internet stable</strong>.</p>
          <p>📊 Chaque question étant <strong>plus compliquée que la précédente</strong>, le nombre de points mis en jeu par question <strong>augmente de la même manière</strong>. Vous remporterez ces points en cas de bonne réponse mais vous <strong>perdrez la moitié</strong> des points mis en jeu en cas de mauvaise réponse.</p>
          <p>⌛ Le quiz va durer <strong>une minute</strong>, durant laquelle vous pourrez répondre à un <strong>maximum de questions</strong>. Il n'est pas possible de recommencer, retourner en arrière, sauter une question ou mettre en pause le quiz.</p>
          <p>⚙️ Une barre d'information sera affichée <strong>en haut de votre écran</strong> comme celle-ci. Elle vous renseignera sur le nombre de question répondues (hashtag), votre score actuel (étoile) et votre temps restant (horloge) : </p>
        </div>
        <div class="bg-zinc-900 rounded-lg mt-3">
          <QuizBar
              :answered-questions="answeredQuestions"
              :score="score"
              :time-left="timeLeft"
          />
        </div>
        <div class="text-center mt-5">
          <button class="btn bg-sky-700 hover:bg-sky-800 border-none text-gray-200" @click="start()">Démarrer maintenant le quiz</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
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
const score = ref(0);
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
      if (Math.random() < 0.4) {
        score.value += Math.floor(Math.random() * 10);
      }
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

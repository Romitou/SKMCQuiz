<template>
  <div class="flex flex-col h-screen dark:bg-zinc-900 skmc-bg-dark">
    <Navbar />
    <template v-if="gameStore.inGame">
      <QuizBar
          class="mt-3"
          :answered-questions="gameStore.session.answeredQuestions"
          :time-left="gameStore.session.timeLeft"
          :score="gameStore.session.score"
      />
      <Question />
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center flex-grow">
        <div v-if="authStore.user === undefined">
          <img class="h-20" src="~assets/loading.svg" alt="Loading...">
        </div>
        <NotAuthorized v-else-if="authStore.user === null" />
        <AlreadyPlayed v-else-if="gameStore.eligibility === 'ALREADY_PLAYED'" />
        <Unavailable v-else-if="gameStore.eligibility === 'UNAVAILABLE'" />
        <GameOnboarding v-else-if="gameStore.eligibility === 'ELIGIBLE'" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useGameStore } from '~/stores/game';
import QuizBar from '~/components/QuizBar.vue';
import NotAuthorized from '~/components/NotAuthorized.vue';
import { useRoute } from '#app';
import { onMounted, onUnmounted } from '@vue/runtime-core';
import GameOnboarding from '~/components/GameOnboarding.vue';
import AlreadyPlayed from '~/components/AlreadyPlayed.vue';
import Navbar from '~/components/Navbar.vue';

const route = useRoute();
const authStore = useAuthStore();
const gameStore = useGameStore();

const interval = setInterval(() => {
  if (gameStore.inGame) {
    gameStore.session.timeLeft--;
    if (gameStore.session.timeLeft === 0) {
      // gameStore.endGame();
    }
  }
}, 1000);

onMounted(() => {
  const { token } = route.query;
  if (token) {
    authStore.authToken = token as string;
    useRouter().replace('/');
  }
  authStore.login();

  if (authStore.authToken)
    gameStore.fetchEligibility();
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div>
    <div v-if="gameStore.summary === undefined">
      <img class="h-20" src="~assets/loading.svg" alt="Loading...">
    </div>
    <div v-else class="py-5 space-y-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 p-5 rounded-lg shadow-lg">
          <div class="flex flex-col py-3 px-5">
            <h1 class="text-3xl font-bold">Résumé de votre quiz</h1>
            <div class="pt-6 space-y-3">
              <p>👋 Bienvenue sur la page du résumé de votre quiz. Sur celle-ci, vous pouvez consulter toutes les questions auxquelles vous avez répondu dans votre quiz, accompagnées des réponses et des points accordés. Vous retrouverez de même quelques moyennes sur les questions : le temps de réponse, le score moyen accordé, le pourcentage de réponse en fonction des réponses.</p>
              <p>💁🏻 Les tirages au sort seront effectués quelques jours après la publication de ces résumés, afin de prendre en compte d'éventuelles modifications de scores en cas de dysfonctionnements qui auraient pu survenir dans l'attribution des scores. Si tel est le cas, merci de vous signaler afin de corriger votre score !</p>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="p-5 bg-zinc-900 shadow-xl">
          <div class="py-4 px-10">
            <div class="flex flex-col sm:flex-row items-center justify-between">
              <div class="text-3xl">Bonus</div>
              <div class="flex flex-row items-center justify-between space-x-4" v-if="gameStore.summary?.bonus && gameStore.summary?.bonus !== 0">
                <div v-if="gameStore.summary?.bonus < 0" class="flex flex-row items-center text-zinc-900 bg-red-500 py-2 px-4 text-2xl rounded">
                  <XMarkIcon class="h-6 w-6 mr-3" />
                  {{ gameStore.summary?.bonus }}
                </div>
                <div v-else class="flex flex-row items-center text-zinc-900 bg-green-500 py-2 px-4 text-2xl rounded">
                  <CheckIcon class="h-6 w-6 mr-3" />
                  +{{ gameStore.summary?.bonus }}
                </div>
              </div>
            </div>
            <div class="pt-3 text-lg" v-if="gameStore.summary?.bonus && gameStore.summary?.bonus !== 0">
              <p>Vous avez bénéficié d'un bonus lors de cet événement. Celui-ci vous a été attribué manuellement par l'organisateur de l'événement. Vous pouvez retrouver le commentaire associé à votre bonus ci-dessous :</p>
              <p class="font-bold">{{ gameStore.summary?.bonusComment }}</p>
            </div>
            <div class="pt-3 text-lg" v-else>
              <p>Vous ne disposez d'aucun bonus.</p>
            </div>
          </div>
        </div>
      </div>

      <SummaryQuestion v-for="question in gameStore.summary?.questions" :question="question" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="p-5 bg-zinc-900 shadow-xl">
          <div class="py-4 px-10">
            <div class="flex flex-col sm:flex-row items-center justify-between">
              <div class="text-3xl">Score total</div>
              <div class="flex flex-row items-center justify-between space-x-4" v-if="gameStore.summary?.score">
                <div v-if="gameStore.summary?.score < 0" class="flex flex-row items-center text-zinc-900 bg-red-500 py-2 px-4 text-2xl rounded">
                  <XMarkIcon class="h-6 w-6 mr-3" />
                  {{ gameStore.summary?.score }}
                </div>
                <div v-else class="flex flex-row items-center text-zinc-900 bg-green-500 py-2 px-4 text-2xl rounded">
                  <CheckIcon class="h-6 w-6 mr-3" />
                  +{{ gameStore.summary?.score }}
                </div>
              </div>
            </div>
            <div class="pt-3 text-lg">
              <p>Vous avez obtenu un score total de {{ gameStore.summary?.score }} points, en répondant à {{ gameStore.summary?.questions?.length }} questions en moins d'une minute ! Merci à vous d'avoir participé à cet événement, et on se retrouve (peut-être) pour le tirage au sort qui aura lieu dans quelques jours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game';
import { onMounted } from '@vue/runtime-core';
import { SummaryAnswer } from '~/typings/game';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';

export interface SummaryQuestion {
  id: string;
  content: string;
  level: number;
  userScore: number;
  image: boolean;
  averageResponseTime: number;
  averageScore: number;
  correctAnswerId: string;
  answers: SummaryAnswer[];
}


const gameStore = useGameStore();

onMounted(() => {
  gameStore.fetchSummary();
});
</script>

<style scoped>

</style>

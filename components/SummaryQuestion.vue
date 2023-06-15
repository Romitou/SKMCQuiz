<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="p-5 bg-zinc-900 shadow-xl">
    <div class="py-4 px-10">
      <div class="flex flex-col sm:flex-row items-center justify-between">
        <div class="text-3xl">Question {{ question.level }}</div>
        <div class="flex flex-row items-center justify-between space-x-4">
          <div class="flex flex-row items-center justify-center py-2 px-4 text-2xl">
            <ClockIcon class="h-6 w-6 mr-3" />
            {{ toSeconds(question.responseTime) }}s
          </div>
          <div v-if="question.userScore < 0" class="flex flex-row items-center text-zinc-900 bg-red-500 py-2 px-4 text-2xl rounded">
            <XMarkIcon class="h-6 w-6 mr-3" />
            {{ question.userScore }}
          </div>
          <div v-else class="flex flex-row items-center text-zinc-900 bg-green-500 py-2 px-4 text-2xl rounded">
            <CheckIcon class="h-6 w-6 mr-3" />
            +{{ question.userScore }}
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row pb-5 sm:space-x-4">
        <div class="text-xl">Moyennes : </div>
        <div class="flex flex-row items-center text-lg">
          <ClockIcon class="h-5 w-5 mr-3" />
          {{ toSeconds(question.averageResponseTime) }}s
        </div>
        <div class="flex flex-row items-center text-lg">
          <StarIcon class="h-5 w-5 mr-3" />
          {{ question.averageScore }} points
        </div>
      </div>
      <div class="flex flex-col items-center">
        <div class="flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-800 py-5 px-7 text-gray-800 dark:text-gray-200 text-2xl w-full rounded-xl shadow-lg text-center">
          <p>{{ question.content }}</p>
          <div class="p-2 mt-5 h-48" v-if="question.image">
            <img class="h-full w-full object-contain rounded" :src="`/questions/${question.id}.png`">
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-9 w-full mt-10">
          <div
              v-for="(answer, i) in question.answers"
              :class="`${colors[i]} ${answer.image ? 'py-1 px-3': 'py-5 px-7'} text-gray-800 dark:text-gray-200 text-xl w-full rounded-xl shadow-lg flex flex-col items-center justify-center ring-2 ring-offset-4 ring-offset-zinc-900 ${answer.correct ? 'ring-green-500' : (answer.selected ? 'ring-red-500' : 'ring-zinc-900')}`"
          >
            <div class="text-center">{{ answer.content }}</div>
            <div class="text-lg pt-2">({{ answer.answerPercentage }}%)</div>
            <div class="h-48" v-if="answer.image">
              <img class="h-full w-full object-contain rounded" :src="`/answers/${answer.id}.png`">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from '@vue/runtime-core';
import { Ref } from 'vue';
import { ref } from '@vue/reactivity';
import { SummaryAnswer } from '~/typings/game';
import { CheckIcon, XMarkIcon, ClockIcon, StarIcon } from '@heroicons/vue/24/outline';

export interface SummaryQuestion {
  id: string;
  content: string;
  level: number;
  userScore: number;
  image: boolean;
  averageResponseTime: number;
  averageScore: number;
  correctAnswerId: string;
  responseTime: number;
  answers: SummaryAnswer[];
}


const props = defineProps({
  question: {
    type: Object as PropType<SummaryQuestion>,
    required: true,
  },
});

const question = ref(props.question) as Ref<SummaryQuestion>;

const colors = [
  'bg-red-100 dark:bg-red-900',
  'bg-blue-100 dark:bg-blue-900',
  'bg-yellow-100 dark:bg-yellow-900',
  'bg-green-100 dark:bg-green-900',
]

const toSeconds = (ms: number) => {
  return (ms / 1000).toFixed(1);
}
</script>

<style scoped>

</style>

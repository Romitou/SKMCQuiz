<template>
  <div class="flex h-screen w-full bg-zinc-900 py-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">

      <div class="form-control w-full max-w-xs mb-5">
        <label class="label">
          <span class="label-text">Intitulé de la question</span>
        </label>
        <input v-model="question.content" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
      </div>


      <div class="form-control w-full max-w-xs mb-5">
        <label class="label">
          <span class="label-text">Image de la question</span>
        </label>
        <input v-model="question.imageUrl" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
      </div>

      <div v-for="i in [0, 1, 2, 3]" class="flex flex-row space-x-4">
        <div class="form-control w-full max-w-xs mb-5">
          <label class="label">
            <span class="label-text">Contenu réponse n°{{i}}</span>
          </label>
          <input v-model="question.answers[i].content" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
        </div>

        <div class="form-control w-full max-w-xs mb-5">
          <label class="label">
            <span class="label-text">Image réponse n°{{i}}</span>
          </label>
          <input v-model="question.answers[i].imageUrl" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
        </div>

        <div class="form-control w-full max-w-xs mb-5">
          <label class="label">
            <span class="label-text">Bonne réponse? n°{{i}}</span>
          </label>
          <input @click="correctAnswerPos = i" type="checkbox" :checked="correctAnswerPos === i" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
        </div>
      </div>

      <code class="text-white pre-wrap bg-zinc-800 rounded p-1 mt-5" v-html="JSON.stringify(formatData(question))" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameAnswer, GameQuestion } from '~/typings/game';
import { ref, Ref } from '@vue/reactivity';

const uid = () => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

const correctAnswerPos: Ref<number | undefined> = ref<number | undefined>(undefined);

const question: Ref<GameQuestion> = ref<GameQuestion>({
  id: uid(),
  content: '',
  imageUrl: '',
  correctAnswerId: undefined,
  answers: [
    {
      id: uid(),
      content: '',
      imageUrl: ''
    },
    {
      id: uid(),
      content: '',
      imageUrl: ''
    },
    {
      id: uid(),
      content: '',
      imageUrl: ''
    },
    {
      id: uid(),
      content: '',
      imageUrl: ''
    }
  ]
});

const formatData = (data: GameQuestion) => {
  if (!data.imageUrl) {
    delete data.imageUrl;
  }

  data.id = uid();

  data.answers.forEach((answer) => {
    answer.id = uid();
    if (!answer.imageUrl) {
      delete answer.imageUrl;
    }
  });

  if (correctAnswerPos.value)
    data.correctAnswerId = data.answers[correctAnswerPos.value].id;

  return data;
}

</script>

<style scoped>

</style>

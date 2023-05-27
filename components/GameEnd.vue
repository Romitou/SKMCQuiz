<template>
  <div class="bg-zinc-800 p-5 bg-zinc-800 text-gray-300 rounded-lg shadow-lg">
    <div class="hero-content">
      <div class="max-w-3xl">
        <h1 class="text-3xl font-bold">Quiz terminé</h1>
        <div class="pt-6 space-y-3">
          <p>👏 Félicitations, vous avez terminé le quiz en répondant à {{ answeredQuestions }} questions en une minute ! Nous espérons que vous avez passé un bon moment et nous espérons surtout que vous allez vous positionner en haut du classement.</p>
          <p v-if="answeredQuestions >= 25"><strong>🕗 Il semblerait que vous avez réussi à repondre aux 25 questions en moins d'une minute !</strong> Les secondes restantes seront prises en compte dans le calcul de votre score.</p>
          <p>📈 Pour consulter votre positionnement dans le classement, rendez-vous directement sur notre communauté Discord dans le salon des classements. Si vous êtes tout en bas, ne vous inquiétez pas : l'important c'est de participer. 😇</p>
          <p>💁 Si vous avez des questions concernant le déroulement de votre quiz ou sur l'événement dans sa globalité, nous restons à l'écoute sur notre communauté Discord.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game';

const { answeredQuestions } = useGameStore();
</script>

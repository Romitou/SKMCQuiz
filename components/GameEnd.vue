<template>
  <div class="bg-gray-100 p-5 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg">
    <div class="hero-content">
      <div class="max-w-3xl">
        <h1 class="text-3xl font-bold">Quiz terminé</h1>
        <div class="pt-6 space-y-3">
          <p>Félicitations, vous avez répondu à {{ gameStore.session.answeredQuestions }} questions en une minute.</p>
          <p v-if="gameStore.session.answeredQuestions >= 25"><strong>Vous avez répondu à toutes les questions avant la fin du temps imparti.</strong> Les secondes restantes ont été ajoutées à votre score sous forme de bonus.</p>
          <p>Le classement sera mis à jour à l'issue de l'événement.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game';

const gameStore = useGameStore();
</script>

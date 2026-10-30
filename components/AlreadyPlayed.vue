<template>
  <div class="bg-gray-100 p-5 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg">
    <div class="hero-content">
      <div class="max-w-3xl">
        <h1 class="text-3xl font-bold">Quiz déjà réalisé</h1>
        <div class="pt-6 space-y-3">
          <p>Bienvenue sur l'application de quiz en ligne.</p>
          <p>Il n'est pas possible de démarrer une nouvelle session : votre participation a déjà été enregistrée pour cet événement. Les classements et résultats seront publiés une fois la session terminée.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AlreadyPlayed"
}
</script>

<style scoped>
</style>

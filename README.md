# Quiz Time

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.5.0-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%7C%20KV-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Application web de quiz chronométré personnalisable et prête au déploiement pour n'importe quelle communauté. Elle s'exécute sur l'infrastructure serverless de Cloudflare (Pages et KV) avec un backend Nuxt 3 / Nitro, et s'intègre nativement à Discord pour l'authentification et l'annonce des classements.

---

## Sommaire

- [Présentation du projet](#présentation-du-projet)
- [Architecture et choix techniques](#architecture-et-choix-techniques)
- [Fonctionnalités](#fonctionnalités)
- [Sécurité](#sécurité)
- [Structure du code](#structure-du-code)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement](#déploiement)
- [Licence](#licence)

---

## Présentation du projet

Ce projet permet d'organiser des compétitions de quiz chronométrées pour une communauté en ligne, sans friction d'inscription et avec une infrastructure légère capable d'encaisser les pics de trafic.

### Les principes clés :
- **Connexion en un clic** : les participants cliquent sur un bouton sous le message Discord du bot. Un token JWT signé est généré et ouvre l'application web directement authentifiée avec leur compte Discord.
- **Tenue de charge sans serveur dédié** : l'hébergement repose entièrement sur Cloudflare Workers et KV, ce qui évite d'avoir à dimensionner ou maintenir un serveur classique.
- **Équité du jeu** : les réponses correctes restent sur le serveur, les scores sont calculés côté backend et les temps de réponse sont enregistrés pour repérer d'éventuels scripts de triche.

---

## Architecture et choix techniques

Le fonctionnement global repose sur trois éléments :
1. **Discord** : le bot reçoit les interactions des joueurs (commandes slash ou clics sur les boutons) et les transmet à l'API via une requête signée en Ed25519.
2. **Backend Nuxt / Nitro (Cloudflare Pages)** : vérifie la signature de la requête, génère un JWT de session et gère la logique de partie (envoi des questions une par une, calcul des points, chronomètre).
3. **Cloudflare KV** : assure la persistance des questions (`QUESTIONS`) et des sessions des participants (`PLAYERS`) avec des temps de lecture très faibles.

| Brique | Choix technique | Pourquoi ce choix ? |
| :--- | :--- | :--- |
| **Frontend** | Nuxt 3 & Vue 3 | Composition API, typage TypeScript et gestion d'état réactive avec Pinia. |
| **Interface** | TailwindCSS & DaisyUI | Interface légère, responsive et avec support du mode sombre. |
| **Backend** | Nitro sur Cloudflare Pages | Déploiement distribué au plus près des utilisateurs, sans temps de démarrage à froid notable. |
| **Stockage** | Cloudflare KV | Base clé-valeur rapide, adaptée au stockage des questions préparées et des sessions des joueurs. |
| **Authentification** | Discord Interactions & JWT | Pas de formulaires ni de mots de passe : Discord fournit l'identité, signée via Ed25519 puis relayée par un JWT éphémère. |

---

## Fonctionnalités

### Côté joueur
- **Course contre la montre** : une minute pour répondre au maximum de questions.
- **Barème progressif** : les questions rapportent de plus en plus de points au fil des niveaux, mais une mauvaise réponse retire la moitié des points en jeu.
- **Bonus de temps** : si un joueur termine les 25 questions avant la fin du chronomètre, les secondes restantes sont converties en points bonus.
- **Tolérance aux déconnexions** : reprise automatique de la partie en cours si l'onglet est rechargé par erreur.
- **Écran de résumé** : consultation de ses réponses, des corrections et des statistiques communautaires après l'événement.

### Côté organisation et administration
- **Éditeur de questions (`/editor`)** : interface pour rédiger et calibrer les questions et les choix proposés.
- **Classement dynamique** : répartition des joueurs par paliers (Étoile, Or, Argent, Bronze) et publication du résultat sur Discord.
- **Tirage au sort automatique (`/api/game/draw`)** : tirage aléatoire des gagnants parmi les participants éligibles de chaque palier.
- **Détection des doublons (`/api/game/frauds`)** : recoupement des adresses IP pour repérer d'éventuels comptes multiples.
- **Outils de maintenance (`/api/game/backup`, `/api/game/updateStats`)** : export des données et calcul global des statistiques de réussite par question.

---

## Sécurité

1. **Vérification des requêtes Discord** : chaque interaction entrante est contrôlée avec la clé publique de l'application via `discord-interactions` (en-têtes `x-signature-ed25519` et `x-signature-timestamp`).
2. **Sessions sous JWT signé** : le jeton contient l'identifiant Discord et le pseudo de l'utilisateur, signé via `@tsndr/cloudflare-worker-jwt`. Aucune donnée de score n'est modifiable côté client.
3. **Logique métier côté serveur** :
   - L'identifiant de la bonne réponse (`correctAnswerId`) n'est jamais envoyé au navigateur pendant la partie.
   - Le serveur enregistre l'heure de début et l'intervalle entre chaque réponse (`timings`) pour détecter les envois automatisés anormaux.
4. **Protection des routes d'administration** : les endpoints sensibles (tirage au sort, classement, recalcul, fraudes) exigent un en-tête `Authorization` vérifié via `NUXT_ADMIN_TOKEN`.

---

## Structure du code

```
quiz-time/
├── assets/                     # Logos, illustrations SVG et styles globaux
├── components/                 # Composants d'interface Vue 3
│   ├── AlreadyPlayed.vue       # Écran si le joueur a déjà participé
│   ├── GameEnd.vue             # Écran de fin de partie
│   ├── GameOnboarding.vue      # Règles du jeu et bouton de départ
│   ├── Navbar.vue              # Barre de navigation avec profil Discord
│   ├── NotAuthorized.vue       # Message si le token est manquant ou expiré
│   ├── Question.vue            # Affichage de la question et des réponses
│   ├── QuizBar.vue             # Compteur de questions et chronomètre
│   ├── QuizSummary.vue         # Résumé complet des réponses post-événement
│   ├── SummaryQuestion.vue     # Détail d'une question dans le résumé
│   └── Unavailable.vue         # Message si l'événement n'est pas encore ouvert
├── pages/                      # Pages Nuxt (index, éditeur, résumé admin)
├── plugins/                    # Plugins Vue (toasts de notification)
├── public/                     # Images des questions et assets statiques
├── server/                     # Backend serverless (Nitro)
│   ├── api/
│   │   ├── auth/self.ts        # Récupération du profil connecté
│   │   ├── game/               # Logique du jeu (réponses, tirages, classement, stats)
│   │   └── interactions.ts     # Réception des commandes et clics Discord
│   └── core/                   # Utilitaires partagés (admin, auth JWT, scoring)
├── stores/                     # Stores Pinia (auth, partie en cours)
├── typings/                    # Types TypeScript partagés
├── app.config.ts               # Dates de l'événement et configuration générale
├── nuxt.config.ts              # Configuration Nuxt et variables d'environnement
├── wrangler.toml               # Configuration des Workers et des bindings KV
└── package.json
```

---

## Installation locale

### Prérequis
- Node.js 18 ou version supérieure
- Yarn ou npm

### 1. Cloner le dépôt
```bash
git clone https://github.com/Romitou/quiz-time.git
cd quiz-time
```

### 2. Installer les dépendances
```bash
yarn install
# ou
npm install
```

### 3. Préparer les variables d'environnement
Créez un fichier `.env` à partir de l'exemple fourni :
```bash
cp .env.example .env
```

### 4. Démarrer le serveur local
```bash
yarn dev
# ou
npm run dev
```
L'application démarre par défaut sur `http://localhost:3000`.

---

## Variables d'environnement

Toutes les options de configuration sont décrites dans [`.env.example`](.env.example) :

| Variable | Rôle | Exemple |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_APP_NAME` | Nom public du quiz affiché dans l'interface et les embeds | `Community Quiz` |
| `NUXT_PUBLIC_APP_URL` | URL publique de l'application (pour les liens générés dans Discord) | `https://quiz.example.com` |
| `NUXT_JWT_SECRET` | Clé secrète pour signer les jetons de session des joueurs | `openssl rand -base64 48` |
| `NUXT_DISCORD_PUBLIC_KEY` | Clé publique de l'application Discord pour valider les interactions | Clé hexadécimale |
| `NUXT_ADMIN_TOKEN` | Jeton secret protégeant les routes d'administration | `openssl rand -base64 48` |
| `DISCORD_RANKING_CHANNEL_ID` | Identifiant du salon Discord où poster le classement | Chaîne numérique |
| `DISCORD_RANKING_MESSAGE_ID` | Identifiant du message Discord à mettre à jour | Chaîne numérique |
| `CLOUDFLARE_ACCOUNT_ID` | Identifiant du compte Cloudflare pour le déploiement | Clé hexadécimale |

---

## Déploiement

Le projet est configuré pour être compilé avec le preset `cloudflare-pages` :

```bash
# Compiler l'application pour la production
yarn build

# Déployer sur Cloudflare Pages via Wrangler
npx wrangler pages publish dist/
```

Les bindings KV (`PLAYERS` et `QUESTIONS`) doivent être préalablement créés sur votre compte Cloudflare et renseignés dans `wrangler.toml` ou dans le tableau de bord Cloudflare Pages.

---

## Licence

Ce projet est distribué sous licence [MIT](LICENSE). Vous pouvez l'utiliser, le modifier et vous en inspirer librement.

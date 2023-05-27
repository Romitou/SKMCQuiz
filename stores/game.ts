import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import type { GameSession } from '~/typings/game';
import axios, { AxiosResponse } from 'axios';

type EligibilityStatus = 'ELIGIBLE' | 'IN_PROGRESS' | 'ALREADY_PLAYED';

type EligibilityResponse = {
    status: EligibilityStatus;
}

export interface GameState {
    session: GameSession;
    eligibility: EligibilityStatus | undefined;
    inGame: boolean;
    endScreen: boolean;
}

export const useGameStore = defineStore('game', {
    state: (): GameState => ({
        session: {
            question: undefined,
            timeLeft: undefined,
            answeredQuestions: undefined,
        },
        eligibility: undefined,
        inGame: false,
        endScreen: false,
    }),
    getters: {
    },
    actions: {
        async fetchEligibility() {
            const authStore = useAuthStore();

            this.eligibility = await axios.get('/api/game/eligibility', {
                headers: {
                    Authorization: `Bearer ${authStore.authToken}`,
                },
            }).catch(console.error).then((response: AxiosResponse<EligibilityResponse>) => response.data.status);

            if (this.eligibility === 'IN_PROGRESS') {
                await this.resumeGame();
            }
        },
        async startGame() {
            const authStore = useAuthStore();

            this.session = await axios.get('/api/game/start', {
                headers: {
                    Authorization: `Bearer ${authStore.authToken}`,
                },
            }).catch(console.error).then((response: AxiosResponse<GameSession>) => response.data);
        },
        async answerQuestion(answerId: string) {
            const authStore = useAuthStore();

            this.session = await axios.post('/api/game/answer', {
                questionId: this.session.question?.id,
                answerId,
            }, {
                headers: {
                    Authorization: `Bearer ${authStore.authToken}`,
                },
            }).catch(console.error).then((response: AxiosResponse<GameSession>) => response.data);

            if (!useNuxtApp)
                return;

            const { $toast } = useNuxtApp();
            $toast.info(`Réponse enregistrée. On passe à la question n°${this.session.answeredQuestions} !`);
        },
        async resumeGame() {
            const authStore = useAuthStore();

            this.inGame = true;
            this.session = await axios.get('/api/game/resume', {
                headers: {
                    Authorization: `Bearer ${authStore.authToken}`,
                },
            }).catch(console.error).then((response: AxiosResponse<GameSession>) => response.data);
        },
        async endGame() {
            this.inGame = false;
            this.endScreen = true;
        }
    }
})

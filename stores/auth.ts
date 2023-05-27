import { defineStore } from 'pinia';
import type { User } from '~/typings/game';
import axios, { AxiosResponse } from 'axios';

export interface AuthState {
    authToken: string | undefined;
    user: User | null | undefined;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        authToken: undefined,
        user: undefined,
    }),
    getters: {
        isLoggedIn: (state: AuthState) => !!state.user,
        avatarUrl: (state: AuthState) => `https://cdn.discordapp.com/avatars/${state.user?.discordId}/${state.user?.avatar}.png`,
    },
    actions: {
        async login() {
            if (!this.authToken) {
                this.user = null;
                return;
            }

            this.user = await axios.get('/api/auth/self', {
                headers: {
                    Authorization: `Bearer ${this.authToken}`,
                },
            }).catch(() => {
                this.user = null;
            }).then((response: AxiosResponse<User>) => response.data);
        }
    },
    persist: {
        enabled: true,
        paths: ['authToken']
    }
})

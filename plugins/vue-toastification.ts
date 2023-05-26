import { defineNuxtPlugin } from '#app'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { useToast } from 'vue-toast-notification';
const toast = useToast();

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(ToastPlugin);

    return {
        provide: {
            toast,
        }
    }
});

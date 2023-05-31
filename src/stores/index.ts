import { store } from "quasar/wrappers";
import { createPinia } from "pinia";
import { Router } from "vue-router";
import { useApplicationStore } from "@Stores/application-store";
import { useUserStore } from "@Stores/user-store";

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module "pinia" {
    export interface PiniaCustomProperties {
        readonly router: Router;
    }
}

export const pinia = createPinia();

export const applicationStore = useApplicationStore(pinia);

export const userStore = useUserStore(pinia);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => pinia);

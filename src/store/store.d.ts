// Recommended at https://forum.quasar-framework.org/topic/7887/best-way-for-implement-vuex-with-typescript
// "Vuex doesn’t provide typings for this.$store property out of the box.
//  When used with TypeScript, you must declare your own module augmentation."

// vuex.d.ts
import { Store } from "vuex";
import { IRootState } from "./index";

declare module "@vue/runtime-core" {
    // provide typings for this.$store
    interface ComponentCustomProperties {
        $store: Store<IRootState>

        // mixins added by primary.ts
        checkNeedsTokenRefresh: () => boolean,
        attemptRefreshToken: () => Promise<void>,
        parseFromStorage: (arg0: string) => KeyedCollection,
        initializeAxios: () => void
    }
}

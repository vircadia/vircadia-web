<!--
//  MetaverseAzureLogin.vue
//
//  Adds a Microsoft Azure AD sign-in option using MSAL (browser).
//  For now, this only authenticates with Azure and emits an event with the
//  resulting ID token. Metaverse token exchange will be implemented later.
//
//  Copyright 2024 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <div class="column q-gutter-y-sm items-stretch">
        <q-separator />
        <div class="row items-center justify-center">
            <q-btn
                color="primary"
                outline
                :disable="!isConfigured || loading"
                :loading="loading"
                @click="signInWithMicrosoft"
            >
                <div class="row items-center no-wrap">
                    <q-icon name="fab fa-microsoft" class="q-mr-sm" />
                    <span>Sign in with Microsoft</span>
                </div>
                <q-tooltip v-if="!isConfigured" class="bg-black">
                    Azure AD is not configured. Please set VRCA_AZURE_* env vars.
                </q-tooltip>
            </q-btn>
        </div>
    </div>
    
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { PublicClientApplication, type AuthenticationResult } from "@azure/msal-browser";
import { API } from "@Modules/metaverse/API";
import { useQuasar } from "quasar";
import { MetaverseManager } from "@Modules/metaverse";
import { Account } from "@Modules/account";

let msalInstance: Nullable<PublicClientApplication> = null;
let msalInitPromise: Promise<void> | null = null;

async function getMsalInstance(): Promise<Nullable<PublicClientApplication>> {
    // Build authority and config from API azure params.
    const clientId = API.azure.clientId?.trim();
    const authority = API.azure.authority?.trim();
    const redirectUri = API.azure.redirectUri?.trim();
    if (!clientId || !authority || !redirectUri) return null;
    if (!msalInstance) {
        msalInstance = new PublicClientApplication({
            auth: {
                clientId,
                authority,
                redirectUri
            },
            cache: {
                cacheLocation: "sessionStorage",
                storeAuthStateInCookie: false
            }
        });
        msalInitPromise = msalInstance.initialize();
    }
    if (msalInitPromise) {
        await msalInitPromise;
    }
    return msalInstance;
}

function getMsalErrorDetails(error: unknown): { code?: string; message: string } {
    const unknownError = error as { errorCode?: string; errorMessage?: string; code?: string; message?: string } | undefined;
    const code = unknownError?.errorCode || unknownError?.code;
    const message = unknownError?.errorMessage || unknownError?.message || "Unknown error";
    return { code, message };
}

export default defineComponent({
    name: "MetaverseAzureLogin",
    emits: ["azureSignedIn"],
    setup(_, { emit }) {
        const $q = useQuasar();
        const loading = ref(false);
        const isConfigured = computed(() => Boolean(API.azure.clientId && API.azure.tenantId && API.azure.redirectUri));

        async function signInWithMicrosoft(): Promise<void> {
            const instance = await getMsalInstance();
            if (!instance) {
                $q.notify({ type: "negative", message: "Azure AD is not configured." });
                return;
            }

            loading.value = true;
            try {
                const result: AuthenticationResult = await instance.loginPopup({
                    scopes: API.azure.scopes && API.azure.scopes.length > 0 ? API.azure.scopes : ["openid", "profile", "email"]
                });

                // Try to exchange the Azure ID token with the metaverse for a Vircadia token
                const idToken = result.idToken;
                if (!idToken) {
                    throw new Error("Missing Azure ID token from MSAL result");
                }

                if (!MetaverseManager.activeMetaverse?.isConnected) {
                    // Emit for parent to optionally queue, but inform user there's no exchange yet.
                    emit("azureSignedIn", { idToken, idTokenClaims: result.idTokenClaims, account: result.account, accessToken: result.accessToken, scopes: result.scopes });
                    $q.notify({
                        type: "info",
                        textColor: "white",
                        icon: "info",
                        message: "Signed in with Microsoft. Connect to a metaverse to complete login."
                    });
                    return;
                }

                const success = await Account.loginWithAzureIdToken(idToken);
                if (success) {
                    emit("azureSignedIn", { idToken, idTokenClaims: result.idTokenClaims, account: result.account, accessToken: result.accessToken, scopes: result.scopes });
                    $q.notify({
                        type: "positive",
                        textColor: "white",
                        icon: "verified_user",
                        message: "Signed in with Microsoft and linked to metaverse account."
                    });
                } else {
                    $q.notify({
                        type: "warning",
                        textColor: "white",
                        icon: "link_off",
                        message: "Microsoft sign-in succeeded, but metaverse login failed.",
                        caption: "Please try again or use another method."
                    });
                }
            } catch (error) {
                const { code, message } = getMsalErrorDetails(error);
                // Map common MSAL error codes to clearer messages.
                let userMessage = "Microsoft sign-in failed.";
                if (code === "user_cancelled") {
                    userMessage = "Sign-in was canceled.";
                } else if (code === "monitor_window_timeout") {
                    userMessage = "Sign-in timed out. Please try again.";
                } else if (code && (code.includes("popup") || code.includes("window"))) {
                    userMessage = "Popup was blocked or closed. Allow popups and try again.";
                }

                // Azure App Registration not set as SPA (AADSTS9002326)
                if (message && message.includes("AADSTS9002326")) {
                    const expectedRedirect = API.azure.redirectUri || window.location.origin;
                    userMessage = "Azure app must be configured as 'Single-page application' with this redirect URI.";
                    $q.notify({
                        type: "warning",
                        textColor: "white",
                        icon: "info",
                        message: userMessage,
                        caption: `Add SPA platform in Azure Portal and set redirect URI to: ${expectedRedirect}`
                    });
                    // eslint-disable-next-line no-console
                    console.warn("AADSTS9002326 guidance: In Azure Portal > App registrations > Authentication, add a 'Single-page application' platform with the redirect URI shown above. Remove/avoid using only 'Web' platform for msal-browser.");
                }

                $q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    message: userMessage,
                    caption: code ? `${code}: ${message}` : message
                });

                const isMetaverseConnected = Boolean(MetaverseManager.activeMetaverse?.isConnected);
                // Log structured details for troubleshooting.
                // Note: Metaverse connectivity does not affect Microsoft sign-in.
                //       This log helps confirm connection state at failure time.
                // eslint-disable-next-line no-console
                console.error("Microsoft sign-in failed", { code, detail: message, isMetaverseConnected, error });
                if (!isMetaverseConnected) {
                    // eslint-disable-next-line no-console
                    console.warn("Metaverse is not connected. This does not block Azure login, but token exchange is pending.");
                }
            } finally {
                loading.value = false;
            }
        }

        return {
            loading,
            isConfigured,
            signInWithMicrosoft
        };
    }
});
</script>



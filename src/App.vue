<!--
//  App.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <router-view />
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'App',

    computed: {
        updateAccountSession () {
            return this.$store.state.account;
        },
        updatePlacesSettings () {
            return this.$store.state.places;
        },
        updateAccessToken () {
            return this.$store.state.account.accessToken;
        },
        metaverseServerChanged () {
            return this.$store.state.metaverseConfig.server;
        },
        dashboardConfigStore: {
            get () {
                return this.$store.state.dashboardConfig;
            },
            set (value) {
                this.$store.commit('mutate', {
                    update: true,
                    property: 'dashboardConfig',
                    with: value
                });
            }
        },
        getDashboardTheme () {
            return this.$store.state.dashboardConfig.dashboardTheme;
        },
        isLoggedIn () {
            return this.$store.state.account.isLoggedIn;
        }
    },

    watch: {
        // Save the state of the session to storage for retrieval if the user leaves and comes back.
        updateAccountSession: {
            handler: function (newVal) {
                for (const item in newVal) {
                    if (newVal[item] !== null) {
                        localStorage.setItem(item, newVal[item]);
                    }
                }
            },
            deep: true
        },
        // Save the settings for places.
        updatePlacesSettings: {
            handler: function (newVal) {
                for (const item in newVal) {
                    if (newVal[item] !== null) {
                        localStorage.setItem(item, newVal[item]);
                    }
                }
            },
            deep: true
        },
        // Save the settings for the dashboard.
        dashboardConfigStore: {
            handler: function (newVal) {
                for (const item in newVal) {
                    if (newVal[item] !== null) {
                        localStorage.setItem(item, newVal[item]);
                    }
                }
            },
            deep: true
        },
        // getDashboardTheme: {
        //     handler: function () {
        //         this.setDashboardTheme();
        //     }
        // },
        updateAccessToken () {
            console.info('Setting new access token header...');
            this.initializeAxios();
        },
        metaverseServerChanged (newMetaverseServer) {
            localStorage.setItem('metaverseConfig.server', newMetaverseServer);

            this.retrieveMetaverseConfig(newMetaverseServer);

            if (this.isLoggedIn && newMetaverseServer !== this.$store.state.account.metaverseServer) {
                this.logout();
            }
        }
        // isLoggedIn: {
        //     handler: function (newValue) {
        //         if (newValue === true && store.router.awaitingRouteOnLogin) {
        //             this.$router.push(store.router.routeOnLogin);
        //         }
        //     }
        // }
    }
});
</script>

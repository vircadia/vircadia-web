<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <div class="row no-wrap">
                <q-toolbar
                    class="col-4"
                >
                    <q-btn
                        flat
                        dense
                        round
                        icon="menu"
                        aria-label="Menu"
                        @click="mainDrawerOpen = !mainDrawerOpen"
                    />

                    <q-toolbar-title>
                        {{ getLocation }}
                    </q-toolbar-title>
                </q-toolbar>

                <q-toolbar
                    class="col-8"
                >
                    <q-input rounded outlined v-model="locationInput" label="Connect to" />
                    <q-btn-group push>
                        <q-btn push label="Connect" icon="login" @click="connect" />
                        <q-btn push label="Disconnect" icon="close" @click="disconnect" />
                    </q-btn-group>
                    <q-space />

                    <div>Vircadia Web v{{ $store.state.globalConsts.APP_VERSION }}</div>
                </q-toolbar>
            </div>
        </q-header>

        <q-drawer
            v-model="mainDrawerOpen"
            bordered
            content-class="bg-grey-1"
        >

    </q-drawer>

    <q-page-container>
        <router-view />
    </q-page-container>
</q-layout>
</template>

<script>
export default {
    name: 'MainLayout',

    data: () => ({
        mainDrawerOpen: false,
        // Menu
        locationInput: ''
    }),

    computed: {
        getLocation: function () {
            if (this.$store.state.location.current) {
                return this.$store.state.location.current;
            } else {
                return this.$store.state.location.state;
            }
        }
    },

    methods: {
        connect: function () {
            console.info('Connecting to...', this.locationInput);
        },

        disconnect: function () {
            console.info('Disconnecting from...', this.$store.state.location.current);
        }
    }
}
</script>

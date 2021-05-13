<!--
//  ChatWindow.vue
//
//  Created by Kalila L. on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <OverlayShell
        icon="chat"
        title="Chat"
        :defaultHeight="300"
        :defaultWidth="600"
        :hoverShowBar="true"
        top="unset"
        bottom="0"
        right="unset"
        left="0"
        border="none"
        boxShadow="none"
    >
        <q-card
            class="column full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                style="height: 100%"
            >
                <q-card-section>
                    <div class="row no-wrap items-center">
                        <div class="col text-h2 ellipsis">
                            Chat
                        </div>
                        <!-- <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
                            <q-icon name="place" />
                            250 ft
                        </div> -->
                    </div>

                </q-card-section>

                <q-separator />

                <q-card-section class="q-pt-none">

                </q-card-section>

                <!-- <q-card-actions align="right">
                    <q-btn v-close-popup flat color="primary" label="Reserve" />
                    <q-btn v-close-popup flat color="primary" round icon="event" />
                </q-card-actions> -->
            </q-scroll-area>
        </q-card>

        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
    </OverlayShell>
</template>

<script>
/* eslint-disable */
import OverlayShell from '../OverlayShell'

export default {
    name: 'ChatWindow',

    components: {
        OverlayShell
    },

    data: () => ({
    }),

    computed: {
    },

    methods: {
    },

    created: function () {
    },

    mounted: function () {
    }
}
</script>

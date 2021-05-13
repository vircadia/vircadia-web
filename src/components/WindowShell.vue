<style lang="scss" scoped>
    .outer {
        position: absolute;
        left: 400px;
        top: 200px;
    }

    div.title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>

<template>
    <q-card
        class="outer no-wrap items-stretch"
        :style="{ height: height + 'px', width: width + 'px' }"
    >
        <q-bar>
            <q-icon :name="icon" />
            <div class="title">{{ title }}</div>

            <q-space />

            <q-btn dense flat icon="minimize" />
            <q-btn dense flat icon="crop_square" />
            <q-btn dense flat icon="close" />
        </q-bar>

        <q-card-section
            class="full-height q-pa-none"
        >
            <slot />
        </q-card-section>
    </q-card>
</template>

<script>
/* eslint-ignore */

export default {
    props: {
        icon: { type: String, required: true },
        title: { type: String, required: true },
        defaultHeight: { type: Number, default: 400 },
        defaultWidth: { type: Number, default: 300 }
    },

    data () {
        return {
            height: this.defaultHeight,
            width: this.defaultWidth
        };
    }
};
</script>

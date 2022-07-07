<!--
//  OverlayShell.vue
//
//  Created by Kalila L. & Heather Anderson on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
    .outer {
        position: absolute;
        z-index: 0;
    }

    div.title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .bar {
        cursor: default;
        user-select: none;
    }

    div.resize {
        position: absolute;
        opacity: 0;
        background-color: red;
    }
    div.resize-top, div.resize-nw, div.resize-ne, div.resize-bottom, div.resize-sw, div.resize-se {
        height: 15px;
    }
    div.resize-top, div.resize-nw, div.resize-ne {
        top: -10px;
    }
    div.resize-bottom, div.resize-sw, div.resize-se {
        bottom: -10px;
    }
    div.resize-top, div.resize-bottom {
        width: 100%;
        cursor: ns-resize;
    }
    div.resize-left, div.resize-nw, div.resize-ne, div.resize-right, div.resize-sw, div.resize-se {
        width: 15px;
    }
    div.resize-left, div.resize-nw, div.resize-sw {
        left: -10px;
    }
    div.resize-right, div.resize-ne, div.resize-se {
        right: -10px;
    }
    div.resize-left, div.resize-right {
        height: 100%;
        cursor: ew-resize;
    }
    div.resize-nw, div.resize-se {
        cursor: nwse-resize;
    }
    div.resize-ne, div.resize-sw {
        cursor: nesw-resize;
    }
</style>

<template>
    <q-card
        class="outer column no-wrap items-stretch"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
        @mousedown="$emit('overlay-action', 'select')"
        :style="{
            // Dimensions
            // TODO: Should these two be a string so that we can define vh or whatever at will?
            height: isMaximized ? '100%' : (showWindowContent ? height : heightWhenMinimized) + 'px',
            width: isMaximized ? '100%' : width + 'px',
            // Positioning

            top: `${isMaximized ? 0 : top < 0 ? 0 : showWindowContent ? top >
            windowCache.innerHeight - height ? windowCache.innerHeight - height :
            top : top > windowCache.innerHeight - heightWhenMinimized ?
            windowCache.innerHeight - heightWhenMinimized : top}px`,

            // eslint-disable-next-line max-len
            left: `${isMaximized ? 0 : left < 0 ? 0 : left > windowCache.innerWidth - width ? windowCache.innerWidth - width : left}px`,
            borderRadius: '5px',
            overflow: 'hidden'
        }"
    >
        <q-slide-transition>
            <q-bar
                class="bar"
                :style="hoverShowBar ? 'position: absolute; width: 100%;' : ''"
                v-show="showWindowTitleBar"
            >
                <q-icon :name="icon" />
                <div class="title" @mousedown="canMove && beginAction($event, 'move')">{{ title }}</div>

                <div class="col full-height" @mousedown="canMove && beginAction($event, 'move')"></div>

                <q-btn dense flat
                    :icon="overlayStatus === 'minimized' ? 'expand_more' : 'minimize'"
                    @click="$emit('overlay-action', 'minimize')" />
                <q-btn dense flat
                    :icon="overlayStatus === 'maximized' ? undefined : 'crop_square'"
                    @click="$emit('overlay-action', 'maximize')">
                    <!--This is a workaround for Quasar's lack of support for custom icons.-->
                    <!--And Material doesn't have a restore-down icon.-->
                    <template v-if="overlayStatus === 'maximized'">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                        viewBox="0 0 24 24"
                        style="enable-background:new 0 0 24 24;width: 1.715em;color: inherit;" xml:space="preserve">
                            <path fill="none" d="M-2,2h24v24H-2V2z"/>
                            <path fill="currentColor" d="M16,6H4C2.9,6,2,6.9,2,8v12c0,1.1,0.9,2,2,
                            2h12c1.1,0,2-0.9,2-2V8C18,6.9,17.1,6,16,6z M16,20H4V8h12V20z"/>
                            <path fill="currentColor" d="M20,18c1.1,0,2-0.9,
                            2-2V4c0-1.1-0.9-2-2-2H8C6.9,2,6,2.9,6,4v2l2,0V4h12v12h-2l0,2H20z"/>
                        </svg>
                    </template>
                </q-btn>
                <q-btn dense flat
                    icon="close"

                    @click="$emit('overlay-action', 'close')"
                />

            </q-bar>
        </q-slide-transition>

        <!-- 32px is the height of a q-bar -->
        <q-card-section
            class="col q-pa-none"
            :style="hoverShowBar ? 'margin-top: 32px;' : ''"
            v-show="showWindowContent"
        >
            <slot></slot>
        </q-card-section>

        <div v-if="canResize && canResizeHeight && !isMinimized && !isMaximized"
            class="resize resize-top" @mousedown="beginAction($event, 'resize-top')" />
        <div v-if="canResize && canResizeHeight && !isMinimized && !isMaximized"
            class="resize resize-bottom" @mousedown="beginAction($event, 'resize-bottom')" />
        <div v-if="canResize && canResizeWidth && !isMaximized"
            class="resize resize-left" @mousedown="beginAction($event, 'resize-left')" />
        <div v-if="canResize && canResizeWidth && !isMaximized"
            class="resize resize-right" @mousedown="beginAction($event, 'resize-right')" />
        <div v-if="canResize && canResizeHeight && canResizeWidth && !isMinimized && !isMaximized"
            class="resize resize-nw" @mousedown="beginAction($event, 'resize-nw')" />
        <div v-if="canResize && canResizeHeight && canResizeWidth && !isMinimized && !isMaximized"
            class="resize resize-ne" @mousedown="beginAction($event, 'resize-ne')" />
        <div v-if="canResize && canResizeHeight && canResizeWidth && !isMinimized && !isMaximized"
            class="resize resize-sw" @mousedown="beginAction($event, 'resize-sw')" />
        <div v-if="canResize && canResizeHeight && canResizeWidth && !isMinimized && !isMaximized"
            class="resize resize-se" @mousedown="beginAction($event, 'resize-se')" />
    </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface WindowCache {
    innerWidth: number,
    innerHeight: number
}

export default defineComponent({
    props: {
        // Primary
        icon: { type: String, required: true },
        title: { type: String, required: true },
        hoverShowBar: { type: Boolean, default: false },
        // Dimensions
        defaultHeight: { type: Number, required: true, default: 400 },
        defaultWidth: { type: Number, default: 300 },
        minimumHeight: { type: Number, default: 50 },
        minimumWidth: { type: Number, default: 50 },
        maximumHeight: { type: Number, default: undefined },
        maximumWidth: { type: Number, default: undefined },
        // Positioning
        defaultTop: { type: Number, default: 200 },
        defaultLeft: { type: Number, default: 400 },
        minimumExposure: { type: Number, default: 100 },
        // Behavior
        canMove: { type: Boolean, default: true },
        canResize: { type: Boolean, default: true },
        canResizeWidth: { type: Boolean, default: true },
        canResizeHeight: { type: Boolean, default: true },
        dragMoveDebounce: { type: Number, default: 10 },
        // Info from parent/manager
        managerProps: { type: Object, default: () => ({}) }
        // parentSize: { type: Object, required: true }
    },

    data: (vm) => ({
        // Settings and Properties
        height: vm.defaultHeight,
        width: vm.defaultWidth,
        top: vm.defaultTop,
        left: vm.defaultLeft,
        // Internal
        overlayStatus: "restored",
        heightWhenMinimized: 32,
        hovered: false,
        dragAction: "UNKNOWN",
        dragStart: { x: 0, y: 0 },
        mouseCaptured: false,
        onDragMoveReady: true,
        windowCache: {} as WindowCache
    }),

    computed: {
        isMaximized(): boolean {
            return this.overlayStatus === "maximized";
        },
        isMinimized(): boolean {
            return this.overlayStatus === "minimized";
        },
        showWindowTitleBar(): boolean {
            return !this.hoverShowBar || this.hovered || this.isMinimized || this.isMaximized;
        },
        showWindowContent(): boolean {
            return !this.isMinimized;
        }
    },

    watch: {
        overlayStatus() {
            this.refinePosition();
        },

        mouseCaptured(newVal: boolean) {
            if (newVal) {
                // TODO: what is 'newVal' telling us that all settings are to 'true'?
                // eslint-disable-next-line @typescript-eslint/unbound-method
                document.addEventListener("mousemove", this.onDragMove, true);
                // eslint-disable-next-line @typescript-eslint/unbound-method
                document.addEventListener("mouseup", this.onDragDone, true);
            } else {
                // eslint-disable-next-line @typescript-eslint/unbound-method
                document.removeEventListener("mousemove", this.onDragMove, true);
                // eslint-disable-next-line @typescript-eslint/unbound-method
                document.removeEventListener("mouseup", this.onDragDone, true);
            }
        },

        "managerProps.overlayStatus"(newVal: string) {
            this.overlayStatus = newVal;
        }
    },

    methods: {
        dragBehavior(action: string) {
            let top = 0;
            let left = 0;
            let width = 0;
            let height = 0;

            switch (action) {
                case "move":
                    top = +1;
                    left = +1;
                    break;
                case "resize-top":
                    top = +1;
                    height = -1;
                    break;
                case "resize-bottom":
                    height = +1;
                    break;
                case "resize-left":
                    left = +1;
                    width = -1;
                    break;
                case "resize-right":
                    width = +1;
                    break;
                case "resize-nw":
                    top = +1;
                    left = +1;
                    height = -1;
                    width = -1;
                    break;
                case "resize-ne":
                    top = +1;
                    height = -1;
                    width = +1;
                    break;
                case "resize-sw":
                    left = +1;
                    width = -1;
                    height = +1;
                    break;
                case "resize-se":
                    height = +1;
                    width = +1;
                    break;
                default:
                    break;
            }

            return { top, left, width, height };
        },

        beginAction(event: MouseEvent, action: string) {
            if (this.dragAction && this.dragAction !== "UNKNOWN") {
                return;
            }
            this.cacheWindowParams();
            this.dragAction = action;
            this.dragStart = { x: event.clientX, y: event.clientY };
            this.mouseCaptured = true;
        },

        applyDrag(mouseX: number, mouseY: number): void {
            // TODO: the logic if 'dragAction' needs work. Value is string?
            if (!this.dragAction || !this.dragStart) {
                // shouldn't be here, get out now
                return;
            }
            const behavior = this.dragBehavior(this.dragAction);
            let offsetX = mouseX - this.dragStart.x;
            let offsetY = mouseY - this.dragStart.y;

            // apply the size changes first and enforce min/max sizes
            let newWidth = this.width + offsetX * behavior.width;
            if (this.minimumWidth && newWidth < this.minimumWidth) {
                newWidth = this.minimumWidth;
                offsetX = (newWidth - this.width) * behavior.width;
            }
            if (this.maximumWidth && newWidth > this.maximumWidth) {
                newWidth = this.maximumWidth;
                offsetX = (newWidth - this.width) * behavior.width;
            }

            let newHeight = this.height + offsetY * behavior.height;
            if (this.minimumHeight && newHeight < this.minimumHeight) {
                newHeight = this.minimumHeight;
                offsetY = (newHeight - this.height) * behavior.height;
            }
            if (this.maximumHeight && newHeight > this.maximumHeight) {
                newHeight = this.maximumHeight;
                offsetY = (newHeight - this.height) * behavior.height;
            }

            this.width = newWidth;
            this.height = newHeight;
            this.top += offsetY * behavior.top;
            this.left += offsetX * behavior.left;
            this.dragStart = { x: mouseX, y: mouseY };
        },

        onDragMove(event: MouseEvent) {
            this.cacheWindowParams();
            if (this.onDragMoveReady) {
                this.applyDrag(event.clientX, event.clientY);
                this.onDragMoveReady = false;
                window.setTimeout(() => {
                    this.onDragMoveReady = true;
                }, this.dragMoveDebounce);
            }

            event.preventDefault();
            event.stopPropagation();
        },

        onDragDone(event: MouseEvent) {
            this.cacheWindowParams();
            this.applyDrag(event.clientX, event.clientY);
            this.mouseCaptured = false;
            this.dragAction = "UNKNOWN";
            this.dragStart = { x: 0, y: 0 };
            this.refinePosition();

            event.preventDefault();
            event.stopPropagation();
        },

        cacheWindowParams(): void {
            // Cache some necessary properties of the global window object.
            this.windowCache = {
                innerWidth: window.innerWidth,
                innerHeight: document.body.querySelector("main")?.clientHeight || window.innerHeight
            };
        },

        refinePosition(): void {
            if (this.top < 0) {
                this.top = 0;
            }
            if (this.overlayStatus === "minimized") {
                if (this.top > this.windowCache.innerHeight - this.heightWhenMinimized) {
                    this.top = this.windowCache.innerHeight - this.heightWhenMinimized;
                }
            } else if (this.top > this.windowCache.innerHeight - this.height) {
                this.top = this.windowCache.innerHeight - this.height;
            }
            if (this.left < 0) {
                this.left = 0;
            }
            if (this.left > this.windowCache.innerWidth - this.width) {
                this.left = this.windowCache.innerWidth - this.width;
            }
        }
    },

    unmounted() {
        if (this.mouseCaptured) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            document.removeEventListener("mousemove", this.onDragMove, true);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            document.removeEventListener("mouseup", this.onDragDone, true);
        }
    }
});
</script>

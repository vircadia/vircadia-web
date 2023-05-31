import { defineStore } from "pinia";
import { Vec3 } from "@vircadia/web-sdk";
import { onAttributeChangePayload } from "@Modules/account";
import { defaultActiveAvatarModel, defaultAvatarModels } from "@Modules/avatar/DefaultModels";
import type { Domain } from "@Base/modules/domain/domain";
import type { DomainAvatar } from "@Base/modules/domain/avatar";
import { DataMapper } from "@Modules/domain/dataMapper";
import type { vec3 } from "@vircadia/web-sdk";

const defaultControls = {
    keyboard: {
        movement: {
            walkForwards: { name: "Walk Forwards", keycode: "KeyW" } as Keybind,
            walkBackwards: { name: "Walk Backwards", keycode: "KeyS" } as Keybind,
            walkLeft: { name: "Walk Left", keycode: "KeyA" } as Keybind,
            walkRight: { name: "Walk Right", keycode: "KeyD" } as Keybind,
            run: { name: "Run", keycode: "ShiftLeft" } as Keybind,
            jump: { name: "Jump", keycode: "Space" } as Keybind,
            crouch: { name: "Crouch", keycode: "KeyC" } as Keybind,
            fly: { name: "Fly", keycode: "KeyF" } as Keybind,
            sit: { name: "Sit", keycode: "KeyG" } as Keybind,
            clap: { name: "Clap", keycode: "KeyH" } as Keybind,
            salute: { name: "Salute", keycode: "KeyJ" } as Keybind
        },
        camera: {
            pitchUp: { name: "Pitch Up", keycode: "ArrowUp" } as Keybind,
            pitchDown: { name: "Pitch Down", keycode: "ArrowDown" } as Keybind,
            yawLeft: { name: "Yaw Left", keycode: "ArrowLeft" } as Keybind,
            yawRight: { name: "Yaw Right", keycode: "ArrowRight" } as Keybind,
            firstPerson: { name: "First-Person", keycode: "Digit1" } as Keybind,
            thirdPerson: { name: "Third-Person", keycode: "Digit3" } as Keybind,
            collisions: { name: "Toggle Collisions", keycode: "Digit4" } as Keybind
        },
        audio: {
            mute: { name: "Toggle Mic Mute", keycode: "KeyV" } as Keybind,
            pushToTalk: { name: "Push-To-Talk", keycode: "KeyB" } as Keybind
        },
        other: {
            resetPosition: { name: "Reset Position", keycode: "KeyK" } as Keybind,
            toggleMenu: { name: "Toggle Menu", keycode: "KeyM" } as Keybind,
            openChat: { name: "Open Chat", keycode: "KeyT" } as Keybind
        }
    },
    mouse: {
        acceleration: true,
        invert: false,
        sensitivity: 50
    }
};

export type KeyboardControlCategory = keyof typeof defaultControls.keyboard;
export type KeyboardControl<T extends KeyboardControlCategory> = keyof typeof defaultControls.keyboard[T];
export interface Keybind {
    name: string,
    keycode: string
}

export interface LocationBookmark {
    name: string,
    color: string,
    url: string
}

export const useUserStore = defineStore("user", {
    state: () => ({
        storeVersion: {
            major: 5,
            minor: 0,
            patch: 0
        },
        avatar: {
            displayName: "anonymous",
            showNametags: true,
            position: Vec3.ZERO,
            location: "0,0,0",
            models: defaultAvatarModels(),
            activeModel: defaultActiveAvatarModel()
        },
        // Graphics configuration.
        graphics: {
            fieldOfView: 85,
            bloom: true,
            fxaaEnabled: true,
            msaa: 2,
            sharpen: false
        },
        // Information about the logged in account. Refer to Account module.
        account: {
            id: "UNKNOWN",
            username: "Guest",
            isLoggedIn: false,
            accessToken: "UNKNOWN",
            tokenType: "Bearer",
            scope: "UNKNOWN",
            isAdmin: false,
            useAsAdmin: false,
            images: {
                hero: undefined as string | undefined,
                tiny: undefined as string | undefined,
                thumbnail: undefined as string | undefined
            }
        },
        // Saved bookmarks.
        bookmarks: {
            locations: [] as Array<LocationBookmark>
        },
        // Controls.
        controls: defaultControls
    }),

    getters: {
    },

    actions: {
        reset(): void {
            this.$reset();
        },
        updateAccountInfo(data: onAttributeChangePayload): void {
            this.account.accessToken = data.accessToken;
            this.account.isAdmin = data.isAdmin;
            this.account.isLoggedIn = data.isLoggedIn;
            this.account.scope = data.scope;
            this.account.tokenType = data.accessTokenType;
            this.account.username = data.accountInfo.username;
            Object.assign(this.account.images, data.accountInfo.images ?? {});
        },
        updateLocalAvatarInfo(domain: Domain, domainAvatar?: DomainAvatar, position?: vec3): void {
            const domainLocation = domain.DomainClient
                ? domain.Location.protocol + "//" + domain.Location.host
                : "Disconnected";
            if (domainAvatar) {
                const myAvaInfo = domainAvatar.MyAvatar;
                this.avatar.displayName = myAvaInfo?.displayName ?? myAvaInfo?.sessionDisplayName ?? "anonymous";
                this.avatar.location
                    = `${domainLocation}/${DataMapper.mapVec3ToString(myAvaInfo?.position)}/${DataMapper.mapQuaternionToString(myAvaInfo?.orientation)}`;
                this.avatar.position = myAvaInfo?.position ?? Vec3.ZERO;
            }
            // An optional update to just the avatar's position.
            if (position) {
                this.avatar.position = position;
                this.avatar.location = `${domainLocation}/${DataMapper.mapVec3ToString(position)}/${DataMapper.mapQuaternionToString(null)}`;
            }
        }
    }
});

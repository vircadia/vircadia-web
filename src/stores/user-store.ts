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
            walkForwards: { name: "Walk Forwards", keybind: "KeyW" } as ControlKeybind,
            walkBackwards: { name: "Walk Backwards", keybind: "KeyS" } as ControlKeybind,
            walkLeft: { name: "Walk Left", keybind: "KeyA" } as ControlKeybind,
            walkRight: { name: "Walk Right", keybind: "KeyD" } as ControlKeybind,
            run: { name: "Run", keybind: "ShiftLeft" } as ControlKeybind,
            jump: { name: "Jump", keybind: "Space" } as ControlKeybind,
            crouch: { name: "Crouch", keybind: "KeyC" } as ControlKeybind,
            fly: { name: "Fly", keybind: "KeyF" } as ControlKeybind,
            sit: { name: "Sit", keybind: "KeyG" } as ControlKeybind,
            clap: { name: "Clap", keybind: "KeyH" } as ControlKeybind,
            salute: { name: "Salute", keybind: "KeyJ" } as ControlKeybind
        },
        camera: {
            pitchUp: { name: "Pitch Up", keybind: "ArrowUp" } as ControlKeybind,
            pitchDown: { name: "Pitch Down", keybind: "ArrowDown" } as ControlKeybind,
            yawLeft: { name: "Yaw Left", keybind: "ArrowLeft" } as ControlKeybind,
            yawRight: { name: "Yaw Right", keybind: "ArrowRight" } as ControlKeybind,
            firstPerson: { name: "First-Person", keybind: "Digit1" } as ControlKeybind,
            thirdPerson: { name: "Third-Person", keybind: "Digit3" } as ControlKeybind,
            collisions: { name: "Toggle Collisions", keybind: "Digit4" } as ControlKeybind
        },
        audio: {
            mute: { name: "Toggle Mic Mute", keybind: "KeyV" } as ControlKeybind,
            pushToTalk: { name: "Push-To-Talk", keybind: "KeyB" } as ControlKeybind
        },
        other: {
            resetPosition: { name: "Reset Position", keybind: "KeyK" } as ControlKeybind,
            toggleMenu: { name: "Toggle Menu", keybind: "KeyM" } as ControlKeybind,
            openChat: { name: "Open Chat", keybind: "KeyT" } as ControlKeybind
        }
    },
    mouse: {
        acceleration: true,
        invert: false,
        sensitivity: 50
    }
};

export interface ControlKeybind {
    name: string,
    keybind: string
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
            this.updateControlKeybind("movement", "clap", "hat");
        },
        updateControlKeybind<T extends keyof typeof defaultControls.keyboard>(
            category: T,
            control: keyof typeof defaultControls.keyboard[T],
            keybind: string
        ): void {
            (this.controls.keyboard[category][control] as ControlKeybind).keybind = keybind;
        }
    }
});

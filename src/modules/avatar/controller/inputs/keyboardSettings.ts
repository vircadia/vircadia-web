//
//  keyboardSettings.ts
//
//  Created by Giga on 31 May 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Notify } from "quasar";
import { userStore } from "@Stores/index";
import type { KeyboardControlCategory, KeyboardControl, Keybind } from "@Stores/user-store";
export type { KeyboardControlCategory, KeyboardControl, Keybind } from "@Stores/user-store";

interface SpecialKeyIndicator {
    icon: string;
    message: string;
}

export class KeyboardSettings {
    /**
     * Reformat any keycode to be more readable. For example, "KeyA" becomes "A".
     * @param keycode
     * @returns The reformatted key name.
     */
    public static formatKeyName(keycode: string): string {
        // Letters.
        if (keycode.includes("Key")) {
            return keycode.split("Key")[1];
        }
        // Top-row numbers.
        if (keycode.includes("Digit")) {
            return keycode.split("Digit")[1];
        }
        // Number pad numbers.
        if (keycode.includes("Numpad")) {
            return keycode.split("Numpad")[1];
        }
        // Arrow keys.
        const arrowKeys = {
            "ArrowUp": "↑",
            "ArrowDown": "↓",
            "ArrowLeft": "←",
            "ArrowRight": "→"
        } as { [key: string]: string };
        if (keycode in arrowKeys) {
            return arrowKeys[keycode];
        }
        // Control keys.
        const controlKeys = {
            "ShiftLeft": "Left Shift",
            "ShiftRight": "Right Shift",
            "ControlLeft": "Left Control",
            "ControlRight": "Right Control",
            "AltLeft": "Left Alt",
            "AltRight": "Right Alt"
        } as { [key: string]: string };
        if (keycode in controlKeys) {
            return controlKeys[keycode];
        }
        // Other (symbols, specials, etc).
        return keycode;
    }

    /**
     * Get the SpecialKeyIndicator for any particular keycode.
     * @param keycode
     * @returns
     */
    public static getSpecialKeyIndicator(keycode: string): SpecialKeyIndicator | undefined {
        if (keycode.includes("Control") || keycode.includes("Alt")) {
            return {
                icon: "priority_high",
                message: "This key may have unintended side effects."
            };
        }
        if (keycode.includes("Numpad")) {
            return {
                icon: "dialpad",
                message: "This key is on the number pad."
            };
        }
        if (keycode.includes("Gamepad")) {
            return {
                icon: "gamepad",
                message: "This button is on a gamepad."
            };
        }
        return undefined;
    }

    /**
     * Check if a keyboard key is already bound to a control.
     * @param keycode The keycode of the key to check.
     * @returns `true` if the key is already bound, `false` if not.
     */
    public static keycodeAlreadyBound(keycode: string): boolean {
        return Boolean(
            Object.entries(userStore.controls.keyboard)
                .find((category) => Object.entries(category[1]).find((value) => value[1].keycode === keycode))
        );
    }

    /**
     * Rebind a keyboard control to a different key.
     * @param keybind A reference to the keybind object to rebind.
     * @param keycode The new keycode for the control.
     */
    public static rebindControl(keybind: Keybind, keycode: string): void {
        if (!keybind || !keycode) {
            return;
        }
        // Disallow binding Escape, NumLock, Meta keys, and Function keys.
        if (
            keycode === ""
            || keycode === "Escape"
            || keycode === "NumLock"
            || keycode.includes("Meta")
            || (/^F[0-9]{1,2}$/iu).test(keycode)
        ) {
            return;
        }
        // Disallow binding multiple controls to the same key.
        if (this.keycodeAlreadyBound(keycode) && keybind.keycode !== keycode) {
            Notify.create({
                type: "negative",
                textColor: "white",
                icon: "warning",
                message: `"${this.formatKeyName(keycode)}" is already in use.`
            });
            return;
        }
        // Otherwise, bind the new key.
        keybind.keycode = keycode;
    }

    /**
     * Rebind a keyboard control to a different key.
     * @param category
     * @param control
     * @param keycode The new keycode for the control.
     */
    public static rebindControlByName<T extends KeyboardControlCategory>(category: T, control: KeyboardControl<T>, keycode: string): void {
        if (!category || !control || !keycode) {
            return;
        }
        const keybind = userStore.controls.keyboard?.[category]?.[control] as Keybind | undefined;
        if (!keybind) {
            return;
        }
        this.rebindControl(keybind, keycode);
    }
}

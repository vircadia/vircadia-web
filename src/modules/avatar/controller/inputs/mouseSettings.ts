//
//  mouseSettings.ts
//
// This file implements a centralized controller class that manages user preferences for
// mouse sensitivity, acceleration, and inverted controls.
// The controller is implemented as a singleton class to ensure that there is only one instance of the controller
// in the entire application. This keeps the state consistent across different modules.
// Event callbacks can be registered with the controller so that other modules can listen to changes in the controller's state.
// The application's Store will also be automatically updated when the state changes.
// The reason for using this controller instead of inline functions is twofold:
// • In Babylon, the relationship between the camera's angular sensibility and its inertia is complex.
// • A user-friendly sensitivity range (1 - 100) cannot be directly mapped to the camera's sensibility or inertia ranges.
//
//  Created by Giga on 9 Feb 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Store, Mutations as StoreMutations } from "@Base/store";

/**
 * Logarithmically interpolate between two values (`start` & `end`) at a given percentage (`t`).
 * @param start The start of the range.
 * @param end The end of the range.
 * @param t The percentage within the range to interpolate the value from.
 * @returns The interpolated value.
 */
function logInterpolation(start: number, end: number, t: number): number {
    return start * (end / start) ** t;
}

interface MouseSensitivityComponents {
    angularSensibilityX: number,
    angularSensibilityY: number,
    inertia: number,
    wheelDeltaMultiplier: number
}

const Sensitivity = "sensitivity";
const Acceleration = "acceleration";
const Invert = "invert";

type MouseSettingsControllerEvents = typeof Sensitivity | typeof Acceleration | typeof Invert;

type MouseSettingsControllerEventCallback<T> =
    T extends typeof Sensitivity ? (value: MouseSensitivityComponents) => void
        : T extends typeof Acceleration ? (value: boolean) => void
            : T extends typeof Invert ? (value: boolean) => void
                : never;

class MouseSettingsControllerSingleton {
    // Static, singleton properties:

    static #singletonInstance: MouseSettingsControllerSingleton;

    /**
     * Gets a reference to the global MouseSensitivityController singleton.
     * @returns The MouseSensitivityController singleton instance.
     */
    static getInstance(): MouseSettingsControllerSingleton {
        if (!MouseSettingsControllerSingleton.#singletonInstance) {
            MouseSettingsControllerSingleton.#singletonInstance = new MouseSettingsControllerSingleton();
        }
        return MouseSettingsControllerSingleton.#singletonInstance;
    }


    // Dynamic properties:

    #motionComponents = {
        sensibility: {
            min: 200,
            max: 5000,
            value: 5000,
            accelerationMultiplier: 4.5,
            accelerationWheelDeltaMultiplier: 5.5
        },
        inertia: {
            min: 0.4,
            max: 0.9,
            value: 0.9
        }
    };

    #sensitivity = {
        min: 0,
        max: 100,
        value: 100
    };

    #acceleration = true;

    #invert = false;

    #callbacks = {
        [Sensitivity]: [] as MouseSettingsControllerEventCallback<typeof Sensitivity>[],
        [Acceleration]: [] as MouseSettingsControllerEventCallback<typeof Acceleration>[],
        [Invert]: [] as MouseSettingsControllerEventCallback<typeof Invert>[]
    } as { [T in MouseSettingsControllerEvents]: MouseSettingsControllerEventCallback<T>[] };

    constructor() {
        this.sensitivity = Store.state.controls.mouse.sensitivity;
        this.acceleration = Store.state.controls.mouse.acceleration;
        this.invert = Store.state.controls.mouse.invert;
    }

    /**
     * The mouse sensitivity value (from 0 - 100).
     */
    get sensitivity(): number {
        return this.#sensitivity.value;
    }

    /**
     * The mouse sensitivity value (from 0 - 100).
     */
    set sensitivity(value: number) {
        this.#sensitivity.value = value;
        this.#motionComponents.sensibility.value = logInterpolation(
            this.#motionComponents.sensibility.max,
            this.#motionComponents.sensibility.min,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            value / 100
        ) * (this.#acceleration ? this.#motionComponents.sensibility.accelerationMultiplier : 1);

        // Update the value in the store.
        Store.commit(StoreMutations.MUTATE, {
            property: "controls.mouse.sensitivity",
            value
        });

        // Run all callback functions associated with this value.
        this.#callbacks[Sensitivity].forEach((callback) => callback(this.sensitivityComponents));
    }

    /**
     * Mouse sensitivity components that can be used to set camera movement values in Babylon.
     */
    get sensitivityComponents(): MouseSensitivityComponents {
        const sensibility = this.#invert
            ? 0 - this.#motionComponents.sensibility.value
            : this.#motionComponents.sensibility.value;
        return {
            angularSensibilityX: sensibility,
            angularSensibilityY: sensibility,
            inertia: this.#motionComponents.inertia.value,
            wheelDeltaMultiplier: this.#acceleration ? 1 : this.#motionComponents.sensibility.accelerationWheelDeltaMultiplier
        };
    }

    /**
     * Boolean specifying whether mouse acceleration is enabled or not.
     */
    get acceleration(): boolean {
        return this.#acceleration;
    }

    /**
     * Boolean specifying whether mouse acceleration is enabled or not.
     */
    set acceleration(value: boolean) {
        this.#acceleration = value;

        this.#motionComponents.inertia.value = value ? this.#motionComponents.inertia.max : this.#motionComponents.inertia.min;
        this.sensitivity = this.#sensitivity.value;

        // Update the value in the store.
        Store.commit(StoreMutations.MUTATE, {
            property: "controls.mouse.acceleration",
            value
        });

        // Run all callback functions associated with this value.
        this.#callbacks[Acceleration].forEach((callback) => callback(value));
    }

    /**
     * Boolean specifying whether mouse inversion is enabled or not.
     */
    get invert(): boolean {
        return this.#invert;
    }

    /**
     * Boolean specifying whether mouse inversion is enabled or not.
     */
    set invert(value: boolean) {
        this.#invert = value;

        this.sensitivity = this.#sensitivity.value;

        // Update the value in the store.
        Store.commit(StoreMutations.MUTATE, {
            property: "controls.mouse.invert",
            value
        });

        // Run all callback functions associated with this value.
        this.#callbacks[Invert].forEach((callback) => callback(value));
    }

    /**
     * Listen to a change in the state of the MouseSensitivityController. An event will be fired whenever the state changes.
     * @param event The event to listen for.
     * @param callback The callback function to attach to the event.
     */
    on<T extends MouseSettingsControllerEvents>(event: T, callback: MouseSettingsControllerEventCallback<T>): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: TypeScript is not narrowing the generic on this method correctly, which prevents HMR in development.
        this.#callbacks[event].push(callback);
    }
}

/**
 * The MouseSensitivityController singleton instance.
 */
export const MouseSettingsController = MouseSettingsControllerSingleton.getInstance();

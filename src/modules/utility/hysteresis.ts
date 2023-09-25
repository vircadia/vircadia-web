//
//  hysteresis.ts
//
//  Created by Giga on 4 September 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/**
 * The default number of points to sample from.
 */
const defaultLength = 10;

/**
 * A rolling average hysteresis.
 * @param getter A function to retrieve new values.
 * @param length `(Optional)` The number of points to sample the rolling average from. (Increasing this number makes the output smoother.)
 * @param threshold `(Optional)` The snapping threshold. New values with a delta greater than this threshold will cause the output to snap to said new value.
 */
export class Hysteresis {
    private getter;
    private history;
    private length;
    private threshold;

    constructor(getter: () => number, length = defaultLength, threshold?: number) {
        this.getter = getter;
        this.history = new Array<number>();
        this.length = length;
        this.threshold = threshold;

        const value = getter();
        for (let i = 0; i < this.length; i++) {
            this.history.push(value);
        }
    }

    /**
     * @returns The value from the getter with hysteresis smoothing applied.
     */
    public get(): number {
        const value = this.getter();
        this.history.shift();
        this.history.push(value);
        const average = this.history.reduce((a, b) => a + b) / this.length;
        if (typeof this.threshold === "number" && Math.abs(value - this.history[this.history.length - 2]) > this.threshold) {
            this.history = this.history.fill(value);
            return value;
        }
        return average;
    }

    /**
     * @returns The value from the getter **without** hysteresis smoothing applied.
     */
    public getInstant(): number {
        return this.getter();
    }
}

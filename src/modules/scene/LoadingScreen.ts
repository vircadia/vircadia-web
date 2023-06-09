//
//  LoadingScreen.ts
//
//  Created by Giga on 27 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ILoadingScreen } from "@babylonjs/core";
import type { ISceneLoaderProgressEvent } from "@babylonjs/core";
import { applicationStore } from "@Stores/index";

const BYTES_PER_MEGABYTE = 1000000;
const MS_PER_SECOND = 1000;
const DOWNLOAD_SPEED_HYSTERESIS = 10;
let previousDownloadAmount = 0;
let previousDownloadSpeeds = [] as number[];
let previousDownloadTime = Date.now();

export class CustomLoadingScreen implements ILoadingScreen {
    loadingUIElement: HTMLElement;
    loadingUIBackgroundColor: string;
    loadingUIText: string;
    transitionTime: number;

    constructor(element: HTMLElement) {
        this.loadingUIElement = element;
        this.loadingUIBackgroundColor = "#000";
        this.loadingUIText = "";
        this.transitionTime = 0.5;
    }

    displayLoadingUI(): void {
        if (this.loadingUIElement) {
            this.loadingUIElement.style.opacity = "1";
            this.loadingUIElement.style.transition = `${this.transitionTime}s linear opacity`;
            this.loadingUIElement.style.pointerEvents = "all";
        }
    }

    hideLoadingUI(): void {
        if (this.loadingUIElement) {
            this.loadingUIElement.style.opacity = "0";
            this.loadingUIElement.style.transition = `${this.transitionTime}s linear opacity`;
            this.loadingUIElement.style.pointerEvents = "none";
        }
    }
}

/**
 * Update the Store as to the state of content actively being loaded.
 * @param event The progress event provided by the SceneLoader.
 */
export function updateContentLoadingProgress(event: ISceneLoaderProgressEvent, contentName?: string): void {
    // Calculate the download speed.
    const currentTime = Date.now();
    const timeDifference = (currentTime - previousDownloadTime) / MS_PER_SECOND;
    const amountDifference = (event.loaded - previousDownloadAmount) / BYTES_PER_MEGABYTE;

    // Apply hysteresis to reduce jitter in the measurement.
    previousDownloadSpeeds.push(amountDifference / timeDifference);
    previousDownloadSpeeds = previousDownloadSpeeds.slice(-DOWNLOAD_SPEED_HYSTERESIS);
    let averageSpeed = previousDownloadSpeeds.reduce((previousValue, currentValue) => previousValue + currentValue)
        / previousDownloadSpeeds.length;
    averageSpeed = isNaN(averageSpeed) || !isFinite(averageSpeed) ? 0 : averageSpeed;

    // Set the speed in the store.
    applicationStore.renderer.contentLoadingSpeed = event.loaded < event.total ? Math.abs(averageSpeed) : 0;
    previousDownloadAmount = event.loaded;
    previousDownloadTime = currentTime;

    // Set the download message.
    applicationStore.renderer.contentLoadingInfo = contentName ?? "";

    // Set the download state.
    if (event.lengthComputable) {
        applicationStore.renderer.contentIsLoading = event.loaded < event.total;
    }
}

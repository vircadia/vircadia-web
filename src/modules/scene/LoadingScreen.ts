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

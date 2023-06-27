//
//  NFTIconController.ts
//
//  Created by Nolan Huang on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Vector3, Scalar } from "@babylonjs/core";
import { inspector } from "@Modules/script";
import { EntityScriptComponent } from "./EntityScript";

export class NFTIconController extends EntityScriptComponent {
    _currentIndex = 0;
    @inspector({ min: 0.1, max: 2 * Math.PI })
        _rotationSpeed = 0.5 * Math.PI;

    _currentRotationSpeed = 0;

    _rotationDuration = 0;

    @inspector({ min: 0.1, max: 50 })
        _switchDuration = 10;

    constructor() {
        super(NFTIconController.typeName);
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return NFTIconController.typeName;
    }

    static get typeName(): string {
        return "NFTIconController";
    }

    public onUpdate(): void {
        if (!this._gameObject) {
            return;
        }

        const nftIcons = this._gameObject.getChildGameObjects();
        if (this._currentIndex < nftIcons.length) {
            const nft = nftIcons[this._currentIndex];

            const dt = this._scene.getEngine().getDeltaTime() / 1000;
            this._currentRotationSpeed = Scalar.Lerp(this._currentRotationSpeed, this._rotationSpeed, 0.1);
            nft.rotate(Vector3.Up(), this._currentRotationSpeed * dt);

            this._rotationDuration += dt;
            if (this._rotationDuration > this._switchDuration) {
                this._rotationDuration -= this._switchDuration;
                this._currentIndex = Math.floor(Math.random() * nftIcons.length);
            }
        }
    }
}

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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// General Modules
import {
    Vector3,
    Scalar
} from "@babylonjs/core";
import { GameObject } from "@Modules/object";
import Log from "@Modules/debugging/log";
// Domain Modules
import { inspector } from "@Modules/script";
import { EntityScriptComponent } from "./EntityScript";

export class NFTIconController extends EntityScriptComponent {

    _nfts : Array<GameObject> = new Array<GameObject>();
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

    // domain properties
    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return NFTIconController.typeName;
    }

    static get typeName(): string {
        return "NFTIconController";
    }

    public onStart(): void {
        if (this._gameObject) {
            const gameObjects = this._gameObject.getChildMeshes(false, (node) => node instanceof GameObject);
            gameObjects.forEach((gameObject) => {
                this._nfts.push(gameObject as GameObject);
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {
        if (this._currentIndex < this._nfts.length) {
            const nft = this._nfts[this._currentIndex];

            const dt = this._scene.getEngine().getDeltaTime() / 1000;
            this._currentRotationSpeed = Scalar.Lerp(this._currentRotationSpeed, this._rotationSpeed, 0.1);
            nft.rotate(Vector3.Up(), this._currentRotationSpeed * dt);

            this._rotationDuration += dt;
            if (this._rotationDuration > this._switchDuration) {
                this._rotationDuration -= this._switchDuration;
                this._currentIndex = Math.floor(Math.random() * this._nfts.length);
            }
        }
    }
}

//
//  boxCollider.ts
//
//  Created by Nolan Huang on 30 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ColliderComponent } from "./collider";

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Scene, Vector3, MeshBuilder, Color4, Color3, PhysicsImpostor
} from "@babylonjs/core";

/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */

export class BoxColliderComponent extends ColliderComponent {
    /**
    * Gets a string identifying the type of this Component
    * @returns "Mesh" string
    */
    public get componentType():string {
        return BoxColliderComponent.typeName;
    }

    static get typeName(): string {
        return "BoxCollider";
    }

    public create(scene: Nullable<Scene>, dimensions?: Vector3, position?: Vector3) : void {
        /*
        const defaultColor = Color3.Blue();
        const color = new Color4(defaultColor.r, defaultColor.g, defaultColor.b, 1);
        const faceColors = [color, color, color, color, color, color]; */

        const options = {
            width: dimensions?.x,
            height: dimensions?.y,
            depth: dimensions?.z
        };

        const boxCollider = MeshBuilder.CreateBox("BoxCollider", options, scene);
        boxCollider.physicsImpostor = new PhysicsImpostor(boxCollider, PhysicsImpostor.BoxImpostor,
            { mass: 0 }, scene ?? undefined);

        if (position) {
            boxCollider.position = position;
        }

        boxCollider.isVisible = false;
        // boxCollider.isPickable = false;
        // boxCollider.checkCollisions = false;

        this.collider = boxCollider;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    protected _createColliderImposterForCompoundBody() : void {
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    protected _createColliderImposter() : void {

    }
}

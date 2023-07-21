//
//  capsuleCollider.ts
//
//  Created by Nolan Huang on 4 Oct 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */

import { MeshBuilder, PhysicsImpostor } from "@babylonjs/core";
import type { Vector3 } from "@babylonjs/core";
import { ColliderComponent } from "./collider";

export class CapsuleColliderComponent extends ColliderComponent {
    /**
     * A string identifying the type of this component.
     * @returns `"CapsuleCollider"`
     */
    public get componentType(): string {
        return CapsuleColliderComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"CapsuleCollider"`
     */
    static get typeName(): string {
        return "CapsuleCollider";
    }

    public createCollider(radius?: number, height?: number, position?: Vector3): void {
        // This needs to be set before assigning the collider, as it determines how the assignment is handled.
        this._compoundBody = true;

        this.collider = MeshBuilder.CreateCapsule(CapsuleColliderComponent.typeName, { radius, height }, this._scene);

        if (position) {
            this.collider.position = position;
        }

        this.collider.material = this._getMaterial();
        this.collider.isVisible = false;
        this.collider.checkCollisions = false;
    }

    protected _createColliderImposter(): void {
        if (this.collider) {
            // Create CapsuleImpostor with zero mass.
            this.collider.physicsImpostor = new PhysicsImpostor(this.collider, PhysicsImpostor.CapsuleImpostor, { mass: 0 }, this._scene);
        }
    }
}

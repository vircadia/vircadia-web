//
//  meshCollider.ts
//
//  Created by Nolan Huang on 30 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */

import { ColliderComponent } from "./collider";
import { AbstractMesh, PhysicsImpostor, type Nullable } from "@babylonjs/core";

export class MeshColliderComponent extends ColliderComponent {
    /**
     * A string identifying the type of this component.
     * @returns `"MeshCollider"`
     */
    public get componentType(): string {
        return MeshColliderComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"MeshCollider"`
     */
    static get typeName(): string {
        return "MeshCollider";
    }

    public set collider(value: Nullable<AbstractMesh>) {
        if (value) {
            value.getChildMeshes().forEach((m) => {
                m.scaling.x = Math.abs(m.scaling.x);
                m.scaling.y = Math.abs(m.scaling.y);
                m.scaling.z = Math.abs(m.scaling.z);

                if (m.physicsImpostor) {
                    m.physicsImpostor.dispose();
                }

                m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0 }, value.getScene());
            });

            value.physicsImpostor = new PhysicsImpostor(value, PhysicsImpostor.BoxImpostor,
                { mass: 0, friction: 0.5, restitution: 0.7 }, value.getScene());

        } else if (this.collider) {
            this.collider.getChildMeshes().forEach((m) => {
                if (m.physicsImpostor) {
                    m.physicsImpostor.dispose();
                }
            });
        }

        super.collider = value;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    protected _createColliderImposterForCompoundBody(): void {
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    protected _createColliderImposter(): void {
    }
}

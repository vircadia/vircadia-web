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

/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */

import { MeshBuilder, PhysicsImpostor } from "@babylonjs/core";
import type { Scene, Vector3 } from "@babylonjs/core";
import { ColliderComponent } from "./collider";

export class BoxColliderComponent extends ColliderComponent {
    /**
     * A string identifying the type of this component.
     * @returns `"BoxCollider"`
     */
    public get componentType(): string {
        return BoxColliderComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"BoxCollider"`
     */
    static get typeName(): string {
        return "BoxCollider";
    }

    public create(scene: Nullable<Scene>, dimensions?: Vector3, position?: Vector3): void {
        const options = {
            width: dimensions?.x,
            height: dimensions?.y,
            depth: dimensions?.z
        };

        this.collider = MeshBuilder.CreateBox(BoxColliderComponent.typeName, options, scene);
        this.collider.physicsImpostor = new PhysicsImpostor(this.collider, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene ?? undefined);

        if (position) {
            this.collider.position = position;
        }

        this.collider.isVisible = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected _createColliderImposterForCompoundBody(): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected _createColliderImposter(): void {
    }
}

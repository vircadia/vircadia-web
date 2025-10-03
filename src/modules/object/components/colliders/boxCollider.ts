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



import { MeshBuilder } from "@babylonjs/core";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
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
        // create v2 aggregate for the collider mesh
        // eslint-disable-next-line no-new
        new PhysicsAggregate(this.collider, PhysicsShapeType.BOX, { mass: 0 }, scene ?? undefined);

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

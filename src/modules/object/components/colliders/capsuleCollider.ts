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



import { MeshBuilder, Vector3 } from "@babylonjs/core";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import type { Vector3 as Vector3Type } from "@babylonjs/core";
import { ColliderComponent } from "./collider";

export class CapsuleColliderComponent extends ColliderComponent {
    private _radius = 0.3;
    private _height = 1.8;
    private _center = new Vector3(0, 0, 0);
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

    public createCollider(radius?: number, height?: number, position?: Vector3Type): void {
        // This needs to be set before assigning the collider, as it determines how the assignment is handled.
        this._compoundBody = true;

        if (radius) this._radius = radius;
        if (height) this._height = height;

        this.collider = MeshBuilder.CreateCapsule(
            CapsuleColliderComponent.typeName,
            { radius: this._radius, height: this._height },
            this._scene
        );

        if (position) {
            this._center = position.clone();
            this.collider.position = this._center.clone();
        } else {
            this._center.setAll(0);
        }

        this.collider.material = this._getMaterial();
        this.collider.isVisible = false;
        this.collider.checkCollisions = false;
    }

    protected _createAggregate(): void {
        if (this._gameObject) {
            this._aggregate?.dispose();
            const half = Math.max(0, this._height / 2 - this._radius);
            const pointA = new Vector3(0, half, 0);
            const pointB = new Vector3(0, -half, 0);
            this._aggregate = new PhysicsAggregate(
                this._gameObject,
                PhysicsShapeType.CAPSULE,
                {
                    mass: this._mass,
                    friction: this._friction,
                    restitution: this._restitution,
                    radius: this._radius,
                    pointA,
                    pointB,
                    center: this._center,
                },
                this._scene
            );
        }
    }
}

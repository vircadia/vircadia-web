//
//  collider.ts
//
//  Created by Nolan Huang on 30 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { StandardMaterial, Vector3 } from "@babylonjs/core";
import type { AbstractMesh, Material, Nullable, Scene } from "@babylonjs/core";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { GenericNodeComponent } from "@Modules/object/component";
import type { GameObject } from "@Modules/object/GameObject";

const DEFAULT_MASS = 1;
const DEFAULT_FRICTION = 0.5;
const DEFAULT_RESTITUTION = 0;

const COLLIDER_MATERIAL_NAME = "ColliderMaterial";

/**
 * Base class of collider component.
 */
export abstract class ColliderComponent extends GenericNodeComponent<AbstractMesh> {
    protected _collider: Nullable<AbstractMesh> = null;
    protected _scene: Scene;
    protected _mass: number;
    protected _friction: number;
    protected _restitution: number;
    protected _compoundBody = false;
    protected _angularFactor = new Vector3(1, 1, 1);
    protected _aggregate: Nullable<PhysicsAggregate> = null;
    protected _body: Nullable<PhysicsBody> = null;

    constructor(scene: Scene, mass?: number, friction?: number, restitution?: number) {
        super();
        this._scene = scene;
        this._mass = mass ?? DEFAULT_MASS;
        this._friction = friction ?? DEFAULT_FRICTION;
        this._restitution = restitution ?? DEFAULT_RESTITUTION;
    }

    public get collider(): Nullable<AbstractMesh> {
        return this._collider;
    }

    public set collider(value: Nullable<AbstractMesh>) {
        this._collider = value;

        // Compound Body creates an appropriately shaped standard mesh to fix an irregular mesh.
        // TODO: Need to attach this collider mesh to the game object.
        if (this._compoundBody) {
            this.node = this._collider;
        }
    }

    public get mass(): number {
        return this._mass;
    }

    public set mass(value: number) {
        this._mass = value;

        this._disposeAggregate();
        this._createAggregate();
        if (this._gameObject && this._aggregate) {
            this._body = this._aggregate.body;
            this._gameObject.physicsBody = this._body;
        }
    }

    public setAngularFactor(x: number, y: number, z: number): void {
        this._angularFactor.x = x;
        this._angularFactor.y = y;
        this._angularFactor.z = z;

        // TODO: Map angular factor to v2 constraints if needed.
    }

    public attach(gameObject: GameObject): void {
        super.attach(gameObject);
        this._createAggregate();
        if (this._gameObject && this._aggregate) {
            this._body = this._aggregate.body;
            this._gameObject.physicsBody = this._body;
        }
    }

    public detach(): void {
        this._disposeAggregate();
        super.detach();
    }

    protected _createAggregate(): void { /* no-op base */ }

    protected _disposeAggregate(): void {
        if (this._aggregate) {
            this._aggregate.dispose();
            this._aggregate = null;
        }
        if (this._gameObject) {
            this._gameObject.physicsBody = undefined;
        }
        this._body = null;
    }

    protected _getMaterial(): Material {
        let material = this._scene.getMaterialByName(COLLIDER_MATERIAL_NAME);
        if (!material) {
            material = new StandardMaterial(COLLIDER_MATERIAL_NAME);
            material.wireframe = true;
        }

        return material;
    }

    // V2 API does not expose impostors; using aggregates instead.
}

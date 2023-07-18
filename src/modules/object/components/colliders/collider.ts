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

import { PhysicsImpostor, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { AbstractMesh, Material, Nullable, Scene } from "@babylonjs/core";
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

        const impostor = this._getImpostor();
        if (impostor) {
            // NOTE:
            // Changing the mass causes a strange issue.
            // Re-create the importers to prevent this.
            this._disposeImposters();
            this._createImposters();
        }
    }

    public setAngularFactor(x: number, y: number, z: number): void {
        this._angularFactor.x = x;
        this._angularFactor.y = y;
        this._angularFactor.z = z;

        const impostor = this._getImpostor();
        if (impostor) {
            impostor.physicsBody.setAngularFactor(x, y, z);
        }
    }

    public attach(gameObject: GameObject): void {
        super.attach(gameObject);
        this._createImposters();
    }

    public detach(): void {
        this._disposeImposters();
        super.detach();
    }

    protected _createImposters(): void {
        this._createColliderImposter();

        // Create NoImposter and attach it to the game object.
        if (this._gameObject && !this._gameObject.physicsImpostor) {
            this._gameObject.physicsImpostor = new PhysicsImpostor(
                this._gameObject, PhysicsImpostor.NoImpostor,
                { mass: this._mass, restitution: this._restitution, friction: this._friction },
                this._scene);
            this._gameObject.physicsImpostor.physicsBody.setAngularFactor(
                this._angularFactor.x, this._angularFactor.y, this._angularFactor.z);
        }
    }

    protected abstract _createColliderImposter(): void;

    protected _disposeImposters(): void {
        if (this._gameObject && this._gameObject.physicsImpostor) {
            this._gameObject.physicsImpostor.dispose();
            this._gameObject.physicsImpostor = null;
        }

        if (this.collider && this.collider.physicsImpostor) {
            this.collider.physicsImpostor.dispose();
            this.collider.physicsImpostor = null;
        }
    }

    protected _getMaterial(): Material {
        let material = this._scene.getMaterialByName(COLLIDER_MATERIAL_NAME);
        if (!material) {
            material = new StandardMaterial(COLLIDER_MATERIAL_NAME);
            material.wireframe = true;
        }

        return material;
    }

    protected _getImpostor(): Nullable<PhysicsImpostor> {
        if (this._gameObject && this._gameObject.physicsImpostor) {
            return this._gameObject.physicsImpostor;
        }
        return null;
    }
}

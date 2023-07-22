//
//  script.ts
//
//  Created by Nolan Huang on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IComponent, GameObject, MeshComponent } from "@Modules/object";
import { inspectorAccessor } from "./decorators";

import {
    AbstractMesh,
    ActionManager,
    TransformNode,
    ExecuteCodeAction,
    IAction,
    Nullable,
    Observer
} from "@babylonjs/core";

import Log from "@Modules/debugging/log";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * The base class from which every script derives
 */
export abstract class ScriptComponent extends TransformNode implements IComponent {
    protected _gameObject: Nullable<GameObject> = null;
    protected _triggerTarget: Nullable<AbstractMesh> = null;
    protected _triggerOnEnterAction: Nullable<IAction> = null;
    protected _triggerOnExitAction: Nullable<IAction> = null;
    protected _onComponentAddedObserver: Nullable<Observer<IComponent>> = null;

    public attach(gameObject: GameObject): void {
        this._gameObject = gameObject;
        this.parent = gameObject;

        if (this._triggerTarget) {
            this._registerTriggerEvents();
        }
    }

    public detach():void {
        this.parent = null;
        this._gameObject = null;
    }

    public get gameObject(): Nullable<GameObject> {
        return this._gameObject;
    }

    public set triggerTarget(mesh: Nullable<AbstractMesh>) {
        if (this._triggerTarget !== mesh) {
            this._triggerTarget = mesh;

            if (this._gameObject) {
                this._registerTriggerEvents();
            }
        }
    }

    public get triggerTarget(): Nullable<AbstractMesh> {
        return this._triggerTarget;
    }


    /**
    * Gets a string identifying the type of this Component
    * @returns "Script" string
    */
    @inspectorAccessor()
    public get componentType(): string {
        return "Script";
    }

    /**
     * Called on the node is being initialized.
     */
    public onInitialize(): void {
    // ...
    }

    /**
     * Called on the scene starts.
     */
    public onStart(): void {
    // ...
    }

    /**
     * Called each frame.
     */
    public onUpdate(): void {
    // ...
    }

    /**
     * Called on the object has been disposed.
     * Object can be disposed manually or when the editor stops running the scene.
     */
    public onStop(): void {
    // ...
    }

    /**
     * When the GameObject collides with a target GameObject.
     */
    public onTriggerEnter(): void {

    }

    public onTriggerExit(): void {

    }

    protected _registerTriggerEvents(): void {
        if (!this._gameObject || !this._triggerTarget) {
            return;
        }

        for (const component of this._gameObject.components.values()) {
            if (component instanceof MeshComponent) {
                this._doRegisterTriggerEvents(component);
                break;
            }
        }

        // handle the condition of mesh component rebuilt
        if (!this._onComponentAddedObserver) {
            this._onComponentAddedObserver = this._gameObject.onComponentAddedObservable.add((component) => {
                if (component instanceof MeshComponent) {
                    this._doRegisterTriggerEvents(component);
                }
            });
        }
    }

    private _doRegisterTriggerEvents(component: MeshComponent): void {
        if (component.mesh) {
            this._doRegisterTriggerEventsWithMesh(component.mesh);
        }

        // handle the condition of mesh rebuilt
        component.onNodeAttachedObservable.add((newMesh) => {
            Log.debug(Log.types.OTHER, "onNodeAttached");
            this._doRegisterTriggerEventsWithMesh(newMesh);
        });
    }

    private _doRegisterTriggerEventsWithMesh(mesh: AbstractMesh): void {
        if (!this._gameObject || !this._triggerTarget) {
            return;
        }

        // eslint-disable-next-line max-len
        Log.debug(Log.types.OTHER, `registerTriggerEvents for: ${this._gameObject.name} Owner: ${mesh.uniqueId} Target: ${this._triggerTarget.name}`);
        if (!mesh.actionManager) {
            mesh.actionManager = new ActionManager(this._gameObject.getScene());
        }
        const actionManager = mesh.actionManager;

        if (this._triggerOnEnterAction) {
            actionManager.unregisterAction(this._triggerOnEnterAction);
        }
        this._triggerOnEnterAction = actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this._triggerTarget
                },
                () => {
                    this.onTriggerEnter();
                }
            )
        );

        if (this._triggerOnExitAction) {
            actionManager.unregisterAction(this._triggerOnExitAction);
        }
        this._triggerOnExitAction = actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionExitTrigger,
                    parameter: this._triggerTarget
                },
                () => {
                    this.onTriggerExit();
                }
            )
        );
    }
}

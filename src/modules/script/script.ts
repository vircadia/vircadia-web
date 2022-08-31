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

import { IComponent, GameObject } from "@Modules/object";
import { inspectorAccessor } from "./decorators";

import {
    AbstractMesh,
    ActionManager,
    TransformNode,
    ExecuteCodeAction,
    IAction
} from "@babylonjs/core";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * The base class from which every script derives
 */
export abstract class ScriptComponent extends TransformNode implements IComponent {
    protected _gameObject: Nullable<GameObject> = null;
    protected _triggerTarget: Nullable<AbstractMesh> = null;
    protected _triggerOnEnterAction : Nullable<IAction> = null;
    protected _triggerOnExitAction : Nullable<IAction> = null;

    public attach(gameObject:GameObject):void {
        this._gameObject = gameObject;
        this.parent = gameObject;

        if (this._triggerTarget) {
            this._registerTriggerEvents();
        }
    }

    public detatch():void {
        this.parent = null;
        this._gameObject = null;
    }

    public set triggerTarget(mesh: Nullable<AbstractMesh>) {
        this._triggerTarget = mesh;

        if (this._gameObject) {
            this._registerTriggerEvents();
        }
    }

    public get triggerTarget() : Nullable<AbstractMesh> {
        return this._triggerTarget;
    }


    /**
    * Gets a string identifying the type of this Component
    * @returns "Script" string
    */
    @inspectorAccessor()
    public get componentType():string {
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
     * When the GameObject collides with targe GameObject.
     */
    public onTriggerEnter() : void {

    }

    public onTriggerExit() : void {

    }

    private _registerTriggerEvents() : void {
        if (!this._gameObject || !this._triggerTarget) {
            return;
        }

        const meshes = this._gameObject.getChildMeshes(true);
        if (meshes.length <= 0) {
            return;
        }

        const mesh = meshes[0];
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

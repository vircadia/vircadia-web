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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { accessorDisplayInInspector } from "./decorators";
import {
    // IInspectable,
    InspectableType
} from "@babylonjs/core/Misc";

/* eslint-disable class-methods-use-this */

interface IInspectPropertyDesc {
    /**
     * Gets the name of the property to edit
     */
    propertyName: string;
    /**
     * Gets the label to display
     */
    label?: string;
    /**
     * Gets the type of the editor to use
     */
    type?: InspectableType;
    /**
     * Gets the minimum value of the property when using in "slider" mode
     */
    min?: number;
    /**
     * Gets the maximum value of the property when using in "slider" mode
     */
    max?: number;
    /**
     * Gets the setp to use when using in "slider" mode
     */
    step?: number;
    /**
     * Gets the callback function when using "Button" mode
     */
    callback?: () => void;
    /**
     * Gets the list of options when using "Option" mode
     */
    options?: [];
}

import {
    // Scene,
    TransformNode
} from "@babylonjs/core";
/**
 *
 */
export abstract class ScriptComponent extends TransformNode implements IComponent {
    _gameObject:Nullable<GameObject> = null;

    // @accessorDisplayInInspector()
    public get type():string {
        return this.getComponentType();
    }

    public attach(gameObject:GameObject):void {
        this._gameObject = gameObject;
        this.parent = gameObject;
    }

    public detatch():void {
        this.parent = null;
        this._gameObject = null;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Script" string
    */
    public getComponentType():string {
        return "Script";
    }

    /**
     * Called on the node is being initialized.
     * This function is called immediatly after the constructor has been called.
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

    public inspectorProperty(properties:IInspectPropertyDesc) : void {
        this.inspectableCustomProperties = this.inspectableCustomProperties ?? [];
        this.inspectableCustomProperties.push(
            {
                propertyName: properties.propertyName,
                label: properties.label ?? properties.propertyName[0].toUpperCase() + properties.propertyName.slice(1),
                type: properties.type ?? InspectableType.String,
                min: properties.min,
                max: properties.max,
                step: properties.step,
                options: properties.options
            }
        );
    }

    protected inspectorPropertyString(propertyName:string, displayName?:string) : void {
        this.inspectableCustomProperties = this.inspectableCustomProperties ?? [];
        this.inspectableCustomProperties.push(
            {
                label: displayName ?? propertyName[0].toUpperCase() + propertyName.slice(1),
                propertyName,
                type: InspectableType.String
            }
        );
    }
}

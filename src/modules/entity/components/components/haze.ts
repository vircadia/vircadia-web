//
//  haze.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { GenericNodeComponent } from "@Modules/object";
import { Scene, TransformNode } from "@babylonjs/core";
import { IHazeProperty } from "../../EntityProperties";
import { EntityMapper } from "../../package";

export class HazeComponent extends GenericNodeComponent<TransformNode> {
    _scene: Scene;

    constructor(props: IHazeProperty, scene: Scene) {
        super();
        this._node = new TransformNode(HazeComponent.typeName, scene);
        this._scene = scene;

        this.update(props);
    }

    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return HazeComponent.typeName;
    }

    static get typeName(): string {
        return "Haze";
    }

    public get enable(): boolean {
        return this._scene.fogEnabled;
    }

    public set enable(value: boolean) {
        this._scene.fogEnabled = value;
    }

    public dispose(): void {
        super.dispose();
        this._scene.fogEnabled = false;
    }

    public update(props: IHazeProperty): void {
        this._scene.fogMode = Scene.FOGMODE_LINEAR;

        if (props.hazeColor) {
            this._scene.fogColor = EntityMapper.mapToColor3(props.hazeColor);
        }
        this._scene.fogStart = 20;

        if (props.hazeRange) {
            this._scene.fogEnd = props.hazeRange;
        }
    }
}

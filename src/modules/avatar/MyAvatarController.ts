//
//  AvatarController.ts
//
//  Created by Nolan Huang on 22 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    Node,
    TransformNode
} from "@babylonjs/core";

import { AvatarMapper } from "./AvatarMapper";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ScriptComponent, accessorDisplayInInspector } from "@Modules/script";

// Domain Modules
import { MyAvatarInterface, SkeletonJoint } from "@vircadia/web-sdk";

export class MyAvatarController extends ScriptComponent {
    private _myAvatar : MyAvatarInterface;
    private _skeletonNodes: Array<TransformNode>;

    constructor(avatar :MyAvatarInterface) {
        super("MyAvatarController");
        this._myAvatar = avatar;
        this._skeletonNodes = new Array<TransformNode>();
    }

    // @accessorDisplayInInspector()
    public get skeletonModelURL() : string {
        return this._myAvatar.skeletonModelURL;
    }

    public set skeletonModelURL(value:string) {
        this._myAvatar.skeletonModelURL = value;
    }

    // @accessorDisplayInInspector()
    public get displayName() : string {
        return this._myAvatar.displayName;
    }

    public set displayName(value:string) {
        this._myAvatar.displayName = value;
    }

    // @accessorDisplayInInspector()
    public get sessionDisplayName() : string {
        return this._myAvatar.sessionDisplayName;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "MyAvatarController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public getComponentType():string {
        return "MyAvatarController";
    }

    public onInitialize(): void {
        if (!this._gameObject) {
            return;
        }

        this._myAvatar.scale = AvatarMapper.mapToJointScale(this._gameObject.scaling);

        const rootNode = this._gameObject.getChildren()[0];
        const skeleton = new Array<SkeletonJoint>();
        this._collectJointData(rootNode, -1, skeleton);
        this._myAvatar.skeleton = skeleton;
    }


    public onUpdate():void {
        if (this._gameObject) {
            // sync position
            this._myAvatar.position = AvatarMapper.mapToJointPosition(this._gameObject.position);
            // sync orientation
            this._myAvatar.orientation = AvatarMapper.mapToJointQuaternion(this._gameObject.rotationQuaternion);

            // sync joint data
            for (let i = 0; i < this._myAvatar.jointRotations.length; i++) {
                this._myAvatar.jointTranslations[i]
                        = AvatarMapper.mapToJointPosition(this._skeletonNodes[i].position);
                this._myAvatar.jointRotations[i]
                        = AvatarMapper.mapToJointQuaternion(this._skeletonNodes[i].rotationQuaternion);
            }
        }
    }

    private _collectJointData(node:Node, parentIndex: number, joints: SkeletonJoint[]) : void {
        let jointIndex = parentIndex;
        if (node.name === "__root__" || node.getClassName() === "TransformNode") {
            const transNode = node as TransformNode;
            this._skeletonNodes.push(transNode);

            jointIndex = joints.length;
            const joint = AvatarMapper.mapToJoint(transNode, jointIndex, parentIndex);
            joints.push(joint);
        }

        const children = node.getChildren();
        children.forEach((child) => {
            this._collectJointData(child, jointIndex, joints);
        });
    }
}

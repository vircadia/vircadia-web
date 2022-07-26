//
//  AnimationController.ts
//
//  Created by Nolan Huang on 11 July 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import {
    AnimationGroup,
    Nullable,
    Node,
    TransformNode,
    Mesh
} from "@babylonjs/core";

type AnimationName =
"idle02" | "walk_fwd" | "walk_bwd" | "walk_left" | "walk_right" |
"turn_left" | "turn_right";

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */
export class AnimationController {
    private _mesh: Mesh;
    private _currentAnim: Nullable<AnimationGroup> = null;
    private _prevAnim: Nullable<AnimationGroup> = null;
    private _animGroups : Map<string, AnimationGroup>;

    constructor(mesh: Mesh, animGroups: AnimationGroup[]) {
        this._mesh = mesh;

        this._animGroups = new Map<string, AnimationGroup>();

        const nodes = new Map<string, Node>();
        this._mesh.getChildren((node):boolean => {
            nodes.set(node.name, node);
            return true;
        }, false);

        animGroups.forEach((animGroup : AnimationGroup) => {
            const newAnimGroup = AnimationController._cloneAnimGroup(animGroup, nodes);
            this._animGroups.set(animGroup.name, newAnimGroup);
        });

    }

    public play(animName : AnimationName) : void {
        const animGroup = this._animGroups.get(animName);
        if (animGroup) {
            this._currentAnim = animGroup;
        }
    }

    public update():void {
        if (this._currentAnim !== null && this._currentAnim !== this._prevAnim) {
            this._prevAnim?.stop();
            this._currentAnim.start(this._currentAnim.loopAnimation, 1.0, 2, this._currentAnim.to, false);
            this._prevAnim = this._currentAnim;
        }

    }

    static _cloneAnimGroup(sourceAnimGroup : AnimationGroup, nodes : Map<string, Node>, loop = true):AnimationGroup {
        const animGroup = new AnimationGroup(sourceAnimGroup.name);
        animGroup.loopAnimation = loop;

        sourceAnimGroup.targetedAnimations.forEach((targetAnim) => {
            const target = targetAnim.target as TransformNode;
            const node = nodes.get(target.name);
            if (node) {
                animGroup.addTargetedAnimation(targetAnim.animation, node);
            }
        });

        return animGroup;
    }
}

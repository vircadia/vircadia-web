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

/* eslint-disable @typescript-eslint/no-magic-numbers */

import { AnimationGroup, Nullable, Node, TransformNode, Mesh } from "@babylonjs/core";
import { AnimationMap } from "@Modules/avatar/controller/avatarState";

export class Animator {
    private _mesh: Mesh;
    private _currentAnim: Nullable<AnimationGroup> = null;
    private _prevAnim: Nullable<AnimationGroup> = null;
    private _nextAnim: Nullable<AnimationGroup> = null;
    private _animGroups: Map<string, AnimationGroup>;
    private _weight = 0;
    private _weightStep = 0;
    private _animTransitionSpeed = 0.1; // A lower number will result in a longer transition between animations.

    constructor(mesh: Mesh, animGroups: AnimationGroup[]) {
        this._mesh = mesh;

        this._animGroups = new Map<string, AnimationGroup>();

        const nodes = new Map<string, Node>();
        this._mesh.getChildren((node): boolean => {
            nodes.set(node.name, node);
            return true;
        }, false);

        animGroups.forEach((animGroup: AnimationGroup) => {
            const animationLoopData = [...AnimationMap.values()].find((value) => value.name === animGroup.name);
            const loopAnimation = animationLoopData?.loop ?? true;
            const newAnimGroup = Animator._cloneAnimGroup(animGroup, nodes, loopAnimation);
            this._animGroups.set(animGroup.name, newAnimGroup);
        });

    }

    public play(animName: string): void {
        const animGroup = this._animGroups.get(animName);
        if (animGroup) {
            this._nextAnim = animGroup;
        }
    }

    public pause(): void {
        this._currentAnim?.pause();
    }

    public resume(): void {
        this._currentAnim?.play();
    }

    public getAnimationGroup(animName: string): AnimationGroup | undefined {
        return this._animGroups.get(animName);
    }

    public update(): void {
        if (this._nextAnim && this._nextAnim !== this._currentAnim) {
            this._prevAnim?.stop();
            const animationFramerate = 30;
            const engineTimestep = 1000 / this._mesh.getEngine().getTimeStep();
            const animLoopData = [...AnimationMap.values()].find((animMapValue) => animMapValue.name === this._nextAnim?.name);
            this._nextAnim.start(
                this._nextAnim.loopAnimation,
                1.0,
                animLoopData?.loopStart ? animLoopData.loopStart * (engineTimestep / animationFramerate) : this._nextAnim.from,
                animLoopData?.loopEnd ? animLoopData.loopEnd * (engineTimestep / animationFramerate) : this._nextAnim.to,
                false
            );

            this._prevAnim = this._currentAnim;
            this._currentAnim = this._nextAnim;
            this._nextAnim = null;

            this._weight = this._prevAnim ? 0 : 1;
            this._weightStep = Math.min(1, Math.max(this._animTransitionSpeed, 1 / this._currentAnim.to));
        }

        this._transitAnimation();
    }

    // blend previous and current animation
    private _transitAnimation(): void {
        if (this._weight < 1) {
            this._weight += Math.min(this._weightStep, 1);

            this._currentAnim?.setWeightForAllAnimatables(this._weight);
            this._prevAnim?.setWeightForAllAnimatables(1 - this._weight);

            if (this._weight >= 1) {
                this._prevAnim?.stop();
                this._prevAnim = null;
            }
        }
    }

    static _cloneAnimGroup(sourceAnimGroup: AnimationGroup, nodes: Map<string, Node>, loop = true): AnimationGroup {
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

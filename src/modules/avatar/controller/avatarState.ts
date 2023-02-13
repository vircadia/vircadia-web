//
//  avatarState.ts
//
//  Created by Nolan Huang on 17 Oct 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable new-cap */

import { Vector3 } from "@babylonjs/core";

export enum State {
    Idle,
    Move,
    Jump,
    Fly,
    Teleport,
    Stop,
    Pose
}

export enum JumpSubState {
    None,
    Start,
    Jumping,
    Rising,
    Falling,
    Landing
}

export enum Action {
    Idle,
    WalkForward,
    WalkBackward,
    WalkLeft,
    WalkRight,
    TurnLeft,
    TurnRight,
    Jump,
    Land,
    Fly,
    FlyFast,
    Sit,
    SitBeanbag,
    SitChair,
    Clap,
    Salute,
    RunForward
}

export const AnimationMap = new Map([
    [Action.Idle, "idle02"],
    [Action.WalkForward, "walk_fwd"],
    [Action.RunForward, "run_fast_fwd"],
    [Action.WalkBackward, "walk_bwd"],
    [Action.WalkLeft, "walk_left"],
    [Action.WalkRight, "walk_right"],
    [Action.TurnLeft, "turn_left"],
    [Action.TurnRight, "turn_right"],
    [Action.Jump, "jump_standing_apex_all"],
    [Action.Land, "jump_standing_land_settle_all"],
    [Action.Fly, "fly"],
    [Action.FlyFast, "fly"],
    [Action.Sit, "sitting_idle"],
    [Action.SitBeanbag, "sitting_beanbag"],
    [Action.SitChair, "sitting_chair"],
    [Action.Clap, "emote_clap01_all"],
    [Action.Salute, "salute"]
]);

export class AvatarState {
    public walkSpeed = 2.4;
    public runSpeed = 5.2;
    public landSpeed = 4;
    public flySpeed = 8; // Flying on the X-Z plane.
    public fastFlySpeed = 27;
    public ascendSpeed = 0.05; // Flying on the Y axis.
    public fastAscendSpeed = 0.1;
    public currentSpeed = 0;

    public rotationSpeed = 40 * Math.PI / 180;

    public moveDir = Vector3.Zero();
    public angularVelocity = 0;
    public duration = 0;

    public isRunning = false;
    public state = State.Stop;
    public action: Action = Action.Idle;

    public jumpSubstate = JumpSubState.None;
    public jumpImpluse = 5;
    public canImpluse = true;
    public landingDuration = 0;
    public jumpInPlace = false;
    public previousPosY = 0;
}

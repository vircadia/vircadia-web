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
    SitAuditorium,
    SitCouch,
    Clap,
    Salute,
    RunForward
}

interface AnimationLoopData {
    name: string,
    loop: boolean,
    loopStart?: number,
    loopEnd?: number
}

/* eslint-disable no-multi-spaces */
export const AnimationMap = new Map([
    [Action.Idle,           { name: "idle02", loop: true }],
    [Action.WalkForward,    { name: "walk_fwd", loop: true }],
    [Action.RunForward,     { name: "run_fast_fwd", loop: true }],
    [Action.WalkBackward,   { name: "walk_bwd", loop: true }],
    [Action.WalkLeft,       { name: "walk_left", loop: true }],
    [Action.WalkRight,      { name: "walk_right", loop: true }],
    [Action.TurnLeft,       { name: "turn_left", loop: true }],
    [Action.TurnRight,      { name: "turn_right", loop: true }],
    [Action.Jump,           { name: "jump_standing_apex_all", loop: false }],
    [Action.Land,           { name: "jump_standing_land_settle_all", loop: false }],
    [Action.Fly,            { name: "fly", loop: true }],
    [Action.FlyFast,        { name: "fly", loop: true }],
    [Action.Sit,            { name: "sitting_idle", loop: false }],
    [Action.SitBeanbag,     { name: "sitting_beanbag", loop: false }],
    [Action.SitChair,       { name: "sitting_chair", loop: false }],
    [Action.SitAuditorium,  { name: "sitting_auditorium", loop: false }],
    [Action.SitCouch,       { name: "sitting_couch", loop: false }],
    [Action.Clap,           { name: "emote_clap01_all", loop: true, loopStart: 17, loopEnd: 111 }],
    [Action.Salute,         { name: "salute", loop: true, loopStart: 10, loopEnd: 30 }]
]) as Map<Action, AnimationLoopData>;
/* eslint-enable no-multi-spaces */

export class AvatarState {
    public walkSpeed = 1.8;
    public runSpeed = 5.2;
    public landSpeed = 4;
    public flySpeed = 8; // Flying on the X-Z plane.
    public fastFlySpeed = 27;
    public ascendSpeed = 0.05; // Flying on the Y axis.
    public fastAscendSpeed = 0.14;
    public currentSpeed = 0;

    public rotationSpeed = 40 * Math.PI / 180;

    public moveDir = Vector3.Zero();
    public angularVelocity = 0;
    public duration = 0;

    public isRunning = false;
    public state = State.Stop;
    public action: Action = Action.Idle;

    public jumpSubstate = JumpSubState.None;
    public jumpImpulse = 5;
    public canImpulse = true;
    public landingDuration = 0;
    public jumpInPlace = false;
    public previousPosY = 0;
}

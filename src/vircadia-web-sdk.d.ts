/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// TEMPORARY definitions for the interface to vircadia-web-sdk
// This will be replaced with an official definition.
declare module "@vircadia/web-sdk" {

    // eslint-disable-next-line @typescript-eslint/init-declarations
    export const Vircadia: {
        version: string;
        verboseVersion: string;
    };

    // Vec3 and Quant ==========================
    export type vec3 = {
        x: number;
        y: number;
        z: number;
    };
    // eslint-disable-next-line @typescript-eslint/init-declarations
    export const Vec3: {
        readonly ZERO: vec3;
        equal(v1: vec3, v2: vec3): boolean;
    };
    export type quat = {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    // eslint-disable-next-line @typescript-eslint/init-declarations
    export const Quat: {
        readonly IDENTITY: quat;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valid(value: any): boolean;
        equal(q1: quat, q2: quat): boolean;
    };
    // Uuid ============================
    export class Uuid {
        static readonly NUM_BYTES_RFC4122_UUID = 16;
        static readonly NULL: bigint;
        static readonly AVATAR_SELF_ID: bigint;
        // constructor(value?: bigint);
        value(): bigint;
        stringify(): string;
    }
    // Signal ============================
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type Slot = (...args: any[]) => void;
    export type Signal = {
        connect: (slot: Slot) => void;
        disconnect: (slot: Slot) => void;
    };
    export class SignalEmitter implements Signal {
        connect(slot: Slot): void;
        disconnect(slot: Slot): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emit(...params: any[]): void;
        signal(): Signal;
    }
    // ============================
    export enum ConnectionState {
        DISCONNECTED = 0,
        CONNECTING = 1,
        CONNECTED = 2,
        REFUSED = 3,
        ERROR = 4
    }
    // ============================
    export type OnDomainStateChanged = (state: ConnectionState, info: string) => void;
    export class DomainServer {
        static get DISCONNECTED(): ConnectionState;
        static get CONNECTING(): ConnectionState;
        static get CONNECTED(): ConnectionState;
        static get REFUSED(): ConnectionState;
        static get ERROR(): ConnectionState;
        static stateToString(state: ConnectionState): string;
        constructor();
        get location(): string;
        get state(): ConnectionState;
        get refusalInfo(): string;
        get errorInfo(): string;
        set onStateChanged(callback: OnDomainStateChanged);
        get contextID(): number;
        get sessionUUID(): Uuid;
        get SessionUUIDChanged(): Signal;
        connect(location: string): void;
        disconnect(): void;
    }

    // ============================
    export enum AssignmentClientState {
        UNAVAILABLE = 0,
        DISCONNECTED = 1,
        CONNECTED = 2
    }
    export type OnAssignmentClientStateChanged = Nullable<(state: AssignmentClientState) => void>;
    export class AssignmentClient {
        static get UNAVAILABLE(): AssignmentClientState;
        static get DISCONNECTED(): AssignmentClientState;
        static get CONNECTED(): AssignmentClientState;
        static stateToString(state: AssignmentClientState): string;
        constructor(contextID: number, nodeType: NodeTypeValue);
        get state(): AssignmentClientState;
        set onStateChanged(callback: OnAssignmentClientStateChanged);
    }

    // ====================================================
    export const enum NodeTypeValue {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        DomainServer = "D",
        EntityServer = "o",
        Agent = "I",
        AudioMixer = "M",
        AvatarMixer = "W",
        AssetServer = "A",
        MessagesMixer = "m",
        EntityScriptServer = "S",
        UpstreamAudioMixer = "B",
        UpstreamAvatarMixer = "C",
        DownstreamAudioMixer = "a",
        DownstreamAvatarMixer = "w",
        Unassigned = "\u0001"
    }
    // eslint-disable-next-line @typescript-eslint/init-declarations
    export const NodeType: {
        readonly DomainServer: NodeTypeValue.DomainServer;
        readonly EntityServer: NodeTypeValue.EntityServer;
        readonly Agent: NodeTypeValue.Agent;
        readonly AudioMixer: NodeTypeValue.AudioMixer;
        readonly AvatarMixer: NodeTypeValue.AvatarMixer;
        readonly AssetServer: NodeTypeValue.AssetServer;
        readonly MessagesMixer: NodeTypeValue.MessagesMixer;
        readonly EntityScriptServer: NodeTypeValue.EntityScriptServer;
        readonly UpstreamAudioMixer: NodeTypeValue.UpstreamAudioMixer;
        readonly UpstreamAvatarMixer: NodeTypeValue.UpstreamAvatarMixer;
        readonly DownstreamAudioMixer: NodeTypeValue.DownstreamAudioMixer;
        readonly DownstreamAvatarMixer: NodeTypeValue.DownstreamAvatarMixer;
        readonly Unassigned: NodeTypeValue.Unassigned;
        readonly "__#39@#NODE_TYPE_NAMES": {
            D: string;
            o: string;
            I: string;
            M: string;
            W: string;
            m: string;
            A: string;
            S: string;
            B: string;
            C: string;
            a: string;
            w: string;
            "\u0001": string;
        };
        getNodeTypeName(nodeType: NodeTypeValue): string;
        isUpstream(nodeType: NodeTypeValue): boolean;
    };

    // AudioMixer ============================
    type AudioPositionGetter = () => vec3;
    export class AudioMixer extends AssignmentClient {
        constructor(contextID: number);
        get audioOuput(): MediaStream;
        set audioInput(audioInput: MediaStream | null);
        get inputMuted(): boolean;
        set inputMuted(inputMuted: boolean);
        set positionGetter(positionGetter: AudioPositionGetter);
        play(): Promise<void>;
        pause(): Promise<void>;
    }

    // MessageMixer ============================
    type MessageReceivedSlot = (pChannel: string, pMsg: string, pSenderId: Uuid, pLocalOnly: boolean) => void;
    type DataReceivedSlot = (pChannel: string, pMsg: ArrayBuffer, pSenderId: Uuid, pLocalOnly: boolean) => void;
    export class MessageMixer extends AssignmentClient {
        constructor(contextID: number);
        subscribe(channel: string): void;
        unsubscribe(channel: string): void;
        sendMessage(channel: string, message: string, localOnly?: boolean): void;
        sendData(channel: string, data: ArrayBuffer, localOnly?: boolean): void;
        get messageReceived(): Signal;
        get dataReceived(): Signal;
    }

    // MyAvatarInterface ============================
    type DisplayNameChangedSlot = () => void;
    type SessionDisplayNameChangedSlot = () => void;
    export class MyAvatarInterface {
        constructor(contextID: number);
        get displayName(): string;
        set displayName(displayName: string);
        get displayNameChanged(): Signal;
        get sessionDisplayName(): string;
        get sessionDisplayNameChanged(): Signal;
        get position(): vec3;
        set position(position: vec3);
    }

    // AvatarListInterface ============================
    export enum KillAvatarReason {
        NoReason = 0,
        AvatarDisconnected,
        AvatarIgnored,
        TheirAvatarEnteredYourBubble,
        YourAvatarEnteredTheirBubble
    }
    type AvatarAddedSlot = (pSessionUUID: Uuid) => void;
    type AvatarRemovedSlot = (pSessionUUID: Uuid, pRemovalReason: KillAvatarReason) => void;
    export class AvatarListInterface {
        constructor(contextID: number);
        get count(): number;
        getAvatarIDs(): Array<Uuid>;
        get avatarAdded(): Signal;
        get avatarRemoved(): Signal;
    }

    // AvatarMixer ============================
    export class AvatarMixer extends AssignmentClient {
        constructor(contextID: number);
        get myAvatar(): MyAvatarInterface;
        get avatarList(): AvatarListInterface;
        update(): void;
    }

}

/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// TEMPORARY definitions for the interface to vircadia-web-sdk
// This will be replaced with an official definition.
declare module "@vircadia/web-sdk" {

    export enum ConnectionState {
        DISCONNECTED = 0,
        CONNECTING = 1,
        CONNECTED = 2,
        REFUSED = 3,
        ERROR = 4
    }
    export type OnDomainStateChanged = (state: ConnectionState, info: string) => void;
    export class DomainServer {
        #private;
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
        connect(location: string): void;
        disconnect(): void;
    }

    // ============================
    export enum AssignmentClientState {
        UNAVAILABLE = 0,
        DISCONNECTED = 1,
        CONNECTED = 2
    }
    export type OnAssignmentClientStateChanged = (state: AssignmentClientState) => void;
    export class AssignmentClient {
        #private;
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

    // ============================
    export class AudioMixer extends AssignmentClient {
        #private;
        constructor(contextID: number);
        get audioOuput(): MediaStream;
        set audioInput(audioInput: MediaStream | null);
        get inputMuted(): boolean;
        set inputMuted(inputMuted: boolean);
        play(): Promise<void>;
        pause(): Promise<void>;
    }

}

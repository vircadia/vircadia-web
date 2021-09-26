/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// TEMPORARY definitions for the interface to vircadia-web-sdk
// This will be replaced with an official definition.
declare module "@Libs/vircadia-web-sdk" {

    // TEMPORARY: will eventurally use defn in the library but is not yet exported
    export enum ConnectionState {
        DISCONNECTED = 0,
        CONNECTING,
        CONNECTED,
        REFUSED,
        ERROR
    }

    type OnStateChanged = (state: ConnectionState, info: string) => void;

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
        // eslint-disable-next-line accessor-pairs
        set onStateChanged(callback: OnStateChanged);
        get contextID(): number;
        connect(location: string): void;
        disconnect(): void;
    }

    export enum AssignmentClientState {
        UNAVAILABLE = 0,
        DISCONNECTED,
        CONNECTED
    }

    export type OnStateChangedCallback = (state: AssignmentClientState) => void;

    export class AssignmentClient {
        static get UNAVAILABLE(): AssignmentClientState;
        static get DISCONNECTED(): AssignmentClientState;
        static get CONNECTED(): AssignmentClientState;
        static stateToString(state: AssignmentClientState): string;
        constructor();
        get state(): AssignmentClientState;
        // eslint-disable-next-line accessor-pairs
        set onStateChanged(callback: OnStateChangedCallback);
    }

    export class AudioMixer extends AssignmentClient {
        constructor(pContextId: number);
        get AudioOutput(): MediaStream;
        play():void;
        pause(): void;
    }
}

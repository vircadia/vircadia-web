/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Domain } from "@Modules/domain/domain";
import { Client, AssignmentClientState } from "@Modules/domain/client";

import { Store, Actions as StoreActions } from "@Store/index";

import { MessageMixer, MessageReceivedSlot, SignalEmitter, Uuid } from "@vircadia/web-sdk";

import Log from "@Modules/debugging/log";
import { toJSON } from "@Modules/debugging";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

// Function signature called for state changing
export type DomainMessageStateChangeCallback = (pD: Domain, pM: DomainMessage, pS: AssignmentClientState) => void;

// Interface used to pass messages around
export interface AMessage {
    id?: number,            // just some ID for the message
    self?: boolean,         // set to 'true' if sent by self
    whenReceived: Date,     // when message added to the list
    channel: string,        // MessageClient channel (like "Chat" for FloofChat)
    message: string,        // the string message received
    messageJSON: Nullable<KeyedCollection>, // if 'message' looks like JSON, parsed here
    senderId: Uuid,         // the sessionID of the sender
    localOnly: boolean,     // flag to say if local/inner-domain message
}

// The default chat system sends messages as this JSON package
export interface FloofChatMessage extends KeyedCollection {
    type: string,           // "TransmitChatMessage", ??
    position: { x: number, y: number, z: number },
    channel: string,        // "Local", "Grid", ??
    colour: { blue: number, green: number, red: number },   // color for the text (0..255)
    message: string,        // the actual message string
    displayName: string     // display name of sender
}

export class DomainMessage extends Client {

    public onStateChange: SignalEmitter;

    #_domain: Domain;
    #_msgMixer: Nullable<MessageMixer>;
    #_subscribedChannel: string;
    #_msgReceivedHandler: Nullable<MessageReceivedSlot>;
    public get Mixer(): Nullable<MessageMixer> { return this.#_msgMixer; }

    constructor(pD: Domain) {
        super();
        this.#_domain = pD;
        this.onStateChange = new SignalEmitter();
        this.#_msgMixer = new MessageMixer(pD.ContextId);
        this.#_msgMixer.onStateChanged = this._handleOnStateChanged.bind(this);
        this.#_subscribedChannel = "";
    }

    /**
     * Subscribe to a channel and set text message receiving routine.
     * @param pChannel name of channel to subscribe to
     * @param pOnReceived function to call when text message received
     * @returns 'true' if the subscription was successful
     */
    public subscribeToChannel(pChannel: string): boolean {
        if (this.#_msgMixer) {
            if (this.#_msgReceivedHandler) {
                this.#_msgMixer.unsubscribe(this.#_subscribedChannel);
                this.#_msgMixer.messageReceived.disconnect(this.#_msgReceivedHandler);
            }
            this.#_subscribedChannel = pChannel;
            this.#_msgMixer.subscribe(this.#_subscribedChannel);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.#_msgReceivedHandler = this._handleOnMessageReceived.bind(this);
            this.#_msgMixer.messageReceived.connect(this.#_msgReceivedHandler);
            return true;
        }
        return false;
    }

    // Return the state of the underlying assignment client
    public get clientState(): AssignmentClientState { return this.#_msgMixer?.state ?? AssignmentClientState.DISCONNECTED; }

    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        if (this.#_msgMixer) {
            Log.debug(Log.types.COMM,
                `DomainMessage: MessageMixer state=${MessageMixer.stateToString(this.#_msgMixer.state)}`);
            this._updateMessageInfo();
        } else {
            Log.error(Log.types.COMM, `DomainMessage: no MessageMixer`);
        }
        this.onStateChange.emit(this.#_domain, this, pNewState);
    }

    /**
     * Update the message info in the Vue store.
     *
     * This called the Store dispatcher with the structures for messages.
     * The called dispatcher extracts the information for the Store.
     */
    // eslint-disable-next-line class-methods-use-this
    private _updateMessageInfo() {
        // eslint-disable-next-line no-void
        // void Store.dispatch(StoreActions.RECEIVE_CHAT_MESSAGE, {
        //     domainMessage: this
        // });
    }

    // eslint-disable-next-line class-methods-use-this
    private _handleOnMessageReceived(pChannel: string, pMsg: string, pSenderID: Uuid, pLocalOnly: boolean): void {
        // The message is usually string that is JSON. This parses it if possible for the rest of the world
        let asJSON: Nullable<KeyedCollection> = undefined;
        if (pMsg && pMsg.length > 0 && pMsg[0] === "{") {
            try {
                asJSON = <KeyedCollection>JSON.parse(pMsg);
            }
            catch (e) {
                asJSON = undefined;
            }
        }

        const msg: AMessage = {
            whenReceived: new Date(),
            channel: pChannel,
            message: pMsg,
            messageJSON: asJSON,
            senderId: pSenderID,
            localOnly: pLocalOnly
        };

        Log.debug(Log.types.OTHER, `DebugWindow: MessageClient message received. ${toJSON(msg)}`);
        // eslint-disable-next-line no-void
        void Store.dispatch(StoreActions.RECEIVE_CHAT_MESSAGE, msg);
    }
}

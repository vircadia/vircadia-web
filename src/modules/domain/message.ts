/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MessageMixer, SignalEmitter, Uuid } from "@vircadia/web-sdk";
import { applicationStore } from "@Stores/index";
import { Domain } from "@Modules/domain/domain";
import { DomainMgr } from "@Modules/domain";
import { Client, AssignmentClientState } from "@Modules/domain/client";
import { playSound } from "@Modules/scene/soundEffects";
import Log from "@Modules/debugging/log";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

// Function signature called for state changing
export type DomainMessageStateChangeCallback = (pD: Domain, pM: DomainMessage, pS: AssignmentClientState) => void;

// Interface used to pass messages around
export interface AMessage {
    id?: number,            // just some ID for the message
    self?: boolean,         // set to 'true' if sent by self
    whenReceived: Date,     // when message added to the list
    channel: string,        // MessageClient channel (like "Chat" for DefaultChat)
    message: string,        // the string message received
    messageJSON: Nullable<KeyedCollection>, // if 'message' looks like JSON, parsed here
    senderId: Uuid,         // the sessionID of the sender
    localOnly: boolean,     // flag to say if local/inner-domain message
}

// The default chat system sends messages as this JSON package
export interface DefaultChatMessage extends KeyedCollection {
    type: string,           // "TransmitChatMessage", ??
    position: { x: number, y: number, z: number },
    channel: string,        // "Local", "Domain", "Grid", ??
    colour: { blue: number, green: number, red: number },   // color for the text (0..255)
    message: string,        // the actual message string
    displayName: string     // display name of sender
}

export class DomainMessage extends Client {

    public onStateChange: SignalEmitter;

    public static DefaultChatChannel = "Chat";
    public static DefaultSystemNotificationChannel = "System-Notifications";

    #_domain: Domain;
    #_msgMixer: Nullable<MessageMixer>;
    #_subscribedToDefaultChannels: boolean;
    public get Mixer(): Nullable<MessageMixer> { return this.#_msgMixer; }

    constructor(pD: Domain) {
        super();
        this.#_domain = pD;
        this.onStateChange = new SignalEmitter();
        this.#_msgMixer = new MessageMixer(pD.ContextId);
        this.#_msgMixer.onStateChanged = this._handleOnStateChanged.bind(this);
        this.#_msgMixer.messageReceived.connect(this._handleOnMessageReceived.bind(this));
        this.#_subscribedToDefaultChannels = false;
    }

    /**
     * Subscribe to a channel and set text message receiving routine.
     * @param pChannel name of channel to subscribe to
     * @returns 'true' if the subscription was successful
     */
    public subscribeChannel(pChannel: string): boolean {
        if (this.#_msgMixer && this.#_msgMixer.state === AssignmentClientState.CONNECTED) {
            this.#_msgMixer.subscribe(pChannel);
            return true;
        }
        return false;
    }

    public unsubscribeChannel(pChannel: string): void {
        if (this.#_msgMixer) {
            this.#_msgMixer.unsubscribe(pChannel);
        }
    }

    public sendMessage(pChannel: string, pMsg: string, pLocalOnly = false): void {
        if (this.#_msgMixer) {
            // Log.debug(Log.types.MESSAGES, `DomainMessage: sending ${pChannel} <= "${pMsg}"`);
            this.#_msgMixer.sendMessage(pChannel, pMsg, pLocalOnly);
        }
    }

    // Return the state of the underlying assignment client
    public get clientState(): AssignmentClientState { return this.#_msgMixer?.state ?? AssignmentClientState.DISCONNECTED; }

    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        if (this.#_msgMixer) {
            Log.debug(Log.types.COMM, `DomainMessage: MessageMixer state=${MessageMixer.stateToString(this.#_msgMixer.state)}`);
            // If connected, see that we're subscribed to the default message/chat channels
            if (this.#_msgMixer.state === AssignmentClientState.CONNECTED) {
                if (!this.#_subscribedToDefaultChannels) {
                    this.subscribeChannel(DomainMessage.DefaultChatChannel);
                    this.subscribeChannel(DomainMessage.DefaultSystemNotificationChannel);
                    this.#_subscribedToDefaultChannels = true;
                }
            }
            else {
                this.#_subscribedToDefaultChannels = false;
            }
        } else {
            Log.error(Log.types.COMM, `DomainMessage: no MessageMixer`);
        }
        this.onStateChange.emit(this.#_domain, this, pNewState);
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
            self: pSenderID.stringify() === DomainMgr.ActiveDomain?.DomainClient?.sessionUUID?.stringify(),
            whenReceived: new Date(),
            channel: pChannel,
            message: pMsg,
            messageJSON: asJSON,
            senderId: pSenderID,
            localOnly: pLocalOnly
        };

        // Add the message to the Store.
        applicationStore.addChatMessage(msg);

        // If the message was not sent from this client, play a sound effect to notify the user.
        if (!msg.self) {
            void playSound("SFXMessageNotification");
        }
    }
}

//
//  message.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { MessageMixer, SignalEmitter, Uuid } from "@vircadia/web-sdk";
import { DomainManager } from "@Modules/domain";
import { AssignmentClientState, Client } from "@Modules/domain/client";
import { Domain } from "@Modules/domain/domain";
import { playSound } from "@Modules/scene/soundEffects";
import { applicationStore } from "@Stores/index";
import Log from "@Modules/debugging/log";

/**
 * An individual chat message.
 */
export interface ChatMessage {
    id?: number,            // just some ID for the message
    self?: boolean,         // set to 'true' if sent by self
    whenReceived: Date,     // when message added to the list
    channel: string,        // MessageClient channel (like "Chat" for DefaultChat)
    message: string,        // the string message received
    messageJSON: Nullable<KeyedCollection>, // if 'message' looks like JSON, parsed here
    senderId: Uuid,         // the sessionID of the sender
    localOnly: boolean,     // flag to say if local/inner-domain message
}

/**
 * An individual chat message, as received from the Message Mixer.
 */
export interface DomainChatMessage extends KeyedCollection {
    type: string,           // "TransmitChatMessage", ??
    position: { x: number, y: number, z: number },
    channel: string,        // "Local", "Domain", "Grid", ??
    colour: { blue: number, green: number, red: number },   // color for the text (0..255)
    message: string,        // the actual message string
    displayName: string     // display name of sender
}

export class DomainMessageClient extends Client {
    private _domain: Domain;
    private _messageMixer: Nullable<MessageMixer>;
    private _subscribedToDefaultChannels: boolean;

    public static DefaultChatChannel = "Chat";
    public static DefaultSystemNotificationChannel = "System-Notifications";
    public onStateChange: SignalEmitter;

    constructor(domain: Domain) {
        super();
        this._domain = domain;
        this.onStateChange = new SignalEmitter();
        this._messageMixer = new MessageMixer(domain.ContextId);
        this._messageMixer.onStateChanged = this._handleOnStateChanged.bind(this);
        this._messageMixer.messageReceived.connect(this._handleOnMessageReceived.bind(this));
        this._subscribedToDefaultChannels = false;
    }

    /**
     * The state of the underlying assignment client.
     */
    public get clientState(): AssignmentClientState {
        return this._messageMixer?.state ?? AssignmentClientState.DISCONNECTED;
    }

    /**
     * A reference to the Message Mixer instance.
     */
    public get Mixer(): Nullable<MessageMixer> {
        return this._messageMixer;
    }

    /**
     * Subscribe to a message channel and set the chat message receiving routine.
     * @param channel The name of the channel to subscribe to.
     * @returns `true` if the subscription was successful, `false` if unsuccessful.
     */
    public subscribeToChannel(channel: string): boolean {
        if (this._messageMixer && this._messageMixer.state === AssignmentClientState.CONNECTED) {
            this._messageMixer.subscribe(channel);
            return true;
        }
        return false;
    }

    /**
     * Unsubscribe from a message channel.
     * @param channel The name of the channel to unsubscribe from.
     */
    public unsubscribeFromChannel(channel: string): void {
        if (this._messageMixer) {
            this._messageMixer.unsubscribe(channel);
        }
    }

    /**
     * Send a chat message.
     * @param channel The channel to send the message on.
     * @param message The message content.
     * @param localOnly `(Optional)` Set `true` to only send the message locally.
     */
    public sendMessage(channel: string, message: string, localOnly = false): void {
        if (this._messageMixer) {
            Log.debug(Log.types.MESSAGES, `Sending DomainMessage on ${channel} channel. Content: "${message}"`);
            this._messageMixer.sendMessage(channel, message, localOnly);
        }
    }

    private _handleOnStateChanged(newState: AssignmentClientState): void {
        if (this._messageMixer) {
            Log.debug(Log.types.NETWORK, `DomainMessage: MessageMixer state=${MessageMixer.stateToString(this._messageMixer.state)}`);
            // If connected, see that we're subscribed to the default message/chat channels
            if (this._messageMixer.state === AssignmentClientState.CONNECTED) {
                if (!this._subscribedToDefaultChannels) {
                    this.subscribeToChannel(DomainMessageClient.DefaultChatChannel);
                    this.subscribeToChannel(DomainMessageClient.DefaultSystemNotificationChannel);
                    this._subscribedToDefaultChannels = true;
                }
            } else {
                this._subscribedToDefaultChannels = false;
            }
        } else {
            Log.error(Log.types.NETWORK, `DomainMessage: no MessageMixer`);
        }
        this.onStateChange.emit(this._domain, this, newState); // Signature: Domain, DomainMessage, AssignmentClientState.
    }

    // eslint-disable-next-line class-methods-use-this
    private _handleOnMessageReceived(channel: string, message: string, senderID: Uuid, localOnly: boolean): void {
        // The message is usually a JSON string. Parse it if possible.
        let asJSON: Nullable<KeyedCollection> = undefined;
        if (message && message.length > 0 && message.charAt(0) === "{") {
            try {
                asJSON = <KeyedCollection>JSON.parse(message);
            } catch (error) {
                asJSON = undefined;
            }
        }

        // Add the message to the Store.
        const msg: ChatMessage = {
            self: senderID.stringify() === DomainManager.ActiveDomain?.DomainClient?.sessionUUID?.stringify(),
            whenReceived: new Date(),
            channel,
            message,
            messageJSON: asJSON,
            senderId: senderID,
            localOnly
        };
        applicationStore.addChatMessage(msg);

        // If the message was not sent from this client, play a sound effect to notify the user.
        if (!msg.self) {
            void playSound("SFXMessageNotification");
        }
    }
}

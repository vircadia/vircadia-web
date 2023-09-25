//
//  DomainController.ts
//
//  Created by Nolan Huang on 1 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import { AvatarMixer, Uuid, DomainServer } from "@vircadia/web-sdk";
import type { ScriptAvatar, EntityServer, Camera as DomainCamera } from "@vircadia/web-sdk";
import type { Camera } from "@babylonjs/core";
import { MyAvatarController } from "@Modules/avatar";
import { DomainManager } from "@Modules/domain";
import { AssignmentClientState, Client } from "@Modules/domain/client";
import { ConnectionState, Domain } from "@Modules/domain/domain";
import { EntityManager, type IEntity, EntityMapper } from "@Modules/entity";
import { GameObject } from "@Modules/object";
import type { VScene } from "@Modules/scene/vscene";
import { ScriptComponent, inspectorAccessor, inspector } from "@Modules/script";
import Log from "@Modules/debugging/log";

export class DomainController extends ScriptComponent {
    private _avatarMixer: Nullable<AvatarMixer> = null;
    private _entityServer: Nullable<EntityServer> = null;
    private _domainConnectionState: ConnectionState = ConnectionState.DISCONNECTED;
    private _entityManager: Nullable<EntityManager> = null;
    private _domainCamera: Nullable<DomainCamera> = null;
    private _vscene: Nullable<VScene>;
    private _camera: Nullable<Camera> = null;

    @inspector()
    public sessionID = "";

    constructor() {
        super("DomainController");
        this._handleActiveDomainStateChange = this._handleActiveDomainStateChange.bind(this);
    }

    public set vscene(value: VScene) {
        this._vscene = value;
    }

    @inspectorAccessor()
    public get domainState(): string {
        return DomainServer.stateToString(this._domainConnectionState);
    }

    @inspectorAccessor()
    public get avatarMixerState(): string {
        return this._avatarMixer
            ? AvatarMixer.stateToString(this._avatarMixer.state)
            : AvatarMixer.stateToString(AssignmentClientState.UNAVAILABLE);
    }

    @inspectorAccessor()
    public get entityServerState(): string {
        return this._entityServer
            ? Client.stateToString(this._entityServer.state)
            : Client.stateToString(AssignmentClientState.UNAVAILABLE);
    }


    /**
    * Gets a string identifying the type of this Component
    * @returns "DomainController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return "DomainController";
    }

    public onInitialize(): void {
        Log.debug(Log.types.OTHER,
            `DomainController onInitialize`);

        // Listen for the domain to connect and disconnect
        DomainManager.onActiveDomainStateChange.connect(this._handleActiveDomainStateChange.bind(this));

        GameObject.dontDestroyOnLoad(this._gameObject as GameObject);
    }


    public onUpdate(): void {
        if (this._entityManager) {
            this._entityManager.update();
        }

        // this._syncCamera();
    }

    public onStop(): void {
        Log.debug(Log.types.OTHER, `DomainController onStop`);
        DomainManager.onActiveDomainStateChange.disconnect(this._handleActiveDomainStateChange.bind(this));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public _handleActiveDomainStateChange(domain: Domain, state: ConnectionState, info: string): void {
        Log.debug(Log.types.NETWORK, `Active Domain state change: ${Domain.stateToString(state)}`);

        if (state === ConnectionState.CONNECTED) {
            void this._handleDomainConnected(domain);

        } else if (state === ConnectionState.DISCONNECTED) {
            this._vscene?.unloadAllAvatars();

            const myAvatarController = this._vscene?._myAvatar?.getComponent(MyAvatarController.typeName);
            if (myAvatarController instanceof MyAvatarController) {
                myAvatarController.myAvatar = null;
            }

            const avatarList = this._avatarMixer?.avatarList;
            if (avatarList) {
                avatarList.avatarAdded.disconnect(this._handleAvatarAdded);
                avatarList.avatarRemoved.disconnect(this._handleAvatarRemoved);
            }

            this._avatarMixer = null;
            this._entityServer = null;
            this._entityManager = null;
            this._domainCamera = null;
            this._camera = null;
        }

        this._domainConnectionState = state;
    }

    private async _handleDomainConnected(domain: Domain): Promise<void> {
        if (!this._vscene) {
            return;
        }

        this._entityServer = domain.EntityClient;
        if (this._entityServer) {
            this._entityServer.onStateChanged = this._handleOnEntityServerStateChanged.bind(this);
        }

        await this._vscene.load();
        this._vscene.teleportMyAvatar(domain.Location);

        if (domain.DomainClient) {
            this.sessionID = domain.DomainClient.sessionUUID.stringify();
        }
        Log.debug(Log.types.AVATAR, `Session ID: ${this.sessionID}`);

        this._avatarMixer = domain.AvatarClient?.Mixer;
        const myAvatarInterface = domain.AvatarClient?.MyAvatar;
        if (myAvatarInterface) {
            if (myAvatarInterface.skeletonModelURL === "") {
                myAvatarInterface.skeletonModelURL = this._vscene.myAvatarModelURL;
            }

            const myAvatarController = this._vscene._myAvatar?.getComponent(MyAvatarController.typeName);
            if (myAvatarController instanceof MyAvatarController) {
                myAvatarController.myAvatar = myAvatarInterface;
            }
        }

        const avatarList = this._avatarMixer?.avatarList;
        if (avatarList) {
            avatarList.avatarAdded.connect(this._handleAvatarAdded);
            avatarList.avatarRemoved.connect(this._handleAvatarRemoved);

            const uuids = avatarList.getAvatarIDs();
            const emptyId = new Uuid();

            uuids.forEach((uuid) => {
                // filter my avatar
                if (uuid.stringify() !== emptyId.stringify()) {
                    this._handleAvatarAdded(uuid);
                }
            });
        }

        this._camera = this._vscene.camera;
        this._domainCamera = domain.Camera;
        // this._syncCamera();
    }

    private _handleAvatarAdded = (sessionID: Uuid): void => {
        const avatarList = this._avatarMixer?.avatarList;
        if (avatarList) {
            Log.debug(Log.types.AVATAR,
                `AvatarAdded. Session ID: ${sessionID.stringify()}`);

            const domain = avatarList.getAvatar(sessionID);

            if (domain.skeletonModelURL !== "") {
                void this._vscene?.loadAvatar(sessionID, domain);
            }

            domain.skeletonModelURLChanged.connect(() => {
                this._handleAvatarSkeletonModelURLChanged(sessionID, domain);
            });
        }
    };

    private _handleAvatarRemoved = (sessionID: Uuid): void => {
        Log.debug(Log.types.AVATAR,
            `handleAvatarRemoved. Session ID: ${sessionID.stringify()}`);
        this._vscene?.unloadAvatar(sessionID);

    };

    private _handleAvatarSkeletonModelURLChanged(sessionID: Uuid, domain:ScriptAvatar): void {
        Log.debug(Log.types.AVATAR,
            `handleAvatarSkeletonModelURLChanged. Session ID: ${sessionID.stringify()}, ${domain.skeletonModelURL}`);

        void this._vscene?.loadAvatar(sessionID, domain);
    }

    private _handleOnEntityServerStateChanged(state: AssignmentClientState): void {
        Log.info(Log.types.ENTITIES,
            `Entity Sever state changed. New state: ${Client.stateToString(state)}`);

        if (state === AssignmentClientState.CONNECTED) {
            this._entityManager = new EntityManager(this._entityServer as EntityServer);
            this._entityManager.onEntityAdded.add(this._handleOnEntityAdded.bind(this));
            this._entityManager.onEntityRemoved.add(this._handleOnEntityRemoved.bind(this));
        } else if (state === AssignmentClientState.DISCONNECTED) {
            this._entityManager = null;
        }
    }

    private _handleOnEntityAdded(entity: IEntity): void {
        Log.debug(Log.types.ENTITIES,
            `Add entity ${entity.id}
            name:${entity.name as string}
            type: ${entity.type}`);

        this._vscene?.loadEntity(entity);
    }

    private _handleOnEntityRemoved(entity: IEntity): void {
        Log.debug(Log.types.ENTITIES,
            `Remove entity ${entity.id}
            name:${entity.name as string}
            type: ${entity.type}`);

        this._vscene?.removeEntity(entity.id);
    }

    private _syncCamera(): void {
        if (this._domainCamera && this._camera) {
            this._domainCamera.position = EntityMapper.mapToVector3Property(this._camera.globalPosition);
            this._domainCamera.orientation = EntityMapper.mapToQuaternionProperty(this._camera.absoluteRotation);
        }
    }
}

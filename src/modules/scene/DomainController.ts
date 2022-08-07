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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { ScriptComponent, inspectorAccessor, inspector } from "@Modules/script";

// General Modules
import Log from "@Modules/debugging/log";
import { GameObject, MeshComponent } from "@Modules/object";
import { AvatarController, ScriptAvatarController, MyAvatarController } from "@Modules/avatar";
import { ResourceManager } from "./resource";
// Domain Modules
import { DomainMgr } from "@Modules/domain";
import { Client, AssignmentClientState } from "@Modules/domain/client";
import { Domain, ConnectionState } from "@Modules/domain/domain";
import { AvatarMixer, Uuid, ScriptAvatar, DomainServer,
    EntityServer, EntityProperties } from "@vircadia/web-sdk";
import { EntityManager, EntityType, IEntity } from "@Modules/entity";
import { VScene } from "./vscene";


const DefaultAvatarUrl = "https://staging.vircadia.com/O12OR634/UA92/sara.glb";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/unbound-method */

export class DomainController extends ScriptComponent {
    _avatarMixer : Nullable<AvatarMixer> = null;
    _entityServer : Nullable<EntityServer> = null;
    _domainConnectionState : ConnectionState = ConnectionState.DISCONNECTED;
    _entityManager : Nullable<EntityManager> = null;
    _vscene : Nullable<VScene>;

    constructor() {
        super("DomainController");
        this._handleActiveDomainStateChange = this._handleActiveDomainStateChange.bind(this);
    }

    public set vscene(value : VScene) {
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
    public get componentType():string {
        return "DomainController";
    }

    public onInitialize(): void {
        Log.debug(Log.types.OTHER,
            `DomainController onInitialize`);

        // Listen for the domain to connect and disconnect
        // eslint-disable-next-line @typescript-eslint/unbound-method
        DomainMgr.onActiveDomainStateChange.connect(this._handleActiveDomainStateChange);

        GameObject.dontDestroyOnLoad(this._gameObject as GameObject);
    }


    public onUpdate():void {
        if (this._entityManager) {
            this._entityManager.update();
        }
    }

    public onStop(): void {
        Log.debug(Log.types.OTHER,
            `DomainController onStop`);
        DomainMgr.onActiveDomainStateChange.disconnect(this._handleActiveDomainStateChange);
    }

    public _handleActiveDomainStateChange(pDomain: Domain, pState: ConnectionState, pInfo: string): void {

        Log.debug(Log.types.COMM, `handleActiveDomainStateChange: ${Domain.stateToString(pState)}`);

        if (pState === ConnectionState.CONNECTED) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._handleDomainConnected(pDomain);

        } else if (pState === ConnectionState.DISCONNECTED) {
            this._vscene?.unloadAllAvatars();

            if (this._vscene && this._vscene._myAvatar) {
                const myAvatarController = this._vscene._myAvatar.getComponent("MyAvatarController") as MyAvatarController;
                myAvatarController.myAvatar = null;
            }

            this._avatarMixer = null;
            this._entityServer = null;
            this._entityManager = null;
        }

        this._domainConnectionState = pState;
    }

    private async _handleDomainConnected(pDomain: Domain): Promise<void> {
        this._entityServer = pDomain.EntityClient;
        if (this._entityServer) {
            this._entityServer.onStateChanged = this._handleOnEntityServerStateChanged.bind(this);
        }

        await this._vscene?.load();

        const sessionID = pDomain.DomainClient?.sessionUUID;
        if (sessionID) {
            Log.debug(Log.types.AVATAR, `Session ID: ${sessionID.stringify()}`);
        }

        this._avatarMixer = pDomain.AvatarClient?.Mixer;
        const myAvatarInterface = pDomain.AvatarClient?.MyAvatar;
        if (myAvatarInterface) {
            if (myAvatarInterface.skeletonModelURL === "") {
                myAvatarInterface.skeletonModelURL = DefaultAvatarUrl;
            }

            const gameObject = this._vscene?._myAvatar;
            if (gameObject) {
                const myAvatarController = gameObject.getComponent("MyAvatarController") as MyAvatarController;
                myAvatarController.myAvatar = myAvatarInterface;
            }
        }


        const avatarList = this._avatarMixer?.avatarList;
        if (avatarList) {
            avatarList.avatarAdded.connect(this._handleAvatarAdded.bind(this));
            avatarList.avatarRemoved.connect(this._handleAvatarRemoved.bind(this));

            const uuids = avatarList.getAvatarIDs();
            const emptyId = new Uuid();

            uuids.forEach((uuid) => {
                // filter my avatar
                if (uuid.stringify() !== emptyId.stringify()) {
                    this._handleAvatarAdded(uuid);
                }
            });
        }
    }

    private _handleAvatarAdded(sessionID:Uuid): void {
        const avatarList = this._avatarMixer?.avatarList;
        if (avatarList) {
            Log.debug(Log.types.AVATAR,
                `AvatarAdded. Session ID: ${sessionID.stringify()}`);

            const domain = avatarList.getAvatar(sessionID);

            if (domain.skeletonModelURL !== "") {
                this._vscene?.loadAvatar(sessionID.stringify(), domain);
            }

            domain.skeletonModelURLChanged.connect(() => {
                this._handleAvatarSkeletonModelURLChanged(sessionID, domain);
            });
        }
    }

    private _handleAvatarRemoved(sessionID:Uuid): void {
        Log.debug(Log.types.AVATAR,
            `handleAvatarRemoved. Session ID: ${sessionID.stringify()}`);
        this._vscene?.unloadAvatar(sessionID.stringify());

    }

    private _handleAvatarSkeletonModelURLChanged(sessionID:Uuid, domain:ScriptAvatar): void {
        Log.debug(Log.types.AVATAR,
            `handleAvatarSkeletonModelURLChanged. Session ID: ${sessionID.stringify()}, ${domain.skeletonModelURL}`);

        this._vscene?.loadAvatar(sessionID.stringify(), domain);
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

    private _handleOnEntityAdded(entity : IEntity) {
        Log.debug(Log.types.ENTITIES,
            `Add entity ${entity.id}
            name:${entity.name as string}
            type: ${entity.type}`);

        if (entity.type === "Box") {
            this._vscene?.loadEntity(entity);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private _handleOnEntityRemoved(entity : IEntity) {
        Log.debug(Log.types.ENTITIES,
            `Remove entity ${entity.id}
            name:${entity.name as string}
            type: ${entity.type}`);

        this._vscene?.removeEntity(entity.id);
    }
}

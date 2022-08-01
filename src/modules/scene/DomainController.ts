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
import { ScriptComponent, inspectorAccessor } from "@Modules/script";

// General Modules
import Log from "@Modules/debugging/log";
import { GameObject, MeshComponent } from "@Modules/object";
import { AvatarController, ScriptAvatarController, MyAvatarController } from "@Modules/avatar";
import { ResourceManager } from "./resource";
// Domain Modules
import { DomainMgr } from "@Modules/domain";
import { AssignmentClientState } from "@Modules/domain/client";
import { Domain, ConnectionState } from "@Modules/domain/domain";
import { AvatarMixer, Uuid, ScriptAvatar, DomainServer } from "@vircadia/web-sdk";


const DefaultAvatarUrl = "https://staging.vircadia.com/O12OR634/UA92/sara.glb";

export class DomainController extends ScriptComponent {
    _avatarMixer : Nullable<AvatarMixer> = null;
    _myAvatar: Nullable<GameObject> = null;
    _avatarList : Map<Uuid, GameObject>;
    _resourceManager : Nullable<ResourceManager> = null;
    _domainConnectionState : ConnectionState = ConnectionState.DISCONNECTED;
    constructor() {
        super("DomainController");
        this._avatarList = new Map<Uuid, GameObject>();
    }

    public set resourceManager(value : ResourceManager) {
        this._resourceManager = value;
    }

    public set myAvatar(value : Nullable<GameObject>) {
        this._myAvatar = value;
    }

    @inspectorAccessor()
    public get domainConnectionState(): string {
        return DomainServer.stateToString(this._domainConnectionState);
    }

    @inspectorAccessor()
    public get avatarMixerState(): string {
        return this._avatarMixer
            ? AvatarMixer.stateToString(this._avatarMixer.state)
            : AvatarMixer.stateToString(AssignmentClientState.UNAVAILABLE);
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
        DomainMgr.onActiveDomainStateChange.connect(this._handleActiveDomainStateChange.bind(this));
    }

    /*
    public onUpdate():void {

    } */

    private _handleActiveDomainStateChange(pDomain: Domain, pState: ConnectionState, pInfo: string): void {
        this._domainConnectionState = pState;

        if (pState === ConnectionState.CONNECTED) {
            Log.debug(Log.types.AVATAR, `VScene._handleActiveDomainStateChange: CONNECTED`);

            const sessionID = pDomain.DomainClient?.sessionUUID;
            if (sessionID) {
                Log.debug(Log.types.AVATAR, `Session ID: ${sessionID.stringify()}`);
            }

            this._avatarMixer = pDomain.AvatarClient?.Mixer;
            const myAvatar = pDomain.AvatarClient?.MyAvatar;
            if (myAvatar) {
                if (myAvatar.skeletonModelURL === "") {
                    myAvatar.skeletonModelURL = DefaultAvatarUrl;
                }

                if (this._myAvatar) {
                    const myAvatarController = this._myAvatar.getComponent("MyAvatarController") as MyAvatarController;
                    myAvatarController.myAvatar = myAvatar;
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

        } else if (pState === ConnectionState.DISCONNECTED) {
            Log.debug(Log.types.AVATAR, `VScene._handleActiveDomainStateChange: ${Domain.stateToString(pState)}`);

            this._avatarList.forEach((gameObj) => {
                gameObj.dispose();
            });
            this._avatarList.clear();

            if (this._myAvatar) {
                const myAvatarController = this._myAvatar.getComponent("MyAvatarController") as MyAvatarController;
                myAvatarController.myAvatar = null;
            }
        }
    }

    private _handleAvatarAdded(sessionID:Uuid): void {
        const avatarList = this._avatarMixer?.avatarList;
        if (avatarList) {
            Log.debug(Log.types.AVATAR,
                `VScene._handleAvatarAdded. Session ID: ${sessionID.stringify()}`);

            const domain = avatarList.getAvatar(sessionID);
            domain.skeletonModelURLChanged.connect(() => {
                this._handleAvatarSkeletonModelURLChanged(sessionID, domain);
            });
        }
    }

    private _handleAvatarRemoved(sessionID:Uuid): void {
        Log.debug(Log.types.AVATAR,
            `VScene._handleAvatarRemoved. Session ID: ${sessionID.stringify()}`);

        const domain = this._avatarMixer?.avatarList.getAvatar(sessionID);
        if (domain) {
            const avatar = this._avatarList.get(sessionID);
            if (avatar) {
                avatar.dispose();
                this._avatarList["delete"](sessionID);
            }
        }
    }

    private _handleAvatarSkeletonModelURLChanged(sessionID:Uuid, domain:ScriptAvatar): void {
        Log.debug(Log.types.AVATAR,
            `VScene._handleAvatarSkeletonModelURLChanged. Session ID: ${sessionID.stringify()}, ${domain.skeletonModelURL}`);

        const avatar = this._avatarList.get(sessionID);
        if (avatar) {
            avatar.dispose();
        }

        if (domain.skeletonModelURL !== "" && this._resourceManager) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._resourceManager.loadAvatar(domain.skeletonModelURL).then((mesh) => {
                const newAvatar = new GameObject("ScriptAvatar_" + sessionID.stringify(), this._scene);
                this._avatarList.set(sessionID, newAvatar);

                newAvatar.addComponent(new MeshComponent(mesh));
                newAvatar.addComponent(new ScriptAvatarController(domain));
            })
                ["catch"]((error) => {
                    Log.debug(Log.types.AVATAR,
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        `fail to load mesh ${domain.skeletonModelURL} : ${error}`);
                });
        }
    }
}

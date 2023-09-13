//
//  webEntityController.ts
//
//  Created by Nolan Huang on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { EntityController } from "./EntityController";
import { type IWebEntity, WebExtensions } from "../../EntityInterfaces";
import { MeshComponent, MASK_MESH_RENDER_GROUP_ID } from "@Base/modules/object";
import { EntityMapper } from "../../package";
import { MeshBuilder, Mesh, StandardMaterial, type Nullable } from "@babylonjs/core";
import { applicationStore } from "@Stores/index";
import { CSS3DObject } from "@Modules/scene/css3DRenderer";
import { Renderer } from "@Modules/scene";
import { EntityEventType, EntityEvent } from "../../entityEvent";

export class WebEntityController extends EntityController {
    // domain properties
    private _webEntity: IWebEntity;
    private _webExtensions: Nullable<WebExtensions> = null;
    private _meshComponent: Nullable<MeshComponent> = null;

    private _cssObject: Nullable<CSS3DObject> = null;
    private _iframe: Nullable<HTMLIFrameElement> = null;
    private _externalElement: Nullable<HTMLElement> = null;
    private _isJitsi = false;

    constructor(entity: IWebEntity) {
        super(entity, WebEntityController.typeName);
        this._webEntity = entity;
    }

    static get typeName(): string {
        return "WebEntityController";
    }

    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return WebEntityController.typeName;
    }

    public get externalElement(): Nullable<HTMLElement> {
        return this._externalElement;
    }

    public set externalElement(value: Nullable<HTMLElement>) {
        this._externalElement = value;
        if (this._externalElement && this._cssObject) {
            this._cssObject.element.appendChild(this._externalElement);
        }
    }

    public onInitialize(): void {
        super.onInitialize();

        this._updateUserData();

        this._createWebPage();

        this._webEntity.onUserDataChanged?.add(this._updateUserData.bind(this));
        // this._webEntity.onColorChanged?.add(this._updateColor.bind(this));
        this._webEntity.onDimensionChanged?.add(this._updateDimensions.bind(this));
        this._webEntity.onSourceURLChanged?.add(this._updateSourceURL.bind(this));
        this._webEntity.onWebPropertiesChanged?.add(this._updateWebProperties.bind(this));
    }

    public onStart(): void {
        super.onStart();
    }

    public onUpdate(): void {
        super.onUpdate();
    }

    public onStop(): void {
        super.onStop();
        this._destroy();
    }

    protected _createMesh(): void {
        if (!this._meshComponent) {
            this._meshComponent = new MeshComponent();
            const mesh = MeshBuilder.CreatePlane("Mask-Plane", { sideOrientation: Mesh.DOUBLESIDE });
            mesh.id = this._webEntity.id;
            mesh.isPickable = true;
            mesh.material = this._createMaskingMaterial();
            // use this render group id to make sure this mesh mask avatars and other entities
            mesh.renderingGroupId = MASK_MESH_RENDER_GROUP_ID;

            this._meshComponent.mesh = mesh;
            this._gameObject?.addComponent(this._meshComponent);
        }
    }

    protected _destroyMesh(): void {
        if (this._meshComponent) {
            this._gameObject?.removeComponent(this._meshComponent.componentType);
        }
    }

    protected _destroyCSSObject(): void {
        this._cssObject?.element.remove();
    }

    protected _destroy(): void {
        this._destroyCSSObject();
        this._destroyMesh();

        if (this._isJitsi && this._webEntity.name) {
            applicationStore.removeConferenceRoom(this._webEntity.name);
            this._webExtensions = null;
        }
    }

    protected _updateDimensions(): void {
        if (this._webEntity.dimensions) {
            const scaling = EntityMapper.mapToVector3(this._webEntity.dimensions);
            if (this._meshComponent?.mesh) {
                this._meshComponent.mesh.scaling = scaling;
            }

            const width = this._webEntity.dimensions ? this._webEntity.dimensions.x * 100 : 480;
            const height = this._webEntity.dimensions ? this._webEntity.dimensions.y * 100 : 320;

            if (this._cssObject) {
                // Double the pixel density of the iframe so that its content is more appropriately sized.
                // TODO: Make this a setting that can be adjusted when the web entity is created/modified in the world editor.
                this._cssObject.element.style.width = `${width * 2}px`;
                this._cssObject.element.style.height = `${height * 2}px`;
            }
        }
    }

    public _updateSourceURL(): void {
        if (!this._iframe) {
            return;
        }

        if (this._isJitsi) {
            //
        } else if (this._webEntity.sourceUrl
            && this._iframe.src !== this._webEntity.sourceUrl) {
            this._iframe.src = this._webEntity.sourceUrl;
        }
    }

    // NOTE:
    // the color does not work in CSS3DObject
    /*
    protected _updateColor() : void {
        if (this._meshComponent?.mesh?.material) {
            const material = this._meshComponent?.mesh?.material as StandardMaterial;
            if (this._webEntity.color) {
                const color = EntityMapper.mapToColor3(this._webEntity.color);
                material.diffuseColor = color;
                material.specularColor = color;
            }

            if (this._webEntity.alpha) {
                material.alpha = this._webEntity.alpha;
            }
        }
    } */

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    protected _updateWebProperties(): void {
    }

    protected _updateUserData(): void {
        this._webExtensions = this._webEntity.userData
            ? JSON.parse(this._webEntity.userData) as WebExtensions
            : null;

        this._isJitsi = this._webExtensions?.jitsi !== undefined;
        if (this._isJitsi) {
            applicationStore.addConferenceRoom(this._webEntity);
        }
        /*
        if (this._cssObject) {
            this._cssObject.canGetFocus = !this._isJitsi;
        } */
    }

    protected _createWebPage(): void {
        this._createMesh();

        this._createCSSObject();

        this._updateDimensions();

        this._updateSourceURL();
    }

    private _jointConferenceRoom() {
        const conferenceName = this._webEntity.name || "";
        const roomName = conferenceName + "-" + this._webEntity.id;

        Renderer.getScene().onEntityEventObservable.notifyObservers(new EntityEvent(
            EntityEventType.JOIN_CONFERENCE_ROOM,
            this._webEntity, {
                name: conferenceName,
                id: roomName,
                entity: this._webEntity
            }));
    }

    protected _createCSSObject(): void {
        if (this._cssObject || !this._meshComponent?.mesh) {
            return;
        }

        const div = document.createElement("div");
        div.style.backgroundColor = "#000";
        div.style.zIndex = "1";

        if (this._isJitsi) {
            if (this._externalElement) {
                div.appendChild(this._externalElement);
            }
        } else {
            const iframe = document.createElement("iframe");
            iframe.id = this._webEntity.id;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "0px";
            iframe.allow = "camera; microphone; display-capture; autoplay; clipboard-write;";
            div.appendChild(iframe);

            this._iframe = iframe;
        }

        this._cssObject = new CSS3DObject(div, this._meshComponent.mesh);
        /*
        this._cssObject.onPickedObservable.add(() => {
            if (this._isJitsi) {
                this._jointConferenceRoom();
            }
        });
        this._cssObject.canGetFocus = !this._isJitsi; */
    }

    protected _createMaskingMaterial(): StandardMaterial {
        let material = this._scene.getMaterialByName("WebMaterial") as StandardMaterial;
        if (!material) {
            material = new StandardMaterial("WebMaterial", this._scene);
            material.backFaceCulling = false;
            material.disableColorWrite = true;
            material.disableLighting = true;
        }

        return material;
    }
}

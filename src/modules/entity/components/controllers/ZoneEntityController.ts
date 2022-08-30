//
//  ZoneEntityController.ts
//
//  Created by Nolan Huang on 18 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable new-cap */
// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { EntityController } from "./EntityController";
import { IZoneEntity } from "../../EntityInterfaces";
import { SkyboxComponent, KeyLightComponent, HazeComponent } from "../components";
import { AmbientLightComponent } from "@Base/modules/object";
import { AssetUrl } from "../../builders";

import {
    HemisphericLight, Vector3, DefaultRenderingPipeline, CubeTexture, HDRCubeTexture
} from "@babylonjs/core";

type EnvironmentSettings = {
    environmentTexture?: string | undefined,
};

type glowLayerSettings = {
    blurKernelSize?: number | undefined,
    intensity?: number | undefined
};

type RenderingPipelineSettings = {
    fxaaEnabled?: boolean | undefined,
    glowLayerEnabled?: boolean | undefined,
    glowLayer?: glowLayerSettings | undefined
};

type ZoneExtensions = {
    environment?: EnvironmentSettings | undefined,
    renderingPipeline?: RenderingPipelineSettings | undefined,
};

export class ZoneEntityController extends EntityController {
    // domain properties
    _zoneEntity : IZoneEntity;

    _skybox : Nullable<SkyboxComponent> = undefined;
    _ambientLight : Nullable<AmbientLightComponent> = undefined;
    _keyLight : Nullable<KeyLightComponent> = undefined;
    _haze : Nullable<HazeComponent> = undefined;

    constructor(entity : IZoneEntity) {
        super(entity, ZoneEntityController.typeName);
        this._zoneEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return ZoneEntityController.typeName;
    }

    static get typeName(): string {
        return "ZoneEntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {
        super.onInitialize();

        this._zoneEntity.onShapeTypeChanged?.add(this._handleShapeTypeChanged.bind(this));
        this._zoneEntity.onSkyboxPropertiesChanged?.add(this.updateSkybox.bind(this));
        this._zoneEntity.onAmbientLightPropertiesChanged?.add(this.updateAmbientLight.bind(this));
        this._zoneEntity.onKeyLightPropertiesChanged?.add(this.updateKeyLight.bind(this));
        this._zoneEntity.onHazePropertiesChanged?.add(this.updateHaze.bind(this));
        this._zoneEntity.onUserDataChanged?.add(this._updateUserData.bind(this));

        // this._zoneEntity.onDimensionChanged?.add(this._handleLightPropertiesChanged.bind(this));
    }

    public onStart(): void {
        super.onStart();
        this.updateSkybox();
        this.updateAmbientLight();
        this.updateKeyLight();
        this.updateHaze();
        this._updateUserData();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }

    private _handleShapeTypeChanged(): void {
        // eslint-disable-next-line no-empty
        if (this._gameObject) {

        }
    }

    public updateSkybox() : void {
        if (this._zoneEntity.skyboxMode === "enabled" && this._zoneEntity.skybox && this._gameObject) {
            if (!this._skybox) {
                this._skybox = new SkyboxComponent(this._zoneEntity.skybox, this._gameObject.getScene(), this._zoneEntity.id);
                this._gameObject.addComponent(this._skybox);
            }
            this._skybox.update(this._zoneEntity.skybox);
            this._skybox.enable = true;
        } else if (this._skybox) {
            this._skybox.enable = false;
        }
    }

    public updateAmbientLight() :void {
        if (this._zoneEntity.ambientLightMode === "enabled" && this._zoneEntity.ambientLight && this._gameObject) {
            if (!this._ambientLight) {
                this._ambientLight = new AmbientLightComponent(
                    new HemisphericLight("AmbientLight", Vector3.Up(), this._gameObject.getScene()));
                this._gameObject.addComponent(this._ambientLight);
            }

            this._ambientLight.light.setEnabled(true);
            if (this._zoneEntity.ambientLight.ambientIntensity) {
                this._ambientLight.light.intensity = this._zoneEntity.ambientLight.ambientIntensity;
            }

        } else if (this._ambientLight) {
            this._ambientLight.light.setEnabled(false);
        }
    }

    public updateKeyLight() : void {
        if (this._zoneEntity.keyLightMode === "enabled" && this._zoneEntity.keyLight && this._gameObject) {
            if (!this._keyLight) {
                this._keyLight = new KeyLightComponent(this._zoneEntity.keyLight, this._gameObject.getScene());
                this._gameObject.addComponent(this._keyLight);
            }
            this._keyLight.update(this._zoneEntity.keyLight);
            this._keyLight.enable = true;
        } else if (this._keyLight) {
            this._keyLight.enable = false;
        }
    }

    public updateHaze() : void {
        if (this._zoneEntity.hazeMode === "enabled" && this._zoneEntity.haze && this._gameObject) {
            if (!this._haze) {
                this._haze = new HazeComponent(this._zoneEntity.haze, this._gameObject.getScene());
                this._gameObject.addComponent(this._haze);
            }
            this._haze.update(this._zoneEntity.haze);
            this._haze.enable = true;
        } else if (this._haze) {
            this._haze.enable = false;
        }
    }

    protected _updateUserData() : void {
        if (this._zoneEntity.userData) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const userData = JSON.parse(this._zoneEntity.userData) as ZoneExtensions;

            if (userData.environment && userData.environment.environmentTexture) {
                if (this._scene.environmentTexture
                    && this._scene.environmentTexture.name !== userData.environment.environmentTexture) {
                    this._scene.environmentTexture.dispose();
                }

                const url = new AssetUrl(userData.environment.environmentTexture);

                if (url.fileExtension === "hdr") {
                    this._scene.environmentTexture = new HDRCubeTexture(userData.environment.environmentTexture,
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                        this._scene, 512, false, true, false, true);

                } else if (url.fileExtension === "env") {
                    this._scene.environmentTexture = new CubeTexture(userData.environment.environmentTexture, this._scene);
                }


            }

            if (userData.renderingPipeline) {
                let defaultPipeline = this._scene.postProcessRenderPipelineManager.supportedPipelines
                    .find((value) => value.name === "default") as DefaultRenderingPipeline;
                if (!defaultPipeline) {
                    defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
                }

                if (userData.renderingPipeline.fxaaEnabled !== undefined) {
                    defaultPipeline.fxaaEnabled = userData.renderingPipeline.fxaaEnabled;
                }

                if (userData.renderingPipeline.glowLayerEnabled !== undefined) {
                    defaultPipeline.glowLayerEnabled = userData.renderingPipeline.glowLayerEnabled;
                }

                const glowLayer = userData.renderingPipeline.glowLayer;
                if (glowLayer && defaultPipeline.glowLayer) {
                    if (glowLayer.blurKernelSize) {
                        defaultPipeline.glowLayer.blurKernelSize = glowLayer.blurKernelSize;
                    }

                    if (glowLayer.intensity) {
                        defaultPipeline.glowLayer.intensity = glowLayer.intensity;
                    }
                }
            }
        }
    }
}
